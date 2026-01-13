import bcrypt from 'bcryptjs'
import prisma from '../db/prisma'
import readline from 'readline'

async function askConfirmation(query: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
    })
  })
}

async function main() {
  console.log('🌱 Starting seed...')

  const confirmed = await askConfirmation(
    '⚠️  This will DELETE ALL DATA from the database. Are you sure you want to continue? (y/N): ',
  )

  if (!confirmed) {
    console.log('❌ Seed cancelled.')
    process.exit(0)
  }

  // 1. Clean up database
  console.log('Cleaning up database...')
  await prisma.equipment.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.department.deleteMany()
  await prisma.user.deleteMany()

  // 2. Create Admin User
  console.log('Creating admin user...')
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10)
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      name: 'System Admin',
      password: hashedPassword,
      role: 'admin',
    },
  })

  // 3. Create Brands
  console.log('Creating brands...')
  const brandNames = [
    'Yamaha', 'Roland', 'Korg', 'Fender', 'Gibson', 'Shure', 'Sennheiser', 'Behringer',
    'Mackie', 'PreSonus', 'Allen & Heath', 'Soundcraft', 'QSC', 'JBL', 'Electro-Voice',
    'Sony', 'Panasonic', 'Canon', 'Blackmagic Design', 'Marshall', 'Vox', 'Nord',
    'Akai', 'Arturia', 'Focusrite', 'Universal Audio', 'Neumann', 'Audio-Technica', 'Rode', 'Zoom',
  ]

  const brands = []
  for (let i = 0; i < 30; i++) {
    const name = i < brandNames.length ? brandNames[i] : `Brand ${i + 1}`
    const brand = await prisma.brand.create({
      data: {
        name,
        description: `Description for ${name}`,
        createdBy: admin.id,
      },
    })
    brands.push(brand)
  }

  // 4. Create Departments
  console.log('Creating departments...')
  const deptNames = [
    'Sound', 'Lighting', 'Video', 'Media', 'Stage', 'IT', 'Maintenance', 'Office',
    'Kids Ministry', 'Youth Ministry', 'Worship', 'Hospitality', 'Security', 'Outreach', 'Events',
    'Finance', 'HR', 'Creative', 'Communications', 'Facilities', 'Transportation', 'Kitchen',
    'Bookstore', 'Library', 'Prayer', 'Counseling', 'Missions', 'Education', 'Admin', 'Leadership',
  ]

  const departments = []
  for (let i = 0; i < 30; i++) {
    const name = i < deptNames.length ? deptNames[i] : `Department ${i + 1}`
    const dept = await prisma.department.create({
      data: {
        name,
        description: `${name} Department`,
        createdBy: admin.id,
      },
    })
    departments.push(dept)
  }

  // 5. Create Equipment
  console.log('Creating equipment...')
  const equipmentTypes = ['Microphone', 'Speaker', 'Mixer', 'Cable', 'Stand', 'Light', 'Camera', 'Lens', 'Keyboard', 'Guitar', 'Drum', 'Monitor', 'Projector', 'Screen', 'Laptop']
  const statuses = ['new', 'old', 'damaged', 'repairing', 'disposed']

  for (let i = 0; i < 30; i++) {
    const type = equipmentTypes[i % equipmentTypes.length]
    const brand = brands[Math.floor(Math.random() * brands.length)]
    const dept = departments[Math.floor(Math.random() * departments.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]

    await prisma.equipment.create({
      data: {
        name: `${brand.name} ${type} ${i + 1}`,
        status,
        purchaseDate: new Date(),
        brandId: brand.id,
        departmentId: dept.id,
        createdBy: admin.id,
      },
    })
  }

  console.log('✅ Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
