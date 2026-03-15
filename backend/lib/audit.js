import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Log an audit entry. Call after create/update/delete.
 * @param {Object} opts
 * @param {number} [opts.userId]
 * @param {string} [opts.userEmail]
 * @param {string} opts.entityType - metric | data_source | department | storage_location | metric_link
 * @param {number} [opts.entityId]
 * @param {string} opts.action - CREATE | UPDATE | DELETE
 * @param {Object} [opts.oldValues] - serialized to JSON
 * @param {Object} [opts.newValues] - serialized to JSON
 */
export async function logAudit({ userId, userEmail, entityType, entityId, action, oldValues, newValues }) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId ?? undefined,
        userEmail: userEmail ?? undefined,
        entityType,
        entityId: entityId ?? undefined,
        action,
        oldValues: oldValues != null ? JSON.stringify(oldValues) : null,
        newValues: newValues != null ? JSON.stringify(newValues) : null
      }
    });
  } catch (err) {
    console.error('Audit log failed:', err);
  }
}

export function getUserFromReq(req) {
  return req.user ? { id: req.user.id, email: req.user.email } : null;
}
