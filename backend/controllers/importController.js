import { PrismaClient } from '@prisma/client';
import { logAction } from './auditController.js';
import https from 'https';

const prisma = new PrismaClient();

// Helper function to fetch Google Sheets data as CSV
const fetchGoogleSheetCSV = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
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
    
    // Convert to CSV export URL
    const csvUrl = convertToCSVUrl(url);
    
    // Fetch CSV data
    const csvData = await fetchGoogleSheetCSV(csvUrl);
    
    // Parse CSV
    const rows = parseCSV(csvData);
    
    if (rows.length === 0) {
      return res.status(400).json({ error: 'No data found in spreadsheet' });
    }
    
    // Get all standards for linking
    const standards = await prisma.standard.findMany();
    const standardMap = {};
    standards.forEach(s => {
      standardMap[s.name.toLowerCase()] = s.id;
      standardMap[s.code.toLowerCase()] = s.id;
    });
    
    // Import metrics
    const importedMetrics = [];
    const errors = [];
    
    for (const row of rows) {
      try {
        // Map CSV columns to database fields (supports new schema)
        const metricData = {
          name: row.name || row.Name || row.metric_name || '',
          description: row.description || row.Description || '',
          category: row.category || row.Category || 'E',
          subcategory: row.subcategory || row.Subcategory || null,
          scope: row.scope || row.Scope || null,
          definition: row.definition || row.Definition || '',
          unit: row.unit || row.Unit || '',
          status: row.status || row.Status || 'PLANNED'
        };
        
        if (!metricData.name || metricData.name.trim() === '') {
          errors.push({ row: JSON.stringify(row), error: 'Missing metric name' });
          continue;
        }
        
        const metric = await prisma.metric.create({ data: metricData });
        
        // Handle standards linking (comma-separated: "GRI,SASB,TCFD")
        const standardsColumn = row.standards || row.Standards || row.standard || row.Standard || '';
        if (standardsColumn && standardsColumn.trim()) {
          const standardNames = standardsColumn.split(',').map(s => s.trim().toLowerCase());
          for (const stdName of standardNames) {
            const standardId = standardMap[stdName];
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
          source: 'Google Sheets Import'
        });
        
        importedMetrics.push(metric);
      } catch (error) {
        errors.push({ row: JSON.stringify(row), error: error.message });
      }
    }
    
    res.json({
      success: true,
      imported: importedMetrics.length,
      errors: errors.length,
      metrics: importedMetrics,
      errorDetails: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to import from Google Sheets', 
      message: error.message 
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
    
    const csvUrl = convertToCSVUrl(url);
    const csvData = await fetchGoogleSheetCSV(csvUrl);
    const rows = parseCSV(csvData);
    
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
    res.status(500).json({ 
      error: 'Failed to import sources from Google Sheets', 
      message: error.message 
    });
  }
};

// Get import template information
export const getImportTemplate = async (req, res) => {
  try {
    const templates = {
      metrics: {
        columns: ['name', 'description', 'category', 'subcategory', 'scope', 'definition', 'unit', 'standards', 'status'],
        example: {
          name: 'Energy Consumption',
          description: 'Total electricity consumption',
          category: 'E',
          subcategory: 'Energy',
          scope: 'Scope 1 & 2',
          definition: 'Direct and indirect GHG emissions from operations',
          unit: 'kWh',
          standards: 'GRI, SASB, TCFD',
          status: 'COLLECTED'
        },
        validValues: {
          category: ['E', 'S', 'G'],
          status: ['COLLECTED', 'PARTIAL', 'PLANNED'],
          scope: ['Scope 1', 'Scope 2', 'Scope 3', null],
          standards: ['GRI', 'SASB', 'TCFD', 'SDG', 'STARS', 'comma-separated for multiple']
        },
        notes: 'subcategory, scope, and definition are optional. Standards field accepts comma-separated values (e.g., "GRI,SASB,TCFD")'
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
    
    // Get all standards for linking
    const standards = await prisma.standard.findMany();
    const standardMap = {};
    standards.forEach(s => {
      standardMap[s.name.toLowerCase()] = s.id;
      standardMap[s.code.toLowerCase()] = s.id;
    });
    
    const importedMetrics = [];
    const errors = [];
    
    for (const row of metrics) {
      try {
        const metricData = {
          name: row.name || '',
          description: row.description || '',
          category: row.category || 'E',
          subcategory: row.subcategory || null,
          scope: row.scope || null,
          definition: row.definition || '',
          unit: row.unit || '',
          status: row.status || 'PLANNED'
        };
        
        if (!metricData.name || metricData.name.trim() === '') {
          errors.push({ metric: JSON.stringify(row), error: 'Missing metric name' });
          continue;
        }
        
        const metric = await prisma.metric.create({ data: metricData });
        
        // Handle standards linking
        const standardsArray = row.standards || [];
        const standardsStr = typeof standardsArray === 'string' ? standardsArray : (Array.isArray(standardsArray) ? standardsArray.join(',') : '');
        
        if (standardsStr) {
          const standardNames = standardsStr.split(',').map(s => s.trim().toLowerCase());
          for (const stdName of standardNames) {
            const standardId = standardMap[stdName];
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
          source: 'Manual Import'
        });
        
        importedMetrics.push(metric);
      } catch (error) {
        errors.push({ metric: JSON.stringify(row), error: error.message });
      }
    }
    
    res.json({
      success: true,
      imported: importedMetrics.length,
      errors: errors.length,
      metrics: importedMetrics,
      errorDetails: errors.length > 0 ? errors : undefined
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
    
    // Get all standards for linking
    const standards = await prisma.standard.findMany();
    const standardMap = {};
    standards.forEach(s => {
      standardMap[s.name.toLowerCase()] = s.id;
      standardMap[s.code.toLowerCase()] = s.id;
    });
    
    const importedMetrics = [];
    const errors = [];
    
    for (const row of rows) {
      try {
        const metricData = {
          name: row.name || row.Name || row.metric_name || '',
          description: row.description || row.Description || '',
          category: row.category || row.Category || 'E',
          subcategory: row.subcategory || row.Subcategory || null,
          scope: row.scope || row.Scope || null,
          definition: row.definition || row.Definition || '',
          unit: row.unit || row.Unit || '',
          status: row.status || row.Status || 'PLANNED'
        };
        
        if (!metricData.name || metricData.name.trim() === '') {
          errors.push({ row: JSON.stringify(row), error: 'Missing metric name' });
          continue;
        }
        
        const metric = await prisma.metric.create({ data: metricData });
        
        // Handle standards linking
        const standardsColumn = row.standards || row.Standards || row.standard || row.Standard || '';
        if (standardsColumn && standardsColumn.trim()) {
          const standardNames = standardsColumn.split(',').map(s => s.trim().toLowerCase());
          for (const stdName of standardNames) {
            const standardId = standardMap[stdName];
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
          source: 'CSV File Import'
        });
        
        importedMetrics.push(metric);
      } catch (error) {
        errors.push({ row: JSON.stringify(row), error: error.message });
      }
    }
    
    res.json({
      success: true,
      imported: importedMetrics.length,
      errors: errors.length,
      metrics: importedMetrics,
      errorDetails: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to import metrics from CSV', 
      message: error.message 
    });
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
    
    const metric = await prisma.metric.create({ data: metricData });
    
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
