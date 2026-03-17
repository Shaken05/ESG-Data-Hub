import express from 'express';
import * as auditController from '../controllers/auditController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET all audit logs (admin only)
router.get('/', auditController.getAuditLogs);

// GET activity summary (admin only)
router.get('/summary', auditController.getActivitySummary);

// GET audit log for specific entity
router.get('/:entity/:entityId', auditController.getEntityAuditLog);

export default router;
