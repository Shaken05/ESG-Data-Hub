import express from 'express';
import {
  getMetricLinks,
  getMetricLinkById,
  createMetricLink,
  updateMetricLink,
  deleteMetricLink
} from '../controllers/metricLinksController.js';

const router = express.Router();

router.get('/', getMetricLinks);
router.get('/:id', getMetricLinkById);
router.post('/', createMetricLink);
router.put('/:id', updateMetricLink);
router.delete('/:id', deleteMetricLink);

export default router;
