import express from 'express';
import {
  getMetrics,
  getMetricById,
  createMetric,
  updateMetric,
  deleteMetric,
  getMetricsStats
} from '../controllers/metricsController.js';

const router = express.Router();

router.get('/', getMetrics);
router.get('/stats', getMetricsStats);
router.get('/:id', getMetricById);
router.post('/', createMetric);
router.put('/:id', updateMetric);
router.delete('/:id', deleteMetric);

export default router;
