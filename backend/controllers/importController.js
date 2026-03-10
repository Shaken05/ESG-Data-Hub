import { PrismaClient } from '@prisma/client';
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
    
    // Import metrics
    const importedMetrics = [];
    const errors = [];
    
    for (const row of rows) {
      try {
        // Map CSV columns to database fields
        const metricData = {
          name: row.name || row.Name || row.metric_name,
          description: row.description || row.Description || '',
          category: row.category || row.Category || 'E',
          unit: row.unit || row.Unit || '',
          standard: row.standard || row.Standard || null,
          status: row.status || row.Status || 'PLANNED'
        };
        
        if (!metricData.name) {
          errors.push({ row, error: 'Missing metric name' });
          continue;
        }
        
        const metric = await prisma.metric.create({ data: metricData });
        importedMetrics.push(metric);
      } catch (error) {
        errors.push({ row, error: error.message });
      }
    }
    
    res.json({
      success: true,
      imported: importedMetrics.length,
      errors: errors.length,
      metrics: importedMetrics,
      errorDetails: errors
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
          name: row.name || row.Name || row.source_name,
          type: row.type || row.Type || 'EXCEL',
          format: row.format || row.Format || '',
          updateFrequency: row.update_frequency || row.updateFrequency || row['Update Frequency'] || ''
        };
        
        if (!sourceData.name) {
          errors.push({ row, error: 'Missing source name' });
          continue;
        }
        
        const source = await prisma.dataSource.create({ data: sourceData });
        importedSources.push(source);
      } catch (error) {
        errors.push({ row, error: error.message });
      }
    }
    
    res.json({
      success: true,
      imported: importedSources.length,
      errors: errors.length,
      sources: importedSources,
      errorDetails: errors
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
        columns: ['name', 'description', 'category', 'unit', 'standard', 'status'],
        example: {
          name: 'Energy Consumption',
          description: 'Total electricity consumption',
          category: 'E',
          unit: 'kWh',
          standard: 'GRI',
          status: 'COLLECTED'
        },
        validValues: {
          category: ['E', 'S', 'G'],
          standard: ['GRI', 'STARS', 'SDG', null],
          status: ['COLLECTED', 'PARTIAL', 'PLANNED']
        }
      },
      sources: {
        columns: ['name', 'type', 'format', 'update_frequency'],
        example: {
          name: 'Energy Report',
          type: 'EXCEL',
          format: '.xlsx',
          update_frequency: 'Monthly'
        },
        validValues: {
          type: ['EXCEL', 'API', 'SURVEY', 'ERP']
        }
      },
      departments: {
        columns: ['name', 'owner', 'email'],
        example: {
          name: 'Facilities',
          owner: 'John Doe',
          email: 'john@university.edu'
        }
      }
    };
    
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get templates', message: error.message });
  }
};
