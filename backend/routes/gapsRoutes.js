import express from 'express';
import { getGaps } from '../controllers/gapsController.js';

const router = express.Router();
router.get('/', getGaps);
export default router;
