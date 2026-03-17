import express from 'express';
import * as analyticsController from '../controllers/analyticsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET data gaps analysis
router.get('/gaps', analyticsController.getDataGaps);

// GET standard coverage
router.get('/standard-coverage', analyticsController.getStandardCoverage);

// GET quality statistics
router.get('/quality-stats', analyticsController.getQualityStats);

export default router;
