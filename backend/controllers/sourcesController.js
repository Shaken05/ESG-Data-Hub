import { PrismaClient } from '@prisma/client';
import { logAudit } from '../lib/audit.js';

const prisma = new PrismaClient();

// Get all data sources
export const getDataSources = async (req, res) => {
  try {
    const sources = await prisma.dataSource.findMany({
      include: {
        metricLinks: {
          include: {
            metric: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    res.json(sources);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data sources', message: error.message });
  }
};

// Get single data source by ID
export const getDataSourceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const source = await prisma.dataSource.findUnique({
      where: { id: parseInt(id) },
      include: {
        metricLinks: {
          include: {
            metric: true
          }
        }
      }
    });
    
    if (!source) {
      return res.status(404).json({ error: 'Data source not found' });
    }
    
    res.json(source);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data source', message: error.message });
  }
};

// Create new data source
export const createDataSource = async (req, res) => {
  try {
    const { name, type, sourceKind, systemOrFile, format, updateFrequency } = req.body;
    const source = await prisma.dataSource.create({
      data: {
        name,
        type,
        sourceKind: sourceKind || null,
        systemOrFile: systemOrFile || null,
        format,
        updateFrequency
      }
    });
    await logAudit({
      userId: req.user?.id,
      userEmail: req.user?.email,
      entityType: 'data_source',
      entityId: source.id,
      action: 'CREATE',
      newValues: source
    });
    res.status(201).json(source);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create data source', message: error.message });
  }
};

// Update data source
export const updateDataSource = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, sourceKind, systemOrFile, format, updateFrequency } = req.body;
    const previous = await prisma.dataSource.findUnique({ where: { id: parseInt(id) } });
    const source = await prisma.dataSource.update({
      where: { id: parseInt(id) },
      data: {
        name,
        type,
        sourceKind: sourceKind !== undefined ? sourceKind || null : undefined,
        systemOrFile: systemOrFile !== undefined ? systemOrFile || null : undefined,
        format,
        updateFrequency
      }
    });
    await logAudit({
      userId: req.user?.id,
      userEmail: req.user?.email,
      entityType: 'data_source',
      entityId: source.id,
      action: 'UPDATE',
      oldValues: previous,
      newValues: source
    });
    res.json(source);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update data source', message: error.message });
  }
};

// Delete data source
export const deleteDataSource = async (req, res) => {
  try {
    const { id } = req.params;
    const previous = await prisma.dataSource.findUnique({ where: { id: parseInt(id) } });
    await prisma.dataSource.delete({
      where: { id: parseInt(id) }
    });
    await logAudit({
      userId: req.user?.id,
      userEmail: req.user?.email,
      entityType: 'data_source',
      entityId: parseInt(id),
      action: 'DELETE',
      oldValues: previous
    });
    res.json({ message: 'Data source deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete data source', message: error.message });
  }
};
