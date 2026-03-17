import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Export metrics to CSV
export const exportMetricsCSV = async (req, res) => {
  try {
    const metrics = await prisma.metric.findMany({
      include: {
        metricLinks: {
          include: {
            source: true,
            department: true,
            storage: true
          }
        },
        standards: {
          include: {
            standard: true
          }
        }
      }
    });

    // Build CSV header
    const headers = [
      'ID',
      'Name',
      'Category',
      'Subcategory',
      'Scope',
      'Definition',
      'Unit',
      'Status',
      'Standards',
      'Department',
      'Source',
      'Storage',
      'Quality Score',
      'Completeness',
      'Accuracy',
      'Timeliness',
      'Last Updated',
      'Issues'
    ];

    // Build CSV rows
    const rows = [];
    metrics.forEach(metric => {
      metric.metricLinks.forEach(link => {
        const standardNames = metric.standards.map(ms => ms.standard.name).join('; ');
        rows.push([
          metric.id,
          metric.name,
          metric.category,
          metric.subcategory || '',
          metric.scope || '',
          metric.definition || '',
          metric.unit || '',
          metric.status,
          standardNames,
          link.department?.name || '',
          link.source?.name || '',
          link.storage?.locationName || '',
          link.qualityScore || '',
          link.completeness || '',
          link.accuracy || '',
          link.timeliness || '',
          link.lastUpdate ? link.lastUpdate.toISOString().split('T')[0] : '',
          link.issues || ''
        ]);
      });

      // If no links, still add metric row
      if (metric.metricLinks.length === 0) {
        const standardNames = metric.standards.map(ms => ms.standard.name).join('; ');
        rows.push([
          metric.id,
          metric.name,
          metric.category,
          metric.subcategory || '',
          metric.scope || '',
          metric.definition || '',
          metric.unit || '',
          metric.status,
          standardNames,
          '', '', '', '', '', '', '', '', ''
        ]);
      }
    });

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        // Escape quotes and wrap in quotes if needed
        const cellStr = String(cell || '');
        return cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')
          ? `"${cellStr.replace(/"/g, '""')}"` 
          : cellStr;
      }).join(','))
    ].join('\n');

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="esg-metrics-export.csv"');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export metrics', message: error.message });
  }
};

// Export ESG Data Landscape JSON
export const exportDataLandscape = async (req, res) => {
  try {
    const metrics = await prisma.metric.findMany({
      include: {
        metricLinks: {
          include: {
            source: true,
            department: true,
            storage: true
          }
        },
        standards: {
          include: {
            standard: true
          }
        }
      }
    });

    const sources = await prisma.dataSource.findMany();
    const departments = await prisma.department.findMany();
    const standards = await prisma.standard.findMany();

    const landscape = {
      exportDate: new Date().toISOString(),
      summary: {
        totalMetrics: metrics.length,
        totalSources: sources.length,
        totalDepartments: departments.length,
        totalStandards: standards.length,
        metricsByCategory: {
          E: metrics.filter(m => m.category === 'E').length,
          S: metrics.filter(m => m.category === 'S').length,
          G: metrics.filter(m => m.category === 'G').length
        },
        metricsByStatus: {
          COLLECTED: metrics.filter(m => m.status === 'COLLECTED').length,
          PARTIAL: metrics.filter(m => m.status === 'PARTIAL').length,
          IN_PROGRESS: metrics.filter(m => m.status === 'IN_PROGRESS').length,
          PLANNED: metrics.filter(m => m.status === 'PLANNED').length,
          NOT_COLLECTED: metrics.filter(m => m.status === 'NOT_COLLECTED').length
        }
      },
      metrics: metrics.map(m => ({
        id: m.id,
        name: m.name,
        category: m.category,
        subcategory: m.subcategory,
        scope: m.scope,
        definition: m.definition,
        unit: m.unit,
        status: m.status,
        standards: m.standards.map(ms => ({ name: ms.standard.name, code: ms.standard.code })),
        sources: m.metricLinks.map(link => ({
          sourceName: link.source?.name,
          departmentName: link.department?.name,
          storageName: link.storage?.locationName,
          qualityScore: link.qualityScore,
          completeness: link.completeness,
          accuracy: link.accuracy,
          timeliness: link.timeliness,
          lastUpdate: link.lastUpdate
        }))
      })),
      sources,
      departments,
      standards
    };

    res.json(landscape);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export landscape', message: error.message });
  }
};

// Export data as JSON (for backup/import)
export const exportDataJSON = async (req, res) => {
  try {
    const [metrics, sources, departments, storage, standards, users] = await Promise.all([
      prisma.metric.findMany({ include: { standards: true, metricLinks: true } }),
      prisma.dataSource.findMany(),
      prisma.department.findMany(),
      prisma.storageLocation.findMany(),
      prisma.standard.findMany(),
      prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, active: true } })
    ]);

    const data = {
      exportDate: new Date().toISOString(),
      metrics,
      sources,
      departments,
      storage,
      standards,
      users: users.map(u => ({ ...u, password: undefined }))
    };

    res.header('Content-Type', 'application/json');
    res.header('Content-Disposition', 'attachment; filename="esg-data-backup.json"');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export data', message: error.message });
  }
};
