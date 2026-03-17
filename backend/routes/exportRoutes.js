import express from 'express';
import * as exportController from '../controllers/exportController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET metrics export as CSV
router.get('/metrics/csv', exportController.exportMetricsCSV);

// GET ESG Data Landscape as JSON
router.get('/landscape/json', exportController.exportDataLandscape);

// GET full data backup as JSON
router.get('/backup/json', exportController.exportDataJSON);

export default router;
