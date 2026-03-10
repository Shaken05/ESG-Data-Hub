import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided. Please login first.' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Fetch user with role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true, active: true }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    if (!user.active) {
      return res.status(401).json({ error: 'User account is inactive' });
    }
    
    req.userId = user.id;
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token', message: error.message });
  }
};

// Middleware to check if user is admin
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only administrators can perform this action' });
  }
  next();
};

// Middleware to check if user can edit (admin or editor)
export const editorOrAdmin = (req, res, next) => {
  if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'You do not have permission to perform this action' });
  }
  next();
};

export default authMiddleware;
