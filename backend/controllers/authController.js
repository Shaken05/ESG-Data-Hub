import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dns from 'dns/promises';
import net from 'net';
import { sendPasswordResetEmail } from '../lib/emailService.js';

export const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '7d';

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const isValidEmail = (email) => emailRegex.test(email)
export const isKbtuEmail = (email) => /@kbtu\.kz$/i.test(email)

export const verifyEmailDomain = async (email) => {
  if (!isValidEmail(email)) return false;

  if (process.env.SKIP_EMAIL_DOMAIN_CHECK === 'true') {
    return true;
  }

  const domain = email.split('@')[1].toLowerCase();

  try {
    const mx = await dns.resolveMx(domain);
    if (mx && mx.length > 0) {
      return true;
    }
  } catch (_) {
    // ignore and fallback
  }

  try {
    const a = await dns.resolve4(domain);
    if (a && a.length > 0) {
      return true;
    }
  } catch (_) {
    // ignore
  }

  try {
    const aaaa = await dns.resolve6(domain);
    if (aaaa && aaaa.length > 0) {
      return true;
    }
  } catch (_) {
    // ignore
  }

  return false;
};

export const verifySmtpRecipient = async (email, timeout = 6000) => {
  if (!isValidEmail(email)) return false;

  const domain = email.split('@')[1].toLowerCase();

  const mxRecords = await dns.resolveMx(domain).catch(() => []);
  if (!mxRecords || mxRecords.length === 0) {
    return false;
  }

  // sort by priority low-to-high
  mxRecords.sort((a, b) => a.priority - b.priority);

  for (const mx of mxRecords) {
    try {
      const socket = net.connect(25, mx.exchange);
      socket.setTimeout(timeout);

      const readLine = () => new Promise((resolve, reject) => {
        let data = '';
        const onData = (chunk) => {
          data += chunk.toString();
          if (data.endsWith('\r\n')) {
            socket.removeListener('data', onData);
            resolve(data);
          }
        };
        socket.on('data', onData);
        socket.once('error', reject);
        socket.once('timeout', () => reject(new Error('timeout')));
      });

      const send = (cmd) => new Promise((resolve, reject) => {
        socket.write(cmd + '\r\n', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      await readLine();
      await send(`EHLO localhost`);
      await readLine();
      await send(`MAIL FROM:<no-reply@kbtu.kz>`);
      await readLine();
      await send(`RCPT TO:<${email}>`);
      const rcptResponse = await readLine();

      await send('QUIT');
      socket.end();

      if (/^\d{3}\s/.test(rcptResponse) && !rcptResponse.startsWith('550')) {
        return true;
      }
    } catch (err) {
      continue;
    }
  }

  return false;
};

export const verifyEmailMailbox = async (email) => {
  if (!isValidEmail(email)) return false;

  const domainOk = await verifyEmailDomain(email);
  if (!domainOk) return false;

  if (process.env.SKIP_EMAIL_SMTP_CHECK === 'true') {
    return true;
  }

  const smtpCheck = process.env.VERIFY_EMAIL_SMTP !== 'false';
  if (smtpCheck) {
    return await verifySmtpRecipient(email);
  }

  return true;
};

// Hash password
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare password
export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};
// Public registration (kbtu.kz only)
export const registerPublic = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password and name are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!isKbtuEmail(email)) {
      return res.status(400).json({ error: 'Registration allowed only for @kbtu.kz email addresses' });
    }

    // Email mailbox verification temporarily disabled
    // const mailboxOk = await verifyEmailMailbox(email);
    // if (!mailboxOk) {
    //   return res.status(400).json({ error: 'Email address does not exist' });
    // }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'viewer',
        active: true
      },
      select: { id: true, email: true, name: true, role: true }
    });

    return res.status(201).json({ message: 'Registration successful. Please check your email for confirmation steps (if configured).', user });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to register user', message: error.message });
  }
};

// Admin creates a user (any role)
export const createUser = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can create users' });
    }

    const { email, password, name, role } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password and name are required' });
    }

    if (!isValidEmail(email) || !isKbtuEmail(email)) {
      return res.status(400).json({ error: 'Email must be a valid @kbtu.kz address' });
    }

    // Email mailbox verification temporarily disabled
    // const mailboxOk = await verifyEmailMailbox(email);
    // if (!mailboxOk) {
    //   return res.status(400).json({ error: 'Email address does not exist' });
    // }

    const validRoles = ['admin', 'editor', 'viewer'];
    const userRole = role && validRoles.includes(role) ? role : 'viewer';

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: userRole,
        active: true,
      },
      select: { id: true, email: true, name: true, role: true, active: true }
    });

    return res.status(201).json({ message: 'User created by admin', user });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create user', message: error.message });
  }
};
// Register new user (admin only)
export const register = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can register new users' });
    }
    
    const { email, password, name, role } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (!isValidEmail(email) || !isKbtuEmail(email)) {
      return res.status(400).json({ error: 'Email must be a valid @kbtu.kz address' });
    }

    const mailboxOk = await verifyEmailMailbox(email);
    if (!mailboxOk) {
      return res.status(400).json({ error: 'Email address does not exist' });
    }
    
    const validRoles = ['admin', 'editor', 'viewer'];
    const userRole = role && validRoles.includes(role) ? role : 'viewer';
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: userRole
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });
    
    res.status(201).json({
      message: 'User registered successfully by admin',
      user
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user', message: error.message });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    if (!user.active) {
      return res.status(401).json({ error: 'User account is inactive' });
    }
    
    // Compare password
    const passwordMatch = await comparePassword(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate token
    const token = generateToken(user.id);
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to login', message: error.message });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId; // Set by auth middleware
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user', message: error.message });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can view all users' });
    }
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true
      }
    });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get users', message: error.message });
  }
};

export const checkEmail = async (req, res) => {
  try {
    const email = req.query.email
    if (!email) {
      return res.status(400).json({ error: 'Email query parameter is required' })
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    if (!isKbtuEmail(email)) {
      return res.status(400).json({ error: 'Registration allowed only for @kbtu.kz email addresses' })
    }

    // Email mailbox verification temporarily disabled
    // const mailboxOk = await verifyEmailMailbox(email);
    // if (!mailboxOk) {
    //   return res.status(400).json({ error: 'Email address does not exist' });
    // }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    return res.json({ valid: true, available: !existingUser });
  } catch (error) {
    return res.status(500).json({ error: 'Email validation failed', message: error.message })
  }
};

// Update user role (admin only)
export const updateUserRole = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can update user roles' });
    }
    
    const { id } = req.params;
    const { role } = req.body;
    
    const validRoles = ['admin', 'editor', 'viewer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }
    
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });
    
    res.json({ message: 'User role updated', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user', message: error.message });
  }
};

// Deactivate user (admin only)
export const deactivateUser = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can deactivate users' });
    }

    const { id } = req.params;

    // Prevent admin from deactivating themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'You cannot deactivate your own account' });
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { active: false },
      select: {
        id: true,
        email: true,
        name: true,
        active: true
      }
    });

    res.json({ message: 'User deactivated', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to deactivate user', message: error.message });
  }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can delete users' });
    }

    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    await prisma.user.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user', message: error.message });
  }
};

// Request password reset (public endpoint - no auth required)
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user exists (but don't reveal if they don't)
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      // Return success anyways for security (don't reveal if email exists)
      return res.json({ 
        message: 'If an account with this email exists, a reset code has been sent to that email.',
        code: null
      });
    }

    // Generate a temporary reset code (6-digit number)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store reset code on user
    await prisma.user.update({
      where: { email },
      data: {
        resetCode: resetCode,
        resetCodeExpiry: resetCodeExpiry
      }
    });

    // Send email with reset code
    const emailSent = await sendPasswordResetEmail(email, resetCode);

    // In production, don't send code in response
    // In development, include it for testing
    const isDev = process.env.NODE_ENV !== 'production';
    res.json({ 
      message: emailSent 
        ? 'Password reset code has been sent to your email. Check your inbox and spam folder.'
        : 'A reset code was generated. Please check your email. If you did not receive it, contact support.',
      code: isDev ? resetCode : undefined,
      expiryMinutes: 15
    });
  } catch (error) {
    console.error('requestPasswordReset error:', error);
    res.status(500).json({ error: 'Failed to request password reset', message: error.message });
  }
};

// Reset password using reset code (public endpoint)
export const resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ error: 'Email, reset code, and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Check if reset code is valid and not expired
    if (!user.resetCode || user.resetCode !== resetCode) {
      return res.status(400).json({ error: 'Invalid or expired reset code' });
    }

    if (new Date() > new Date(user.resetCodeExpiry)) {
      return res.status(400).json({ error: 'Reset code has expired' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset code
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetCode: null,
        resetCodeExpiry: null
      }
    });

    res.json({ message: 'Password reset successfully. Please log in with your new password.' });
  } catch (error) {
    console.error('resetPassword error:', error);
    res.status(500).json({ error: 'Failed to reset password', message: error.message });
  }
};
