import express from 'express';
import {
  getDataSources,
  getDataSourceById,
  createDataSource,
  updateDataSource,
  deleteDataSource
} from '../controllers/sourcesController.js';

const router = express.Router();

router.get('/', getDataSources);
router.get('/:id', getDataSourceById);
router.post('/', createDataSource);
router.put('/:id', updateDataSource);
router.delete('/:id', deleteDataSource);

export default router;
