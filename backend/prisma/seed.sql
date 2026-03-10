-- ESG Data Inventory - Sample Data
-- Run this after migration to populate the database with sample data

-- Insert Departments
INSERT INTO departments (name, owner, email, created_at, updated_at) VALUES
('Facilities Management', 'John Smith', 'facilities@university.edu', NOW(), NOW()),
('Human Resources', 'Sarah Johnson', 'hr@university.edu', NOW(), NOW()),
('Finance & Administration', 'Michael Brown', 'finance@university.edu', NOW(), NOW()),
('Student Affairs', 'Emily Davis', 'studentaffairs@university.edu', NOW(), NOW()),
('Academic Affairs', 'David Wilson', 'academic@university.edu', NOW(), NOW());

-- Insert Data Sources
INSERT INTO data_sources (name, type, format, update_frequency, created_at, updated_at) VALUES
('Energy Consumption Report', 'EXCEL', '.xlsx', 'Monthly', NOW(), NOW()),
('Building Management System API', 'API', 'JSON', 'Real-time', NOW(), NOW()),
('Annual Campus Survey', 'SURVEY', 'Google Forms', 'Annually', NOW(), NOW()),
('HR Information System', 'ERP', 'Database', 'Weekly', NOW(), NOW()),
('Finance ERP System', 'ERP', 'Database', 'Daily', NOW(), NOW());

-- Insert Storage Locations
INSERT INTO storage_locations (location_name, type, created_at, updated_at) VALUES
('Google Drive - ESG Data Folder', 'DRIVE', NOW(), NOW()),
('University File Server', 'SERVER', NOW(), NOW()),
('SharePoint - Sustainability', 'SHAREPOINT', NOW(), NOW()),
('AWS S3 - Data Archive', 'CLOUD', NOW(), NOW());

-- Insert Metrics
INSERT INTO metrics (name, description, category, unit, standard, status, created_at, updated_at) VALUES
('Total Energy Consumption', 'Total electricity and gas consumption across all campus buildings', 'E', 'kWh', 'GRI', 'COLLECTED', NOW(), NOW()),
('Greenhouse Gas Emissions', 'Total Scope 1 and Scope 2 GHG emissions', 'E', 'tCO2e', 'GRI', 'COLLECTED', NOW(), NOW()),
('Water Usage', 'Total potable water consumption on campus', 'E', 'Gallons', 'STARS', 'PARTIAL', NOW(), NOW()),
('Waste Diverted from Landfill', 'Percentage of waste recycled or composted', 'E', 'Percentage', 'STARS', 'COLLECTED', NOW(), NOW()),
('Renewable Energy', 'Percentage of energy from renewable sources', 'E', 'Percentage', 'SDG', 'PARTIAL', NOW(), NOW()),
('Employee Diversity', 'Demographic diversity of faculty and staff', 'S', 'Percentage', 'GRI', 'COLLECTED', NOW(), NOW()),
('Student Satisfaction', 'Average student satisfaction score', 'S', 'Score (1-5)', NULL, 'COLLECTED', NOW(), NOW()),
('Living Wage Employment', 'Percentage of employees earning living wage', 'S', 'Percentage', 'STARS', 'PARTIAL', NOW(), NOW()),
('Community Engagement Hours', 'Total volunteer hours by students and staff', 'S', 'Hours', 'SDG', 'PLANNED', NOW(), NOW()),
('Board Diversity', 'Diversity composition of governing board', 'G', 'Percentage', 'GRI', 'COLLECTED', NOW(), NOW()),
('Ethics Training Completion', 'Percentage of staff completing ethics training', 'G', 'Percentage', NULL, 'COLLECTED', NOW(), NOW()),
('Sustainability Committee Meetings', 'Number of sustainability committee meetings per year', 'G', 'Count', 'STARS', 'COLLECTED', NOW(), NOW());

-- Insert Metric Links (connecting metrics to sources, departments, and storage)
-- Energy Consumption
INSERT INTO metric_links (metric_id, source_id, department_id, storage_id, quality_score, last_update, issues, created_at, updated_at) VALUES
(1, 1, 1, 1, 95, '2026-02-01', NULL, NOW(), NOW());

-- GHG Emissions
INSERT INTO metric_links (metric_id, source_id, department_id, storage_id, quality_score, last_update, issues, created_at, updated_at) VALUES
(2, 1, 1, 1, 90, '2026-02-01', NULL, NOW(), NOW());

-- Water Usage
INSERT INTO metric_links (metric_id, source_id, department_id, storage_id, quality_score, last_update, issues, created_at, updated_at) VALUES
(3, 2, 1, 2, 75, '2026-01-15', 'Some meters offline', NOW(), NOW());

-- Waste Diverted
INSERT INTO metric_links (metric_id, source_id, department_id, storage_id, quality_score, last_update, issues, created_at, updated_at) VALUES
(4, 1, 1, 1, 85, '2026-01-30', NULL, NOW(), NOW());

-- Renewable Energy
INSERT INTO metric_links (metric_id, source_id, department_id, storage_id, quality_score, last_update, issues, created_at, updated_at) VALUES
(5, 1, 1, 3, 80, '2026-02-01', 'Need solar panel data', NOW(), NOW());

-- Employee Diversity
INSERT INTO metric_links (metric_id, source_id, department_id, storage_id, quality_score, last_update, issues, created_at, updated_at) VALUES
(6, 4, 2, 2, 98, '2026-02-20', NULL, NOW(), NOW());

-- Student Satisfaction
INSERT INTO metric_links (metric_id, source_id, department_id, storage_id, quality_score, last_update, issues, created_at, updated_at) VALUES
(7, 3, 4, 1, 88, '2025-12-15', NULL, NOW(), NOW());

-- Living Wage
INSERT INTO metric_links (metric_id, source_id, department_id, storage_id, quality_score, last_update, issues, created_at, updated_at) VALUES
(8, 4, 2, 2, 70, '2026-01-10', 'Definition inconsistencies', NOW(), NOW());

-- Board Diversity
INSERT INTO metric_links (metric_id, source_id, department_id, storage_id, quality_score, last_update, issues, created_at, updated_at) VALUES
(10, 4, 3, 3, 100, '2026-02-01', NULL, NOW(), NOW());

-- Ethics Training
INSERT INTO metric_links (metric_id, source_id, department_id, storage_id, quality_score, last_update, issues, created_at, updated_at) VALUES
(11, 4, 2, 2, 92, '2026-02-15', NULL, NOW(), NOW());

-- Sustainability Committee Meetings
INSERT INTO metric_links (metric_id, source_id, department_id, storage_id, quality_score, last_update, issues, created_at, updated_at) VALUES
(12, 1, 5, 3, 100, '2026-02-28', NULL, NOW(), NOW());
