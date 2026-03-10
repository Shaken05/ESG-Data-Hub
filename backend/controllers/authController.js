import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '7d';

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
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
