import prisma from '../db/prisma.js'
import bcrypt from 'bcryptjs'

async function main() {
  await prisma.user.create({
    data: {
      username: 'admin',
      name: 'Admin',
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD as string, 10),
      role: 'admin',
    },
  })

  return
}

await main()
