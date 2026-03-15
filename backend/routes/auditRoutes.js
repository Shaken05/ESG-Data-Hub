import express from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/', authMiddleware, adminOnly, getAuditLogs);
export default router;
