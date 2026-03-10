import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all storage locations
export const getStorageLocations = async (req, res) => {
  try {
    const locations = await prisma.storageLocation.findMany({
      include: {
        metricLinks: {
          include: {
            metric: true
          }
        }
      },
      orderBy: { locationName: 'asc' }
    });
    
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch storage locations', message: error.message });
  }
};

// Get single storage location by ID
export const getStorageLocationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const location = await prisma.storageLocation.findUnique({
      where: { id: parseInt(id) },
      include: {
        metricLinks: {
          include: {
            metric: true
          }
        }
      }
    });
    
    if (!location) {
      return res.status(404).json({ error: 'Storage location not found' });
    }
    
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch storage location', message: error.message });
  }
};

// Create new storage location
export const createStorageLocation = async (req, res) => {
  try {
    const { locationName, type } = req.body;
    
    const location = await prisma.storageLocation.create({
      data: {
        locationName,
        type
      }
    });
    
    res.status(201).json(location);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create storage location', message: error.message });
  }
};

// Update storage location
export const updateStorageLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { locationName, type } = req.body;
    
    const location = await prisma.storageLocation.update({
      where: { id: parseInt(id) },
      data: {
        locationName,
        type
      }
    });
    
    res.json(location);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update storage location', message: error.message });
  }
};

// Delete storage location
export const deleteStorageLocation = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.storageLocation.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Storage location deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete storage location', message: error.message });
  }
};
