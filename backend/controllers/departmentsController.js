import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all departments
export const getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        metricLinks: {
          include: {
            metric: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch departments', message: error.message });
  }
};

// Get single department by ID
export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const department = await prisma.department.findUnique({
      where: { id: parseInt(id) },
      include: {
        metricLinks: {
          include: {
            metric: true
          }
        }
      }
    });
    
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    res.json(department);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch department', message: error.message });
  }
};

// Create new department
export const createDepartment = async (req, res) => {
  try {
    const { name, owner, email } = req.body;
    
    const department = await prisma.department.create({
      data: {
        name,
        owner,
        email
      }
    });
    
    res.status(201).json(department);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create department', message: error.message });
  }
};

// Update department
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, owner, email } = req.body;
    
    const department = await prisma.department.update({
      where: { id: parseInt(id) },
      data: {
        name,
        owner,
        email
      }
    });
    
    res.json(department);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update department', message: error.message });
  }
};

// Delete department
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.department.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete department', message: error.message });
  }
};
