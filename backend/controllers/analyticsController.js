import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get data gaps analysis
export const getDataGaps = async (req, res) => {
  try {
    // Analyze metrics by category and collection status
    const metrics = await prisma.metric.findMany({
      include: {
        metricLinks: {
          include: {
            department: true,
            source: true
          }
        }
      }
    });

    const analysis = {
      totalMetrics: metrics.length,
      byCategory: {
        E: { total: 0, collected: 0, partial: 0, missing: 0 },
        S: { total: 0, collected: 0, partial: 0, missing: 0 },
        G: { total: 0, collected: 0, partial: 0, missing: 0 }
      },
      byDepartment: {},
      qualityDistribution: {
        excellent: 0,  // >= 80
        good: 0,       // 60-79
        fair: 0,       // 40-59
        poor: 0        // < 40
      },
      issues: []
    };

    // Count by category and status
    metrics.forEach(metric => {
      const cat = metric.category;
      if (analysis.byCategory[cat]) {
        analysis.byCategory[cat].total++;

        if (metric.status === 'COLLECTED') {
          analysis.byCategory[cat].collected++;
        } else if (metric.status === 'PARTIAL') {
          analysis.byCategory[cat].partial++;
        } else {
          analysis.byCategory[cat].missing++;
        }
      }

      // Quality score distribution
      if (metric.metricLinks.length > 0) {
        const avgQuality = metric.metricLinks.reduce((sum, link) => {
          return sum + (link.qualityScore || 0);
        }, 0) / metric.metricLinks.length;

        if (avgQuality >= 80) analysis.qualityDistribution.excellent++;
        else if (avgQuality >= 60) analysis.qualityDistribution.good++;
        else if (avgQuality >= 40) analysis.qualityDistribution.fair++;
        else analysis.qualityDistribution.poor++;
      }

      // Department analysis
      metric.metricLinks.forEach(link => {
        if (link.department) {
          const deptName = link.department.name;
          if (!analysis.byDepartment[deptName]) {
            analysis.byDepartment[deptName] = { total: 0, collected: 0, missing: 0 };
          }
          analysis.byDepartment[deptName].total++;
          if (metric.status === 'COLLECTED') {
            analysis.byDepartment[deptName].collected++;
          } else {
            analysis.byDepartment[deptName].missing++;
          }
        }
      });

      // Track issues
      metric.metricLinks.forEach(link => {
        if (link.issueType || link.issues) {
          analysis.issues.push({
            metricName: metric.name,
            metricId: metric.id,
            issueType: link.issueType,
            description: link.issues,
            department: link.department?.name || 'Unknown'
          });
        }
      });
    });

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze data gaps', message: error.message });
  }
};

// Get metrics by standard coverage
export const getStandardCoverage = async (req, res) => {
  try {
    const standards = await prisma.standard.findMany({
      include: {
        metrics: true
      }
    });

    const coverage = standards.map(std => ({
      standardName: std.name,
      standardCode: std.code,
      metricsCount: std.metrics.length,
      coverage: `${(std.metrics.length * 100 / standards.length).toFixed(1)}%`
    }));

    res.json({
      totalStandards: standards.length,
      coverage: coverage
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get standard coverage', message: error.message });
  }
};

// Get quality score statistics
export const getQualityStats = async (req, res) => {
  try {
    const links = await prisma.metricLink.findMany({
      include: {
        metric: true,
        department: true
      }
    });

    const stats = {
      averageQuality: 0,
      averageCompleteness: 0,
      averageAccuracy: 0,
      averageTimeliness: 0,
      totalLinks: links.length,
      byDepartment: {}
    };

    let qualitySum = 0, completeSum = 0, accuracySum = 0, timelinessSum = 0;
    let qualityCount = 0, completeCount = 0, accuracyCount = 0, timelinessCount = 0;

    links.forEach(link => {
      if (link.qualityScore !== null) {
        qualitySum += link.qualityScore;
        qualityCount++;
      }
      if (link.completeness !== null) {
        completeSum += link.completeness;
        completeCount++;
      }
      if (link.accuracy !== null) {
        accuracySum += link.accuracy;
        accuracyCount++;
      }
      if (link.timeliness !== null) {
        timelinessSum += link.timeliness;
        timelinessCount++;
      }

      // Department stats
      if (link.department) {
        const deptName = link.department.name;
        if (!stats.byDepartment[deptName]) {
          stats.byDepartment[deptName] = { count: 0, avgQuality: 0 };
        }
        stats.byDepartment[deptName].count++;
        stats.byDepartment[deptName].avgQuality += link.qualityScore || 0;
      }
    });

    stats.averageQuality = qualityCount > 0 ? (qualitySum / qualityCount).toFixed(1) : 0;
    stats.averageCompleteness = completeCount > 0 ? (completeSum / completeCount).toFixed(1) : 0;
    stats.averageAccuracy = accuracyCount > 0 ? (accuracySum / accuracyCount).toFixed(1) : 0;
    stats.averageTimeliness = timelinessCount > 0 ? (timelinessSum / timelinessCount).toFixed(1) : 0;

    // Calculate department averages
    Object.keys(stats.byDepartment).forEach(deptName => {
      const dept = stats.byDepartment[deptName];
      dept.avgQuality = (dept.avgQuality / dept.count).toFixed(1);
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get quality stats', message: error.message });
  }
};
