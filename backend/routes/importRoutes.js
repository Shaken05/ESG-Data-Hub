import express from 'express';
import {
  importMetricsFromGoogleSheets,
  importSourcesFromGoogleSheets,
  getImportTemplate
} from '../controllers/importController.js';

const router = express.Router();

// Get import templates
router.get('/template', getImportTemplate);

// Import metrics from Google Sheets
router.post('/metrics', importMetricsFromGoogleSheets);

// Import sources from Google Sheets
router.post('/sources', importSourcesFromGoogleSheets);

export default router;
