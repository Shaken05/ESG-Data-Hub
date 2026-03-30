import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  await prisma.user.deleteMany({})
  const password = 'Kbtu@1234'
  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      email: 's_shynggyssuly@kbtu.kz',
      name: 'S Shynggyssuly',
      password: hashed,
      role: 'admin',
      active: true
    }
  })
  console.log('Admin user created:', user.email)
  console.log('Temporary password:', password)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
