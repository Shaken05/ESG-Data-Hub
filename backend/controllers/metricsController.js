import { PrismaClient } from '@prisma/client';
import { logAction } from './auditController.js';

const prisma = new PrismaClient();

// Get all metrics with optional filters
export const getMetrics = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    
    const where = {};
    
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const metrics = await prisma.metric.findMany({
      where,
      include: {
        metricLinks: {
          include: {
            source: true,
            department: true,
            storage: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics', message: error.message });
  }
};

// Get single metric by ID
export const getMetricById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const metric = await prisma.metric.findUnique({
      where: { id: parseInt(id) },
      include: {
        metricLinks: {
          include: {
            source: true,
            department: true,
            storage: true
          }
        }
      }
    });
    
    if (!metric) {
      return res.status(404).json({ error: 'Metric not found' });
    }
    
    res.json(metric);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metric', message: error.message });
  }
};

// Create new metric (editor and admin only)
export const createMetric = async (req, res) => {
  try {
    // Check if user is editor or admin
    if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to create metrics' });
    }
    
    const { name, description, category, subcategory, scope, definition, unit, status } = req.body;
    
    const metric = await prisma.metric.create({
      data: {
        name,
        description,
        category,
        subcategory,
        scope,
        definition,
        unit,
        status: status || 'PLANNED'
      }
    });
    
    // Log action
    await logAction(req.user.id, 'CREATE', 'METRIC', metric.id, { name, category });
    
    res.status(201).json(metric);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create metric', message: error.message });
  }
};

// Update metric (editor and admin only)
export const updateMetric = async (req, res) => {
  try {
    // Check if user is editor or admin
    if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to update metrics' });
    }
    
    const { id } = req.params;
    const { name, description, category, subcategory, scope, definition, unit, status } = req.body;
    
    const metric = await prisma.metric.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        category,
        subcategory,
        scope,
        definition,
        unit,
        status
      }
    });
    
    // Log action
    await logAction(req.user.id, 'UPDATE', 'METRIC', metric.id, { name, status });
    
    res.json(metric);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update metric', message: error.message });
  }
};

// Delete metric (editor and admin only)
export const deleteMetric = async (req, res) => {
  try {
    // Check if user is editor or admin
    if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to delete metrics' });
    }
    
    const { id } = req.params;
    
    // Get metric name for logging
    const metric = await prisma.metric.findUnique({ where: { id: parseInt(id) } });
    
    await prisma.metric.delete({
      where: { id: parseInt(id) }
    });
    
    // Log action
    await logAction(req.user.id, 'DELETE', 'METRIC', parseInt(id), { name: metric?.name });
    
    res.json({ message: 'Metric deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete metric', message: error.message });
  }
};

// Get metrics statistics
export const getMetricsStats = async (req, res) => {
  try {
    const total = await prisma.metric.count();
    const byCategory = await prisma.metric.groupBy({
      by: ['category'],
      _count: true
    });
    const byStatus = await prisma.metric.groupBy({
      by: ['status'],
      _count: true
    });
    
    res.json({
      total,
      byCategory,
      byStatus
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics', message: error.message });
  }
};
