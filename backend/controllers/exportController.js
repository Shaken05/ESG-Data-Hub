import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

const prisma = new PrismaClient();

// Build where clause for metrics (same logic as metricsController, SQLite-safe)
function buildMetricsWhere(query) {
  const where = {};
  if (query.category) where.category = query.category;
  if (query.status) where.status = query.status;
  if (query.search && query.search.trim()) {
    const term = query.search.trim();
    where.OR = [
      { name: { contains: term } },
      { description: { contains: term } }
    ];
  }
  return where;
}

// Flatten metric with its links into rows (one row per link, or one row per metric if no links)
function metricToRows(metric) {
  const links = metric.metricLinks || [];
  const standardsStr = metric.standards ? (typeof metric.standards === 'string' ? metric.standards : JSON.stringify(metric.standards)) : (metric.standard || '');
  if (links.length === 0) {
    return [{
      name: metric.name,
      description: metric.description || '',
      category: metric.category,
      scope: metric.scope || '',
      subcategory: metric.subcategory || '',
      unit: metric.unit || '',
      standard: standardsStr,
      status: metric.status,
      source: '',
      department: '',
      storage: '',
      qualityScore: '',
      lastUpdate: '',
      issues: ''
    }];
  }
  return links.map(link => ({
    name: metric.name,
    description: metric.description || '',
    category: metric.category,
    scope: metric.scope || '',
    subcategory: metric.subcategory || '',
    unit: metric.unit || '',
    standard: standardsStr,
    status: metric.status,
    source: link.source ? link.source.name : '',
    department: link.department ? link.department.name : '',
    storage: link.storage ? link.storage.locationName : '',
    qualityScore: link.qualityScore != null ? String(link.qualityScore) : '',
    lastUpdate: link.lastUpdate ? link.lastUpdate.toISOString().slice(0, 10) : '',
    issues: link.issues || ''
  }));
}

/**
 * Export metrics to Excel (with filters)
 */
export const exportMetricsExcel = async (req, res) => {
  try {
    const where = buildMetricsWhere(req.query);
    const metrics = await prisma.metric.findMany({
      where,
      include: {
        metricLinks: {
          include: { source: true, department: true, storage: true }
        }
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ESG Data Inventory';
    const sheet = workbook.addWorksheet('Metrics', { headerRows: 1 });

    const columns = [
      { header: 'Name', key: 'name', width: 28 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Category', key: 'category', width: 10 },
      { header: 'Scope', key: 'scope', width: 10 },
      { header: 'Subcategory', key: 'subcategory', width: 16 },
      { header: 'Unit', key: 'unit', width: 12 },
      { header: 'Standard(s)', key: 'standard', width: 18 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Data Source', key: 'source', width: 22 },
      { header: 'Department', key: 'department', width: 22 },
      { header: 'Storage', key: 'storage', width: 18 },
      { header: 'Quality Score', key: 'qualityScore', width: 12 },
      { header: 'Last Update', key: 'lastUpdate', width: 12 },
      { header: 'Issues', key: 'issues', width: 25 }
    ];
    sheet.columns = columns;
    sheet.getRow(1).font = { bold: true };

    const rows = metrics.flatMap(metricToRows);
    sheet.addRows(rows);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="esg-metrics-export.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export Excel error:', error);
    res.status(500).json({ error: 'Export failed', message: error.message });
  }
};

/**
 * Export metrics to CSV (with filters)
 */
export const exportMetricsCsv = async (req, res) => {
  try {
    const where = buildMetricsWhere(req.query);
    const metrics = await prisma.metric.findMany({
      where,
      include: {
        metricLinks: {
          include: { source: true, department: true, storage: true }
        }
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    });

    const rows = metrics.flatMap(metricToRows);
    const headers = ['Name', 'Description', 'Category', 'Scope', 'Subcategory', 'Unit', 'Standard(s)', 'Status', 'Data Source', 'Department', 'Storage', 'Quality Score', 'Last Update', 'Issues'];

    function escapeCsv(val) {
      const s = String(val ?? '');
      if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
      return s;
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(r => [r.name, r.description, r.category, r.scope, r.subcategory, r.unit, r.standard, r.status, r.source, r.department, r.storage, r.qualityScore, r.lastUpdate, r.issues].map(escapeCsv).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="esg-metrics-export.csv"`);
    res.send('\uFEFF' + csvContent); // BOM for Excel UTF-8
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ error: 'Export failed', message: error.message });
  }
};

/**
 * Export ESG Data Landscape PDF report
 */
export const exportMetricsPdf = async (req, res) => {
  try {
    const where = buildMetricsWhere(req.query);
    const metrics = await prisma.metric.findMany({
      where,
      include: {
        metricLinks: {
          include: { source: true, department: true, storage: true }
        }
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    });

    const year = new Date().getFullYear();
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ESG-Data-Landscape-${year}.pdf"`);
    doc.pipe(res);

    doc.fontSize(18).font('Helvetica-Bold').text(`ESG Data Landscape ${year}`, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text('Summary of metrics, statuses and responsible parties', { align: 'center' });
    doc.moveDown(1);

    const rows = metrics.flatMap(metricToRows);
    const tableTop = doc.y;
    const colWidths = { name: 90, category: 28, status: 38, department: 95, source: 95, qualityScore: 38 };
    const rowHeight = 20;
    const headers = ['Metric', 'Category', 'Status', 'Department', 'Data Source', 'Quality'];
    let y = tableTop;

    doc.font('Helvetica-Bold').fontSize(9);
    doc.rect(50, y, 495, rowHeight).fillAndStroke('#e5e7eb', '#000');
    doc.fillColor('#000').text(headers[0], 55, y + 6, { width: colWidths.name - 6 });
    doc.text(headers[1], 55 + colWidths.name, y + 6, { width: colWidths.category - 4 });
    doc.text(headers[2], 55 + colWidths.name + colWidths.category, y + 6, { width: colWidths.status - 4 });
    doc.text(headers[3], 55 + colWidths.name + colWidths.category + colWidths.status, y + 6, { width: colWidths.department - 4 });
    doc.text(headers[4], 55 + colWidths.name + colWidths.category + colWidths.status + colWidths.department, y + 6, { width: colWidths.source - 4 });
    doc.text(headers[5], 55 + colWidths.name + colWidths.category + colWidths.status + colWidths.department + colWidths.source, y + 6, { width: colWidths.qualityScore - 4 });
    y += rowHeight;

    doc.font('Helvetica').fillColor('#000');
    for (let i = 0; i < rows.length; i++) {
      if (y > 750) {
        doc.addPage();
        y = 50;
        doc.rect(50, y, 495, rowHeight).fillAndStroke('#e5e7eb', '#000');
        doc.font('Helvetica-Bold').text(headers[0], 55, y + 6, { width: colWidths.name - 6 });
        doc.text(headers[1], 55 + colWidths.name, y + 6, { width: colWidths.category - 4 });
        doc.text(headers[2], 55 + colWidths.name + colWidths.category, y + 6, { width: colWidths.status - 4 });
        doc.text(headers[3], 55 + colWidths.name + colWidths.category + colWidths.status, y + 6, { width: colWidths.department - 4 });
        doc.text(headers[4], 55 + colWidths.name + colWidths.category + colWidths.status + colWidths.department, y + 6, { width: colWidths.source - 4 });
        doc.text(headers[5], 55 + colWidths.name + colWidths.category + colWidths.status + colWidths.department + colWidths.source, y + 6, { width: colWidths.qualityScore - 4 });
        y += rowHeight;
        doc.font('Helvetica');
      }
      const r = rows[i];
      const nameTrunc = (r.name || '').slice(0, 35);
      doc.rect(50, y, 495, rowHeight).stroke();
      doc.text(nameTrunc, 55, y + 6, { width: colWidths.name - 6 });
      doc.text(r.category || '', 55 + colWidths.name, y + 6, { width: colWidths.category - 4 });
      doc.text(r.status || '', 55 + colWidths.name + colWidths.category, y + 6, { width: colWidths.status - 4 });
      doc.text((r.department || '').slice(0, 22), 55 + colWidths.name + colWidths.category + colWidths.status, y + 6, { width: colWidths.department - 4 });
      doc.text((r.source || '').slice(0, 22), 55 + colWidths.name + colWidths.category + colWidths.status + colWidths.department, y + 6, { width: colWidths.source - 4 });
      doc.text(r.qualityScore || '-', 55 + colWidths.name + colWidths.category + colWidths.status + colWidths.department + colWidths.source, y + 6, { width: colWidths.qualityScore - 4 });
      y += rowHeight;
    }

    doc.moveDown(2);
    doc.fontSize(9).fillColor('#666').text(`Generated on ${new Date().toISOString().slice(0, 10)}. Total metrics: ${metrics.length}, rows: ${rows.length}.`, { align: 'center' });
    doc.end();
  } catch (error) {
    console.error('Export PDF error:', error);
    if (!res.headersSent) res.status(500).json({ error: 'Export failed', message: error.message });
  }
};

/**
 * Export data sources to Excel
 */
export const exportSourcesExcel = async (req, res) => {
  try {
    const sources = await prisma.dataSource.findMany({ orderBy: { name: 'asc' } });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Data Sources', { headerRows: 1 });
    sheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Type', key: 'type', width: 14 },
      { header: 'Format', key: 'format', width: 18 },
      { header: 'Update Frequency', key: 'updateFrequency', width: 20 }
    ];
    sheet.getRow(1).font = { bold: true };
    sheet.addRows(sources.map(s => ({ name: s.name, type: s.type, format: s.format || '', updateFrequency: s.updateFrequency || '' })));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="esg-sources-export.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export sources Excel error:', error);
    res.status(500).json({ error: 'Export failed', message: error.message });
  }
};

/**
 * Export data sources to CSV
 */
export const exportSourcesCsv = async (req, res) => {
  try {
    const sources = await prisma.dataSource.findMany({ orderBy: { name: 'asc' } });
    const headers = ['Name', 'Type', 'Format', 'Update Frequency'];
    const escape = (v) => (String(v ?? '').includes(',') || String(v ?? '').includes('"') ? `"${String(v).replace(/"/g, '""')}"` : String(v ?? ''));
    const csv = [headers.join(','), ...sources.map(s => [s.name, s.type, s.format || '', s.updateFrequency || ''].map(escape).join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="esg-sources-export.csv"');
    res.send('\uFEFF' + csv);
  } catch (error) {
    console.error('Export sources CSV error:', error);
    res.status(500).json({ error: 'Export failed', message: error.message });
  }
};

/**
 * Export departments to Excel
 */
export const exportDepartmentsExcel = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Departments', { headerRows: 1 });
    sheet.columns = [
      { header: 'Name', key: 'name', width: 28 },
      { header: 'Owner', key: 'owner', width: 22 },
      { header: 'Email', key: 'email', width: 28 }
    ];
    sheet.getRow(1).font = { bold: true };
    sheet.addRows(departments.map(d => ({ name: d.name, owner: d.owner || '', email: d.email || '' })));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="esg-departments-export.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export departments Excel error:', error);
    res.status(500).json({ error: 'Export failed', message: error.message });
  }
};

/**
 * Export departments to CSV
 */
export const exportDepartmentsCsv = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } });
    const headers = ['Name', 'Owner', 'Email'];
    const escape = (v) => (String(v ?? '').includes(',') || String(v ?? '').includes('"') ? `"${String(v).replace(/"/g, '""')}"` : String(v ?? ''));
    const csv = [headers.join(','), ...departments.map(d => [d.name, d.owner || '', d.email || ''].map(escape).join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="esg-departments-export.csv"');
    res.send('\uFEFF' + csv);
  } catch (error) {
    console.error('Export departments CSV error:', error);
    res.status(500).json({ error: 'Export failed', message: error.message });
  }
};
