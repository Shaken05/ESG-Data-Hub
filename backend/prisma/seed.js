import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.metricLink.deleteMany();
  await prisma.metric.deleteMany();
  await prisma.dataSource.deleteMany();
  await prisma.department.deleteMany();
  await prisma.storageLocation.deleteMany();

  // Insert Departments
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: 'Facilities Management',
        owner: 'John Smith',
        email: 'facilities@university.edu'
      }
    }),
    prisma.department.create({
      data: {
        name: 'Human Resources',
        owner: 'Sarah Johnson',
        email: 'hr@university.edu'
      }
    }),
    prisma.department.create({
      data: {
        name: 'Finance & Administration',
        owner: 'Michael Brown',
        email: 'finance@university.edu'
      }
    }),
    prisma.department.create({
      data: {
        name: 'Student Affairs',
        owner: 'Emily Davis',
        email: 'studentaffairs@university.edu'
      }
    }),
    prisma.department.create({
      data: {
        name: 'Academic Affairs',
        owner: 'David Wilson',
        email: 'academic@university.edu'
      }
    })
  ]);
  console.log(`✅ Created ${departments.length} departments`);

  // Insert Data Sources
  const sources = await Promise.all([
    prisma.dataSource.create({
      data: {
        name: 'Energy Consumption Report',
        type: 'EXCEL',
        format: '.xlsx',
        updateFrequency: 'Monthly'
      }
    }),
    prisma.dataSource.create({
      data: {
        name: 'Building Management System API',
        type: 'API',
        format: 'JSON',
        updateFrequency: 'Real-time'
      }
    }),
    prisma.dataSource.create({
      data: {
        name: 'Annual Campus Survey',
        type: 'SURVEY',
        format: 'Google Forms',
        updateFrequency: 'Annually'
      }
    }),
    prisma.dataSource.create({
      data: {
        name: 'HR Information System',
        type: 'ERP',
        format: 'Database',
        updateFrequency: 'Weekly'
      }
    }),
    prisma.dataSource.create({
      data: {
        name: 'Finance ERP System',
        type: 'ERP',
        format: 'Database',
        updateFrequency: 'Daily'
      }
    })
  ]);
  console.log(`✅ Created ${sources.length} data sources`);

  // Insert Storage Locations
  const storageLocations = await Promise.all([
    prisma.storageLocation.create({
      data: {
        locationName: 'Google Drive - ESG Data Folder',
        type: 'DRIVE'
      }
    }),
    prisma.storageLocation.create({
      data: {
        locationName: 'University File Server',
        type: 'SERVER'
      }
    }),
    prisma.storageLocation.create({
      data: {
        locationName: 'SharePoint - Sustainability',
        type: 'SHAREPOINT'
      }
    }),
    prisma.storageLocation.create({
      data: {
        locationName: 'AWS S3 - Data Archive',
        type: 'CLOUD'
      }
    })
  ]);
  console.log(`✅ Created ${storageLocations.length} storage locations`);

  // Insert Metrics
  const metrics = await Promise.all([
    prisma.metric.create({
      data: {
        name: 'Total Energy Consumption',
        description: 'Total electricity and gas consumption across all campus buildings',
        category: 'E',
        unit: 'kWh',
        standard: 'GRI',
        status: 'COLLECTED'
      }
    }),
    prisma.metric.create({
      data: {
        name: 'Greenhouse Gas Emissions',
        description: 'Total Scope 1 and Scope 2 GHG emissions',
        category: 'E',
        unit: 'tCO2e',
        standard: 'GRI',
        status: 'COLLECTED'
      }
    }),
    prisma.metric.create({
      data: {
        name: 'Water Usage',
        description: 'Total potable water consumption on campus',
        category: 'E',
        unit: 'Gallons',
        standard: 'STARS',
        status: 'PARTIAL'
      }
    }),
    prisma.metric.create({
      data: {
        name: 'Waste Diverted from Landfill',
        description: 'Percentage of waste recycled or composted',
        category: 'E',
        unit: 'Percentage',
        standard: 'STARS',
        status: 'COLLECTED'
      }
    }),
    prisma.metric.create({
      data: {
        name: 'Renewable Energy',
        description: 'Percentage of energy from renewable sources',
        category: 'E',
        unit: 'Percentage',
        standard: 'SDG',
        status: 'PARTIAL'
      }
    }),
    prisma.metric.create({
      data: {
        name: 'Employee Diversity',
        description: 'Demographic diversity of faculty and staff',
        category: 'S',
        unit: 'Percentage',
        standard: 'GRI',
        status: 'COLLECTED'
      }
    }),
    prisma.metric.create({
      data: {
        name: 'Student Satisfaction',
        description: 'Average student satisfaction score',
        category: 'S',
        unit: 'Score (1-5)',
        standard: null,
        status: 'COLLECTED'
      }
    }),
    prisma.metric.create({
      data: {
        name: 'Living Wage Employment',
        description: 'Percentage of employees earning living wage',
        category: 'S',
        unit: 'Percentage',
        standard: 'STARS',
        status: 'PARTIAL'
      }
    }),
    prisma.metric.create({
      data: {
        name: 'Community Engagement Hours',
        description: 'Total volunteer hours by students and staff',
        category: 'S',
        unit: 'Hours',
        standard: 'SDG',
        status: 'PLANNED'
      }
    }),
    prisma.metric.create({
      data: {
        name: 'Board Diversity',
        description: 'Diversity composition of governing board',
        category: 'G',
        unit: 'Percentage',
        standard: 'GRI',
        status: 'COLLECTED'
      }
    }),
    prisma.metric.create({
      data: {
        name: 'Ethics Training Completion',
        description: 'Percentage of staff completing ethics training',
        category: 'G',
        unit: 'Percentage',
        standard: null,
        status: 'COLLECTED'
      }
    }),
    prisma.metric.create({
      data: {
        name: 'Sustainability Committee Meetings',
        description: 'Number of sustainability committee meetings per year',
        category: 'G',
        unit: 'Count',
        standard: 'STARS',
        status: 'COLLECTED'
      }
    })
  ]);
  console.log(`✅ Created ${metrics.length} metrics`);

  // Insert Metric Links
  const links = await Promise.all([
    // Energy Consumption
    prisma.metricLink.create({
      data: {
        metricId: metrics[0].id,
        sourceId: sources[0].id,
        departmentId: departments[0].id,
        storageId: storageLocations[0].id,
        qualityScore: 95,
        lastUpdate: new Date('2026-02-01')
      }
    }),
    // GHG Emissions
    prisma.metricLink.create({
      data: {
        metricId: metrics[1].id,
        sourceId: sources[0].id,
        departmentId: departments[0].id,
        storageId: storageLocations[0].id,
        qualityScore: 90,
        lastUpdate: new Date('2026-02-01')
      }
    }),
    // Water Usage
    prisma.metricLink.create({
      data: {
        metricId: metrics[2].id,
        sourceId: sources[1].id,
        departmentId: departments[0].id,
        storageId: storageLocations[1].id,
        qualityScore: 75,
        lastUpdate: new Date('2026-01-15'),
        issues: 'Some buildings missing data'
      }
    }),
    // Employee Diversity
    prisma.metricLink.create({
      data: {
        metricId: metrics[5].id,
        sourceId: sources[3].id,
        departmentId: departments[1].id,
        storageId: storageLocations[2].id,
        qualityScore: 98,
        lastUpdate: new Date('2026-02-20')
      }
    }),
    // Student Satisfaction
    prisma.metricLink.create({
      data: {
        metricId: metrics[6].id,
        sourceId: sources[2].id,
        departmentId: departments[3].id,
        storageId: storageLocations[0].id,
        qualityScore: 85,
        lastUpdate: new Date('2026-01-10')
      }
    }),
    // Board Diversity
    prisma.metricLink.create({
      data: {
        metricId: metrics[9].id,
        sourceId: sources[3].id,
        departmentId: departments[2].id,
        storageId: storageLocations[2].id,
        qualityScore: 100,
        lastUpdate: new Date('2026-02-28')
      }
    })
  ]);
  console.log(`✅ Created ${links.length} metric links`);

  console.log('✨ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
