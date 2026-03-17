import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Log an action
export const logAction = async (userId, action, entity, entityId, details = null) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details: details ? JSON.stringify(details) : null
      }
    });
  } catch (error) {
    console.error('Error logging action:', error);
  }
};

// Get all audit logs (admin only)
export const getAuditLogs = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can view audit logs' });
    }

    const { entity, action, limit = 100, offset = 0 } = req.query;

    const where = {};
    if (entity) where.entity = entity;
    if (action) where.action = action;

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const total = await prisma.auditLog.count({ where });

    res.json({
      total,
      logs,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs', message: error.message });
  }
};

// Get logs for specific entity
export const getEntityAuditLog = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { entity, entityId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const logs = await prisma.auditLog.findMany({
      where: {
        entity,
        entityId: parseInt(entityId)
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entity audit log', message: error.message });
  }
};

// Get activity summary
export const getActivitySummary = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can view activity summary' });
    }

    const logs = await prisma.auditLog.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    const summary = {
      totalActions: logs.length,
      actionsByType: {},
      actionsByEntity: {},
      actionsByUser: {},
      recentActivity: logs.slice(0, 10)
    };

    logs.forEach(log => {
      // By action type
      summary.actionsByType[log.action] = (summary.actionsByType[log.action] || 0) + 1;

      // By entity type
      summary.actionsByEntity[log.entity] = (summary.actionsByEntity[log.entity] || 0) + 1;

      // By user
      const userName = log.user?.name || 'Unknown';
      summary.actionsByUser[userName] = (summary.actionsByUser[userName] || 0) + 1;
    });

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get activity summary', message: error.message });
  }
};
