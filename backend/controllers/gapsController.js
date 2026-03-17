import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get gaps matrix for heatmap: E/S/G × departments (or sources).
 * Returns rows with category, dimension (department name or source name), metricCount, avgQuality, status breakdown.
 * Query: view=department | source (default department)
 */
export const getGaps = async (req, res) => {
  try {
    const view = (req.query.view || 'department').toLowerCase();
    const byDepartment = view !== 'source';

    const metrics = await prisma.metric.findMany({
      include: {
        metricLinks: {
          include: {
            department: true,
            source: true
          }
        }
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    });

    const categories = ['E', 'S', 'G'];
    const matrix = {}; // key: `${category}|${dimName}` -> { category, dimension, metricIds: Set, totalQuality, qualityCount, statuses }

    function getOrCreate(key, category, dimension) {
      if (!matrix[key]) {
        matrix[key] = { category, dimension, metricIds: new Set(), totalQuality: 0, qualityCount: 0, statuses: {} };
      }
      return matrix[key];
    }

    for (const metric of metrics) {
      const category = metric.category;
      const links = metric.metricLinks || [];
      if (links.length === 0) {
        const dimName = '(No link)';
        const key = `${category}|${dimName}`;
        const cell = getOrCreate(key, category, dimName);
        cell.metricIds.add(metric.id);
        cell.statuses[metric.status] = (cell.statuses[metric.status] || 0) + 1;
        continue;
      }
      for (const link of links) {
        const dim = byDepartment ? link.department : link.source;
        const dimName = dim ? dim.name : '(Unassigned)';
        const key = `${category}|${dimName}`;
        const cell = getOrCreate(key, category, dimName);
        const isNewMetricInCell = !cell.metricIds.has(metric.id);
        cell.metricIds.add(metric.id);
        if (isNewMetricInCell) cell.statuses[metric.status] = (cell.statuses[metric.status] || 0) + 1;
        if (link.qualityScore != null) {
          cell.totalQuality += link.qualityScore;
          cell.qualityCount += 1;
        }
      }
    }

    const rows = Object.values(matrix).map((row) => {
      const metricCount = row.metricIds.size;
      const avgQuality = row.qualityCount > 0 ? Math.round(row.totalQuality / row.qualityCount) : null;
      const { metricIds, ...rest } = row;
      return { ...rest, metricCount, avgQuality };
    });

    const dimensions = [...new Set(rows.map((r) => r.dimension))].sort();
    res.json({
      view: byDepartment ? 'department' : 'source',
      categories,
      dimensions,
      rows
    });
  } catch (error) {
    console.error('getGaps error:', error);
    res.status(500).json({ error: 'Failed to fetch gaps data', message: error.message });
  }
};
