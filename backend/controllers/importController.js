import { PrismaClient } from '@prisma/client';
import { logAction } from './auditController.js';
import https from 'https';
import { URL } from 'url';

const prisma = new PrismaClient();

// Helper function to fetch Google Sheets data as CSV
const fetchGoogleSheetCSV = (url) => {
  // support local proxy via environment (e.g. HTTP_PROXY/HTTPS_PROXY)
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(url);
      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers: {
          'User-Agent': 'ESG-Data-Inventory/1.0',
          'Accept': 'text/csv'
        },
        timeout: 20000
      };

      const req = https.request(options, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          return reject(new Error(`Google Sheets returned ${res.statusCode}`));
        }

        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve(data));
      });

      req.on('error', (err) => reject(err));
      req.on('timeout', () => {
        req.destroy(new Error('Timeout when fetching Google Sheets URL'));
      });
      req.end();
    } catch (err) {
      reject(err);
    }
  });
};

// Convert Google Sheets URL to CSV export URL
const convertToCSVUrl = (url) => {
  // Example: https://docs.google.com/spreadsheets/d/SHEET_ID/edit
  // Convert to: https://docs.google.com/spreadsheets/d/SHEET_ID/export?format=csv
  const sheetIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!sheetIdMatch) {
    throw new Error('Invalid Google Sheets URL');
  }
  const sheetId = sheetIdMatch[1];
  
  // Check if there's a specific gid (sheet tab)
  const gidMatch = url.match(/[#&]gid=([0-9]+)/);
  const gid = gidMatch ? `&gid=${gidMatch[1]}` : '';
  
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gid}`;
};

// Parse CSV data
const parseCSV = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }
  
  return rows;
};

// Convert an import row with arbitrary keys into a Metric model-friendly object
const getMetricDataFromRow = (row, index) => {
  const normalized = {};
  for (const [key, value] of Object.entries(row || {})) {
    const trimmed = String(key || '').trim();
    if (trimmed) normalized[trimmed.toLowerCase()] = value;
  }

  const pick = (keys) => {
    for (const key of keys) {
      if (normalized[key] !== undefined && normalized[key] !== null && String(normalized[key]).trim() !== '') {
        return String(normalized[key]).trim();
      }
    }
    return '';
  };

  const nameFromRow = pick(['name', 'metric_name', 'metric', 'title', 'indicator']);
  const generatedName = nameFromRow || (() => {
    const firstValue = Object.values(normalized).find(v => v !== undefined && v !== null && String(v).trim() !== '');
    if (firstValue) {
      return String(firstValue).trim().slice(0, 150);
    }
    return `Imported Metric #${index + 1}`;
  })();

  const category = pick(['category', 'cat', 'type']) || 'E';
  const status = pick(['status', 'state']) || 'PLANNED';

  const rowString = JSON.stringify(row || {});
  const definitionValue = pick(['definition', 'def']) || rowString;
  const descriptionValue = pick(['description', 'desc']) || `Imported raw row: ${rowString}`;

  const mapped = {
    name: generatedName,
    description: descriptionValue,
    category: ['E', 'S', 'G'].includes(category.toUpperCase()) ? category.toUpperCase() : 'E',
    subcategory: pick(['subcategory', 'sub_category', 'subcat']) || null,
    scope: pick(['scope', 'scopes']) || null,
    definition: definitionValue,
    unit: pick(['unit', 'uom', 'measure']) || null,
    status: ['COLLECTED', 'PARTIAL', 'PLANNED', 'IN_PROGRESS', 'NOT_COLLECTED'].includes(status.toUpperCase()) ? status.toUpperCase() : 'PLANNED'
  };

  return mapped;
};

// Create import batch record
const createImportBatch = async ({ userId, source, sourceUrl = null, fileName = null, rowCount = 0, status = 'PENDING' }) => {
  const batch = await prisma.importBatch.create({
    data: {
      userId,
      source,
      sourceUrl,
      fileName,
      rowCount,
      status
    }
  });
  return batch;
};

// Import metrics from Google Sheets (editor and admin only)
export const importMetricsFromGoogleSheets = async (req, res) => {
  try {
    // Check if user is editor or admin
    if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to import metrics' });
    }
    
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'Google Sheets URL is required' });
    }

    // Create a batch group to track this import
    const batch = await createImportBatch({
      userId: req.user.id,
      source: 'GOOGLE_SHEETS',
      sourceUrl: url,
      rowCount: 0,
      status: 'PENDING'
    });
    
    // If the client already provided CSV text (for env without outbound network), use it
    const csvText = req.body.csvData ? req.body.csvData : await (async () => {
      if (!url) {
        throw new Error('Google Sheets URL is required when csvData is not provided');
      }
      const csvUrl = convertToCSVUrl(url);
      return await fetchGoogleSheetCSV(csvUrl);
    })();

    // Parse CSV
    const rows = parseCSV(csvText);
    await prisma.importBatch.update({ where: { id: batch.id }, data: { rowCount: rows.length } });
    
    if (rows.length === 0) {
      return res.status(400).json({ error: 'No data found in spreadsheet' });
    }

    // Save uploaded GS document as one metric (no row splitting)
    const metricData = {
      name: req.body.name || `Google Sheets import ${new Date().toISOString()}`,
      description: req.body.description || `Google Sheets file import from URL: ${url}. Total rows: ${rows.length}.`,
      category: req.body.category || 'E',
      subcategory: req.body.subcategory || null,
      scope: req.body.scope || null,
      definition: req.body.definition || `Raw rows (first 20): ${JSON.stringify(rows.slice(0, 20))}...`,
      unit: req.body.unit || null,
      status: req.body.status || 'COLLECTED'
    };

    const metric = await prisma.metric.create({ data: { ...metricData, importBatchId: batch.id, createdBy: req.user.id } });

    if (req.body.standards) {
      const standardMap = {};
      (await prisma.standard.findMany()).forEach(s => {
        standardMap[s.name.toLowerCase()] = s.id;
        if (s.code) standardMap[s.code.toLowerCase()] = s.id;
      });
      const standardsList = String(req.body.standards).split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      for (const stdName of standardsList) {
        const standardId = standardMap[stdName];
        if (standardId) {
          await prisma.metricStandard.create({ data: { metricId: metric.id, standardId } });
        }
      }
    }

    await logAction(req.user.id, 'CREATE', 'METRIC', metric.id, { name: metric.name, category: metric.category, source: 'Google Sheets Import' });
    await prisma.importBatch.update({ where: { id: batch.id }, data: { status: 'COMPLETED' } });

    return res.json({ success: true, batchId: batch.id, imported: 1, errors: 0, metrics: [metric] });
    
  } catch (error) {
    const networkErrors = ['ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN'];
    const status = networkErrors.includes(error.code) ? 502 : 500;
    const hint = status === 502 ? 'Network error fetching Google Sheets URL. Check outbound access or use csvData body parameter.' : undefined;

    res.status(status).json({ 
      error: 'Failed to import from Google Sheets', 
      message: error.message,
      hint
    });
  }
};

// Import data sources from Google Sheets (editor and admin only)
export const importSourcesFromGoogleSheets = async (req, res) => {
  try {
    // Check if user is editor or admin
    if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to import sources' });
    }
    
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'Google Sheets URL is required' });
    }
    
    const csvText = req.body.csvData ? req.body.csvData : await (async () => {
      if (!url) {
        throw new Error('Google Sheets URL is required when csvData is not provided');
      }
      const csvUrl = convertToCSVUrl(url);
      return await fetchGoogleSheetCSV(csvUrl);
    })();
    const rows = parseCSV(csvText);
    
    if (rows.length === 0) {
      return res.status(400).json({ error: 'No data found in spreadsheet' });
    }
    
    const importedSources = [];
    const errors = [];
    
    for (const row of rows) {
      try {
        const sourceData = {
          name: row.name || row.Name || row.source_name || '',
          type: row.type || row.Type || 'EXCEL',
          format: row.format || row.Format || '',
          updateFrequency: row.update_frequency || row.updateFrequency || row['Update Frequency'] || ''
        };
        
        if (!sourceData.name || sourceData.name.trim() === '') {
          errors.push({ row: JSON.stringify(row), error: 'Missing source name' });
          continue;
        }
        
        const source = await prisma.dataSource.create({ data: sourceData });
        
        // Log import action
        await logAction(req.user.id, 'CREATE', 'SOURCE', source.id, { 
          name: source.name,
          type: source.type,
          source: 'Google Sheets Import'
        });
        
        importedSources.push(source);
      } catch (error) {
        errors.push({ row: JSON.stringify(row), error: error.message });
      }
    }
    
    res.json({
      success: true,
      imported: importedSources.length,
      errors: errors.length,
      sources: importedSources,
      errorDetails: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    const networkErrors = ['ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN'];
    const status = networkErrors.includes(error.code) ? 502 : 500;
    const hint = status === 502 ? 'Network error fetching Google Sheets URL. Check outbound access or use csvData body parameter.' : undefined;

    res.status(status).json({ 
      error: 'Failed to import sources from Google Sheets', 
      message: error.message,
      hint
    });
  }
};

// Get import template information
export const getImportTemplate = async (req, res) => {
  try {
    const templates = {
      metrics: {
        columns: ['any columns are accepted; no strict template'],
        example: {
          name: 'Energy Consumption',
          description: 'Total electricity consumption',
          category: 'E',
          subcategory: 'Energy',
          unit: 'kWh',
          status: 'COLLECTED'
        },
        validValues: {
          category: ['E', 'S', 'G'],
          status: ['COLLECTED', 'PARTIAL', 'PLANNED', 'IN_PROGRESS', 'NOT_COLLECTED']
        },
        notes: 'Any additional fields are accepted and stored in metric definition/description when no dedicated field is available. Name is inferred from first non-empty cell if missing.'
      },
      sources: {
        columns: ['name', 'type', 'format', 'update_frequency'],
        example: {
          name: 'Energy Report',
          type: 'EXCEL',
          format: '.xlsx',
          update_frequency: 'MONTHLY'
        },
        validValues: {
          type: ['EXCEL', 'API', 'SURVEY', 'ERP', 'MANUAL'],
          update_frequency: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY', 'ON_DEMAND', 'REAL_TIME']
        }
      },
      departments: {
        columns: ['name', 'owner', 'email', 'phone', 'messenger', 'roleInDepartment'],
        example: {
          name: 'Facilities',
          owner: 'John Doe',
          email: 'john@university.edu',
          phone: '+1-555-0123',
          messenger: 'john.doe@slack',
          roleInDepartment: 'Manager'
        },
        notes: 'phone, messenger, and roleInDepartment are optional'
      }
    };
    
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get templates', message: error.message });
  }
};

// Import metrics manually (JSON array - direct upload)
export const importMetricsManual = async (req, res) => {
  try {
    // Check if user is editor or admin
    if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to import metrics' });
    }
    
    const { metrics } = req.body;
    
    if (!Array.isArray(metrics) || metrics.length === 0) {
      return res.status(400).json({ error: 'Must provide array of metrics in body' });
    }

    // Create import batch for manual metrics (save all as ONE metric)
    const batch = await createImportBatch({
      userId: req.user.id,
      source: 'MANUAL',
      rowCount: metrics.length,
      status: 'PENDING'
    });
    
    // Save uploaded JSON data as one metric (no row splitting)
    const metricData = {
      name: `Manual JSON import ${new Date().toISOString()}`,
      description: `Manual JSON import with ${metrics.length} items`,
      category: 'E',
      subcategory: null,
      scope: null,
      definition: JSON.stringify(metrics),
      unit: null,
      status: 'COLLECTED'
    };

    const metric = await prisma.metric.create({ data: { ...metricData, importBatchId: batch.id, createdBy: req.user.id } });

    await logAction(req.user.id, 'CREATE', 'METRIC', metric.id, { 
      name: metric.name, 
      category: metric.category,
      source: 'Manual JSON Import'
    });
    await prisma.importBatch.update({ where: { id: batch.id }, data: { status: 'COMPLETED' } });

    res.json({
      success: true,
      batchId: batch.id,
      imported: 1,
      errors: 0,
      metrics: [metric]
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to import metrics manually', 
      message: error.message 
    });
  }
};

// Import metrics from CSV file (multipart/form-data)
export const importMetricsCSV = async (req, res) => {
  try {
    // Check if user is editor or admin
    if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to import metrics' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'CSV file is required' });
    }

    // Parse CSV from file
    const csvText = req.file.buffer.toString('utf-8');
    const rows = parseCSV(csvText);
    
    if (rows.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty or invalid' });
    }

    const batch = await createImportBatch({
      userId: req.user.id,
      source: 'CSV_UPLOAD',
      fileName: req.file.originalname || null,
      rowCount: rows.length,
      status: 'PENDING'
    });

    // Save uploaded CSV file as one metric (no row splitting)
    const metricData = {
      name: req.body.name || req.file.originalname || `CSV import ${new Date().toISOString()}`,
      description: req.body.description || `CSV file import (${req.file.originalname || 'unknown'}) with ${rows.length} rows`,
      category: req.body.category || 'E',
      subcategory: req.body.subcategory || null,
      scope: req.body.scope || null,
      definition: req.body.definition || `CSV rows (first 20): ${JSON.stringify(rows.slice(0, 20))}`,
      unit: req.body.unit || null,
      status: req.body.status || 'COLLECTED'
    };

    const metric = await prisma.metric.create({ data: { ...metricData, importBatchId: batch.id, createdBy: req.user.id } });

    if (req.body.standards) {
      const standardMap = {};
      (await prisma.standard.findMany()).forEach(s => {
        standardMap[s.name.toLowerCase()] = s.id;
        if (s.code) standardMap[s.code.toLowerCase()] = s.id;
      });
      const standardsList = String(req.body.standards).split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      for (const stdName of standardsList) {
        const standardId = standardMap[stdName];
        if (standardId) {
          await prisma.metricStandard.create({ data: { metricId: metric.id, standardId } });
        }
      }
    }

    await logAction(req.user.id, 'CREATE', 'METRIC', metric.id, {
      name: metric.name,
      category: metric.category,
      source: 'CSV File Import'
    });
    await prisma.importBatch.update({ where: { id: batch.id }, data: { status: 'COMPLETED' } });

    res.json({ success: true, batchId: batch.id, imported: 1, errors: 0, metrics: [metric] });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to import metrics from CSV', 
      message: error.message 
    });
  }
};

// Get list of import batches (admin/editor)
export const getImportBatches = async (req, res) => {
  try {
    if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to view import batches' });
    }

    const batches = await prisma.importBatch.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, email: true, name: true }
        },
        metrics: {
          select: { id: true, name: true }
        }
      }
    });

    res.json(batches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch import batches', message: error.message });
  }
};

export const getImportBatchById = async (req, res) => {
  try {
    if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to view import batches' });
    }

    const { id } = req.params;
    const batch = await prisma.importBatch.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: { id: true, email: true, name: true }
        },
        metrics: true
      }
    });

    if (!batch) {
      return res.status(404).json({ error: 'Import batch not found' });
    }

    res.json(batch);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch import batch', message: error.message });
  }
};

// Quick add single metric
export const addSingleMetric = async (req, res) => {
  try {
    // Check if user is editor or admin
    if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to add metrics' });
    }
    
    const { name, description, category, subcategory, scope, definition, unit, standards, status } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Metric name is required' });
    }
    
    const metricData = {
      name: name.trim(),
      description: description || '',
      category: category || 'E',
      subcategory: subcategory || null,
      scope: scope || null,
      definition: definition || '',
      unit: unit || '',
      status: status || 'PLANNED'
    };

    const batch = await createImportBatch({
      userId: req.user.id,
      source: 'SINGLE',
      rowCount: 1,
      status: 'COMPLETED'
    });
    
    const metric = await prisma.metric.create({ data: { ...metricData, importBatchId: batch.id, createdBy: req.user.id } });
    
    // Handle standards linking
    const standardMap = {};
    const allStandards = await prisma.standard.findMany();
    allStandards.forEach(s => {
      standardMap[s.name.toLowerCase()] = s.id;
      standardMap[s.code.toLowerCase()] = s.id;
    });
    
    if (standards) {
      const standardsArray = typeof standards === 'string' ? 
        standards.split(',').map(s => s.trim()) : 
        (Array.isArray(standards) ? standards : []);
      
      for (const stdName of standardsArray) {
        const standardId = standardMap[stdName.toLowerCase()];
        if (standardId) {
          await prisma.metricStandard.create({
            data: {
              metricId: metric.id,
              standardId: standardId
            }
          });
        }
      }
    }
    
    // Log import action
    await logAction(req.user.id, 'CREATE', 'METRIC', metric.id, { 
      name: metric.name, 
      category: metric.category,
      source: 'Manual Single Metric'
    });
    
    res.status(201).json({
      success: true,
      metric: metric,
      message: 'Metric added successfully'
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to add metric', 
      message: error.message 
    });
  }
};
