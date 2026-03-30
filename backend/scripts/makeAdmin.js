import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.update({
    where: { email: 's_shynggyssuly@kbtu.kz' },
    data: { role: 'admin' }
  })
  console.log(`✅ User ${user.email} updated to admin role`)
}

main()
  .catch(e => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
