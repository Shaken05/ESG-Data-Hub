import { PrismaClient } from '@prisma/client';
import { execSync } from 'node:child_process';

const prisma = new PrismaClient();

async function main() {
  // Seed only for an empty database.
  const usersCount = await prisma.user.count();

  if (usersCount > 0) {
    console.log(`⏭️ Seed skipped: users table already has ${usersCount} record(s).`);
    return;
  }

  console.log('🌱 Empty database detected. Running initial seed scripts...');
  execSync('node prisma/seedUsers.js', { stdio: 'inherit' });
  execSync('node prisma/seedStandards.js', { stdio: 'inherit' });
  execSync('node prisma/seed.js', { stdio: 'inherit' });
  console.log('✅ Initial seed completed.');
}

main()
  .catch((error) => {
    console.error('❌ Bootstrap seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

