import express from 'express';
import {
  exportMetricsExcel,
  exportMetricsCsv,
  exportMetricsPdf,
  exportSourcesExcel,
  exportSourcesCsv,
  exportDepartmentsExcel,
  exportDepartmentsCsv
} from '../controllers/exportController.js';

const router = express.Router();

// Metrics export (supports query: category, status, search)
router.get('/metrics.xlsx', exportMetricsExcel);
router.get('/metrics.csv', exportMetricsCsv);
router.get('/metrics.pdf', exportMetricsPdf);

// Data sources export
router.get('/sources.xlsx', exportSourcesExcel);
router.get('/sources.csv', exportSourcesCsv);

// Departments export
router.get('/departments.xlsx', exportDepartmentsExcel);
router.get('/departments.csv', exportDepartmentsCsv);

export default router;
