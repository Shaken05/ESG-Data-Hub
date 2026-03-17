import express from 'express';
import * as standardsController from '../controllers/standardsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET all standards
router.get('/', standardsController.getAllStandards);

// GET single standard
router.get('/:id', standardsController.getStandardById);

// POST create standard (editor/admin only)
router.post('/', standardsController.createStandard);

// PUT update standard (editor/admin only)
router.put('/:id', standardsController.updateStandard);

// DELETE standard (admin only)
router.delete('/:id', standardsController.deleteStandard);

export default router;
