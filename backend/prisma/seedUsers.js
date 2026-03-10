import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creating test users...');

  // Delete existing test users
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['admin@university.edu', 'editor@university.edu', 'viewer@university.edu']
      }
    }
  });

  // Helper function to hash password
  const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  };

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@university.edu',
      password: adminPassword,
      name: 'Admin User',
      role: 'admin',
      active: true
    }
  });
  console.log('✅ Admin user created:');
  console.log(`   Email: ${admin.email}`);
  console.log(`   Password: admin123`);
  console.log(`   Role: admin`);

  // Create editor user
  const editorPassword = await hashPassword('editor123');
  const editor = await prisma.user.create({
    data: {
      email: 'editor@university.edu',
      password: editorPassword,
      name: 'Editor User',
      role: 'editor',
      active: true
    }
  });
  console.log('\n✅ Editor user created:');
  console.log(`   Email: ${editor.email}`);
  console.log(`   Password: editor123`);
  console.log(`   Role: editor (can add/edit metrics)`);

  // Create viewer user
  const viewerPassword = await hashPassword('viewer123');
  const viewer = await prisma.user.create({
    data: {
      email: 'viewer@university.edu',
      password: viewerPassword,
      name: 'Viewer User',
      role: 'viewer',
      active: true
    }
  });
  console.log('\n✅ Viewer user created:');
  console.log(`   Email: ${viewer.email}`);
  console.log(`   Password: viewer123`);
  console.log(`   Role: viewer (read-only)`);

  console.log('\n✨ Test users created successfully!');
  console.log('\n🔐 User Roles:');
  console.log('   - admin: Full access to system');
  console.log('   - editor: Can add/edit/delete metrics and sources');
  console.log('   - viewer: Can only view data (read-only)');
}

main()
  .catch((e) => {
    console.error('❌ Error creating users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
