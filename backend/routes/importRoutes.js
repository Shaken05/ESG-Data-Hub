import express from 'express';
import multer from 'multer';
import {
  importMetricsFromGoogleSheets,
  importSourcesFromGoogleSheets,
  importMetricsManual,
  importMetricsCSV,
  addSingleMetric,
  getImportTemplate,
  getImportBatches,
  getImportBatchById
} from '../controllers/importController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get import templates
router.get('/template', getImportTemplate);

// Import metrics from Google Sheets
router.post('/metrics', importMetricsFromGoogleSheets);

// Import sources from Google Sheets
router.post('/sources', importSourcesFromGoogleSheets);

// Import metrics manually (JSON array)
router.post('/manual/metrics', importMetricsManual);

// Import metrics from CSV file
router.post('/csv/metrics', upload.single('file'), importMetricsCSV);

// Import batch metadata
router.get('/batches', getImportBatches);
router.get('/batches/:id', getImportBatchById);

// Add single metric quickly
router.post('/single', addSingleMetric);

export default router;
