import { PrismaClient } from '@prisma/client';
import { logAudit } from '../lib/audit.js';

const prisma = new PrismaClient();

// Get all metric links
export const getMetricLinks = async (req, res) => {
  try {
    const { metricId } = req.query;
    
    const where = metricId ? { metricId: parseInt(metricId) } : {};
    
    const links = await prisma.metricLink.findMany({
      where,
      include: {
        metric: true,
        source: true,
        department: true,
        storage: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metric links', message: error.message });
  }
};

// Get single metric link by ID
export const getMetricLinkById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const link = await prisma.metricLink.findUnique({
      where: { id: parseInt(id) },
      include: {
        metric: true,
        source: true,
        department: true,
        storage: true
      }
    });
    
    if (!link) {
      return res.status(404).json({ error: 'Metric link not found' });
    }
    
    res.json(link);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metric link', message: error.message });
  }
};

// Create new metric link
export const createMetricLink = async (req, res) => {
  try {
    const { metricId, sourceId, departmentId, storageId, qualityScore, lastUpdate, issues } = req.body;
    const link = await prisma.metricLink.create({
      data: {
        metricId,
        sourceId,
        departmentId,
        storageId,
        qualityScore,
        lastUpdate: lastUpdate ? new Date(lastUpdate) : null,
        issues
      },
      include: {
        metric: true,
        source: true,
        department: true,
        storage: true
      }
    });
    await logAudit({
      userId: req.user?.id,
      userEmail: req.user?.email,
      entityType: 'metric_link',
      entityId: link.id,
      action: 'CREATE',
      newValues: { id: link.id, metricId, sourceId, departmentId, storageId, qualityScore, lastUpdate: link.lastUpdate, issues }
    });
    res.status(201).json(link);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create metric link', message: error.message });
  }
};

// Update metric link
export const updateMetricLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { metricId, sourceId, departmentId, storageId, qualityScore, lastUpdate, issues } = req.body;
    const previous = await prisma.metricLink.findUnique({ where: { id: parseInt(id) } });
    const link = await prisma.metricLink.update({
      where: { id: parseInt(id) },
      data: {
        metricId,
        sourceId,
        departmentId,
        storageId,
        qualityScore,
        lastUpdate: lastUpdate ? new Date(lastUpdate) : null,
        issues
      },
      include: {
        metric: true,
        source: true,
        department: true,
        storage: true
      }
    });
    await logAudit({
      userId: req.user?.id,
      userEmail: req.user?.email,
      entityType: 'metric_link',
      entityId: link.id,
      action: 'UPDATE',
      oldValues: previous,
      newValues: { id: link.id, metricId: link.metricId, sourceId: link.sourceId, departmentId: link.departmentId, storageId: link.storageId, qualityScore: link.qualityScore, lastUpdate: link.lastUpdate, issues: link.issues }
    });
    res.json(link);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update metric link', message: error.message });
  }
};

// Delete metric link
export const deleteMetricLink = async (req, res) => {
  try {
    const { id } = req.params;
    const previous = await prisma.metricLink.findUnique({ where: { id: parseInt(id) } });
    await prisma.metricLink.delete({
      where: { id: parseInt(id) }
    });
    await logAudit({
      userId: req.user?.id,
      userEmail: req.user?.email,
      entityType: 'metric_link',
      entityId: parseInt(id),
      action: 'DELETE',
      oldValues: previous
    });
    res.json({ message: 'Metric link deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete metric link', message: error.message });
  }
};
