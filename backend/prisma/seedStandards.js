import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedStandards() {
  try {
    // Create standards
    const standards = [
      { name: 'GRI', code: 'GRI-305' },
      { name: 'SASB', code: 'SASB-EN' },
      { name: 'TCFD', code: 'TCFD' },
      { name: 'SDG', code: 'SDG' },
      { name: 'STARS', code: 'STARS' }
    ];

    for (const std of standards) {
      await prisma.standard.upsert({
        where: { name: std.name },
        update: {},
        create: std
      });
    }

    console.log('✅ Standards seeded successfully');
  } catch (error) {
    console.error('Error seeding standards:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedStandards();
