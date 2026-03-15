import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get audit log entries (admin only). Query: entityType?, action?, limit?, offset?
 */
export const getAuditLogs = async (req, res) => {
  try {
    const { entityType, action, limit = '50', offset = '0' } = req.query;
    const take = Math.min(parseInt(limit, 10) || 50, 200);
    const skip = parseInt(offset, 10) || 0;

    const where = {};
    if (entityType) where.entityType = entityType;
    if (action) where.action = action;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip
      }),
      prisma.auditLog.count({ where })
    ]);

    res.json({ logs, total });
  } catch (error) {
    console.error('getAuditLogs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs', message: error.message });
  }
};
