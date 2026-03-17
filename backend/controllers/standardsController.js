import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all standards
export const getAllStandards = async (req, res) => {
  try {
    const standards = await prisma.standard.findMany({
      include: {
        metrics: {
          include: {
            metric: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(standards);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch standards', message: error.message });
  }
};

// Get single standard
export const getStandardById = async (req, res) => {
  try {
    const { id } = req.params;

    const standard = await prisma.standard.findUnique({
      where: { id: parseInt(id) },
      include: {
        metrics: {
          include: {
            metric: true
          }
        }
      }
    });

    if (!standard) {
      return res.status(404).json({ error: 'Standard not found' });
    }

    res.json(standard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch standard', message: error.message });
  }
};

// Create standard
export const createStandard = async (req, res) => {
  try {
    if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { name, code } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const standard = await prisma.standard.create({
      data: {
        name,
        code: code || null
      }
    });

    res.status(201).json(standard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create standard', message: error.message });
  }
};

// Update standard
export const updateStandard = async (req, res) => {
  try {
    if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { id } = req.params;
    const { name, code } = req.body;

    const standard = await prisma.standard.update({
      where: { id: parseInt(id) },
      data: {
        name: name || undefined,
        code: code || undefined
      }
    });

    res.json(standard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update standard', message: error.message });
  }
};

// Delete standard
export const deleteStandard = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete standards' });
    }

    const { id } = req.params;

    await prisma.standard.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Standard deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete standard', message: error.message });
  }
};
