import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.metricStandard.deleteMany();
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
        email: 'facilities@university.edu',
        phone: '+1-555-0101',
        messenger: 'john.smith@teams',
        roleInDepartment: 'Energy Manager'
      }
    }),
    prisma.department.create({
      data: {
        name: 'Human Resources',
        owner: 'Sarah Johnson',
        email: 'hr@university.edu',
        phone: '+1-555-0102',
        roleInDepartment: 'Data Steward'
      }
    }),
    prisma.department.create({
      data: {
        name: 'Finance & Administration',
        owner: 'Michael Brown',
        email: 'finance@university.edu',
        phone: '+1-555-0103',
        roleInDepartment: 'Finance Manager'
      }
    }),
    prisma.department.create({
      data: {
        name: 'Student Affairs',
        owner: 'Emily Davis',
        email: 'studentaffairs@university.edu',
        phone: '+1-555-0104',
        roleInDepartment: 'ESG Coordinator'
      }
    }),
    prisma.department.create({
      data: {
        name: 'Academic Affairs',
        owner: 'David Wilson',
        email: 'academic@university.edu',
        phone: '+1-555-0105',
        roleInDepartment: 'ESG Lead'
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
        updateFrequency: 'MONTHLY'
      }
    }),
    prisma.dataSource.create({
      data: {
        name: 'Building Management System API',
        type: 'API',
        format: 'JSON',
        updateFrequency: 'MONTHLY'
      }
    }),
    prisma.dataSource.create({
      data: {
        name: 'Annual Campus Survey',
        type: 'SURVEY',
        format: 'Google Forms',
        updateFrequency: 'ANNUALLY'
      }
    }),
    prisma.dataSource.create({
      data: {
        name: 'HR Information System',
        type: 'ERP',
        format: 'Database',
        updateFrequency: 'MONTHLY'
      }
    }),
    prisma.dataSource.create({
      data: {
        name: 'Manual Data Entry',
        type: 'MANUAL',
        format: 'Spreadsheet',
        updateFrequency: 'QUARTERLY'
      }
    })
  ]);
  console.log(`✅ Created ${sources.length} data sources`);

  // Insert Storage Locations
  const storageLocations = await Promise.all([
    prisma.storageLocation.create({
      data: {
        locationName: 'Google Drive - ESG Data',
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
        locationName: 'AWS S3 Cloud',
        type: 'CLOUD'
      }
    })
  ]);
  console.log(`✅ Created ${storageLocations.length} storage locations`);

  // Insert Metrics
  const metrics = await Promise.all([
    // Environmental metrics
    prisma.metric.create({
      data: {
        name: 'Total Energy Consumption',
        description: 'Total electricity and gas consumption across campus',
        category: 'E',
        subcategory: 'Energy',
        scope: 'Scope 2',
        definition: 'Sum of all electricity and natural gas usage in kWh',
        unit: 'kWh',
        status: 'COLLECTED'
      }
    }),
    prisma.metric.create({
      data: {
        name: 'Greenhouse Gas Emissions',
        description: 'Total direct and indirect GHG emissions',
        category: 'E',
        subcategory: 'Emissions',
        scope: 'Scope 1 & 2',
        definition: 'GHG emissions in tCO2e including Scope 1 and 2',
        unit: 'tCO2e',
        status: 'COLLECTED'
      }
    }),
    prisma.metric.create({
      data: {
        name: 'Water Consumption',
        description: 'Total water usage on campus',
        category: 'E',
        subcategory: 'Water',
        definition: 'Total potable water and recycled water usage',
        unit: 'm³',
        status: 'COLLECTED'
      }
    }),
    prisma.metric.create({
      data: {
        name: 'Waste Diversion Rate',
        description: 'Percentage of waste diverted from landfill',
        category: 'E',
        subcategory: 'Waste',
        definition: 'Diverted waste (recycling, composting) as % of total',
        unit: '%',
        status: 'COLLECTED'
      }
    }),
    prisma.metric.create({
      data: {
        name: 'Renewable Energy Usage',
        description: 'Percentage of energy from renewable sources',
        category: 'E',
        subcategory: 'Energy',
        definition: 'Renewable energy as % of total energy consumption',
        unit: '%',
        status: 'IN_PROGRESS'
      }
    }),
    // Social metrics
    prisma.metric.create({
      data: {
        name: 'Employee Diversity',
        description: 'Demographic diversity of faculty and staff',
        category: 'S',
        subcategory: 'Diversity',
        definition: 'Percentage of faculty and staff from underrepresented groups',
        unit: '%',
        status: 'COLLECTED'
      }
    }),
    prisma.metric.create({
      data: {
        name: 'Student Satisfaction',
        description: 'Average student satisfaction with university',
        category: 'S',
        subcategory: 'Education',
        definition: 'Student satisfaction survey score (1-5 scale)',
        unit: 'Score',
        status: 'COLLECTED'
      }
    }),
    prisma.metric.create({
      data: {
        name: 'Living Wage Employment',
        description: 'Percentage of employees earning living wage',
        category: 'S',
        subcategory: 'Employment',
        definition: 'Staff positions with compensation above living wage',
        unit: '%',
        status: 'PARTIAL'
      }
    }),
    prisma.metric.create({
      data: {
        name: 'Community Engagement Hours',
        description: 'Total volunteer hours by students and staff',
        category: 'S',
        subcategory: 'Community',
        definition: 'Annual community service hours contributed',
        unit: 'Hours',
        status: 'COLLECTED'
      }
    }),
    // Governance metrics
    prisma.metric.create({
      data: {
        name: 'Board Diversity',
        description: 'Diversity composition of governing board',
        category: 'G',
        subcategory: 'Governance',
        definition: 'Board members from underrepresented demographics',
        unit: '%',
        status: 'COLLECTED'
      }
    }),
    prisma.metric.create({
      data: {
        name: 'Ethics Training Completion',
        description: 'Percentage of staff completing ethics training',
        category: 'G',
        subcategory: 'Compliance',
        definition: 'Annual ethics and compliance training completion rate',
        unit: '%',
        status: 'COLLECTED'
      }
    }),
    prisma.metric.create({
      data: {
        name: 'Sustainability Committee Meetings',
        description: 'Number of sustainability committee meetings per year',
        category: 'G',
        subcategory: 'Governance',
        definition: 'Annual meetings of sustainability governance body',
        unit: 'Count',
        status: 'COLLECTED'
      }
    })
  ]);
  console.log(`✅ Created ${metrics.length} metrics`);

  // Get standards
  const gri = await prisma.standard.findUnique({ where: { name: 'GRI' } });
  const stars = await prisma.standard.findUnique({ where: { name: 'STARS' } });

  // Link metrics to standards
  if (gri && metrics.length > 0) {
    await prisma.metricStandard.create({
      data: {
        metricId: metrics[0].id,
        standardId: gri.id
      }
    }).catch(() => {});
  }
  if (stars) {
    await prisma.metricStandard.create({
      data: {
        metricId: metrics[1].id,
        standardId: stars.id
      }
    }).catch(() => {});
  }

  // Insert Metric Links with quality metrics
  const links = await Promise.all([
    // Energy Consumption
    prisma.metricLink.create({
      data: {
        metricId: metrics[0].id,
        sourceId: sources[0].id,
        departmentId: departments[0].id,
        storageId: storageLocations[0].id,
        qualityScore: 95,
        completeness: 95,
        accuracy: 95,
        timeliness: 90,
        lastUpdate: new Date('2026-02-01'),
        issueType: null
      }
    }),
    // GHG Emissions
    prisma.metricLink.create({
      data: {
        metricId: metrics[1].id,
        sourceId: sources[0].id,
        departmentId: departments[0].id,
        storageId: storageLocations[0].id,
        qualityScore: 78,
        completeness: 75,
        accuracy: 80,
        timeliness: 75,
        lastUpdate: new Date('2026-02-01'),
        issues: 'Manual data entry needed for Scope 3',
        issueType: 'NO_AUTOMATION'
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
        completeness: 70,
        accuracy: 75,
        timeliness: 80,
        lastUpdate: new Date('2026-01-15'),
        issues: 'Some buildings missing meter data',
        issueType: 'MISSING'
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
        completeness: 100,
        accuracy: 98,
        timeliness: 95,
        lastUpdate: new Date('2026-02-20'),
        issueType: null
      }
    }),
    // Student Satisfaction
    prisma.metricLink.create({
      data: {
        metricId: metrics[6].id,
        sourceId: sources[2].id,
        departmentId: departments[3].id,
        storageId: storageLocations[0].id,
        qualityScore: 88,
        completeness: 90,
        accuracy: 85,
        timeliness: 90,
        lastUpdate: new Date('2026-01-10'),
        issueType: null
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
        completeness: 100,
        accuracy: 100,
        timeliness: 100,
        lastUpdate: new Date('2026-02-28'),
        issueType: null
      }
    })
  ]);
  console.log(`✅ Created ${links.length} metric links with quality scores`);

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
