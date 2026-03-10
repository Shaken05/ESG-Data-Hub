import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  getAllUsers,
  updateUserRole,
  deactivateUser
} from '../controllers/authController.js';
import authMiddleware, { adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route
router.post('/login', login);

// Protected routes - require authentication
router.get('/me', authMiddleware, getCurrentUser);

// Admin-only routes
router.post('/register', authMiddleware, adminOnly, register);
router.get('/users', authMiddleware, adminOnly, getAllUsers);
router.put('/users/:id/role', authMiddleware, adminOnly, updateUserRole);
router.put('/users/:id/deactivate', authMiddleware, adminOnly, deactivateUser);

export default router;
