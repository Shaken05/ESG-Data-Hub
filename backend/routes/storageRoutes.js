import express from 'express';
import {
  getStorageLocations,
  getStorageLocationById,
  createStorageLocation,
  updateStorageLocation,
  deleteStorageLocation
} from '../controllers/storageController.js';

const router = express.Router();

router.get('/', getStorageLocations);
router.get('/:id', getStorageLocationById);
router.post('/', createStorageLocation);
router.put('/:id', updateStorageLocation);
router.delete('/:id', deleteStorageLocation);

export default router;
