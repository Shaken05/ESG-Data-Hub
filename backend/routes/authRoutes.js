import express from 'express';
import {
  register,
  registerPublic,
  createUser,
  checkEmail,
  login,
  getCurrentUser,
  getAllUsers,
  updateUserRole,
  deactivateUser,
  deleteUser,
  requestPasswordReset,
  resetPassword
} from '../controllers/authController.js';
import authMiddleware, { adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/register', registerPublic);
router.get('/check-email', checkEmail);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

// Protected routes - require authentication
router.get('/me', authMiddleware, getCurrentUser);

// Admin-only routes
router.post('/register-admin', authMiddleware, adminOnly, register);
router.get('/users', authMiddleware, adminOnly, getAllUsers);
router.post('/users', authMiddleware, adminOnly, createUser);
router.put('/users/:id/role', authMiddleware, adminOnly, updateUserRole);
router.put('/users/:id/deactivate', authMiddleware, adminOnly, deactivateUser);
router.delete('/users/:id', authMiddleware, adminOnly, deleteUser);

export default router;
