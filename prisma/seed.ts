import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { createHash } from 'crypto'

const directUrl = process.env['DIRECT_DATABASE_URL']
if (!directUrl) throw new Error('DIRECT_DATABASE_URL is not set')

const adapter = new PrismaPg({ connectionString: directUrl })
const prisma = new PrismaClient({ adapter })

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

async function main() {
  console.log('Seeding database...')

  // Clean in order (foreign keys)
  await prisma.pilot.deleteMany()
  await prisma.project.deleteMany()
  await prisma.task.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.deal.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  const now = new Date()
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000)
  const daysFromNow = (d: number) => new Date(now.getTime() + d * 86400000)

  const hashedPassword = hashPassword('Supra@10')

  // Users
  const ceo = await prisma.user.create({
    data: {
      name: 'Aathish S',
      email: 'ceo@strucureo.com',
      password: hashedPassword,
      role: 'CEO',
      department: 'Executive',
    },
  })

  const usersData = [
    { name: 'Priya Mehta', email: 'priya@strucureo.com', role: 'VP of Sales', department: 'Sales' },
    { name: 'Vikram Joshi', email: 'vikram@strucureo.com', role: 'Senior Account Executive', department: 'Sales' },
    { name: 'Neha Kapoor', email: 'neha@strucureo.com', role: 'Business Development Representative', department: 'Sales' },
    { name: 'Arjun Nair', email: 'arjun@strucureo.com', role: 'Head of Marketing', department: 'Marketing' },
  ]

  const createdUsers = []
  for (const u of usersData) {
    const user = await prisma.user.create({ data: { ...u, password: hashedPassword } })
    createdUsers.push(user)
  }
  const allUsers = [ceo, ...createdUsers]

  // Accounts
  const accountsData = [
    { name: 'TechNova Solutions', industry: 'SaaS', tier: 'enterprise', website: 'https://technova.io', employees: 450, arr: 25000000, mrr: 2083333, country: 'USA', status: 'active', health: 'healthy', contractValue: 250000, margin: 35 },
    { name: 'GreenLeaf Organics', industry: 'Manufacturing', tier: 'mid-market', website: 'https://greenleaf.com', employees: 180, arr: 12000000, mrr: 1000000, country: 'USA', status: 'active', health: 'healthy', contractValue: 180000, margin: 28 },
    { name: 'UrbanEdge Properties', industry: 'Real Estate', tier: 'mid-market', website: 'https://urbanedge.com', employees: 320, arr: 35000000, mrr: 2916667, country: 'USA', status: 'active', health: 'at_risk', contractValue: 120000, margin: 22 },
    { name: 'CloudSync Technologies', industry: 'Cloud Services', tier: 'enterprise', website: 'https://cloudsync.io', employees: 600, arr: 50000000, mrr: 4166667, country: 'USA', status: 'active', health: 'healthy', contractValue: 350000, margin: 42 },
    { name: 'Meridian Healthcare', industry: 'Healthcare', tier: 'enterprise', website: 'https://meridianhealth.com', employees: 850, arr: 75000000, mrr: 6250000, country: 'USA', status: 'active', health: 'healthy', contractValue: 200000, margin: 30 },
    { name: 'Apex Manufacturing', industry: 'Manufacturing', tier: 'mid-market', website: 'https://apexmfg.com', employees: 420, arr: 30000000, mrr: 2500000, country: 'USA', status: 'active', health: 'healthy', contractValue: 150000, margin: 25 },
    { name: 'BrightStar Education', industry: 'Education', tier: 'smb', website: 'https://brightstar.edu', employees: 95, arr: 8000000, mrr: 666667, country: 'USA', status: 'active', health: 'healthy', contractValue: 75000, margin: 20 },
    { name: 'Velocity Logistics', industry: 'Logistics', tier: 'mid-market', website: 'https://velocitylog.com', employees: 280, arr: 20000000, mrr: 1666667, country: 'USA', status: 'active', health: 'at_risk', contractValue: 220000, margin: 30 },
    { name: 'CoreStack Analytics', industry: 'Data Analytics', tier: 'smb', website: 'https://corestack.io', employees: 65, arr: 5000000, mrr: 416667, country: 'USA', status: 'active', health: 'healthy', contractValue: 95000, margin: 18 },
    { name: 'Pinnacle Financial', industry: 'Finance', tier: 'enterprise', website: 'https://pinnaclefin.com', employees: 1200, arr: 100000000, mrr: 8333333, country: 'USA', status: 'active', health: 'healthy', contractValue: 400000, margin: 38 },
    { name: 'Summit Energy', industry: 'Energy', tier: 'mid-market', website: 'https://summitenergy.com', employees: 350, arr: 40000000, mrr: 3333333, country: 'USA', status: 'active', health: 'healthy', contractValue: 95000, margin: 27 },
    { name: 'Horizon Media Group', industry: 'Media', tier: 'smb', website: 'https://horizonmedia.com', employees: 75, arr: 6000000, mrr: 500000, country: 'USA', status: 'active', health: 'healthy', contractValue: 60000, margin: 15 },
  ]

  const createdAccounts = []
  for (const a of accountsData) {
    const account = await prisma.account.create({ data: a })
    createdAccounts.push(account)
  }

  // Contacts
  const contactsData = [
    { name: 'David Chen', title: 'CTO', email: 'david.chen@technova.io', phone: '+1-555-1001' },
    { name: 'Sarah Williams', title: 'VP Engineering', email: 'sarah.w@technova.io', phone: '+1-555-1002' },
    { name: 'Michael Brown', title: 'CEO', email: 'michael@greenleaf.com', phone: '+1-555-1003' },
    { name: 'Lisa Anderson', title: 'COO', email: 'lisa.a@urbanedge.com', phone: '+1-555-1004' },
    { name: 'Robert Taylor', title: 'VP Operations', email: 'r.taylor@cloudsync.io', phone: '+1-555-1005' },
    { name: 'Jennifer Martinez', title: 'CIO', email: 'jennifer.m@meridianhealth.com', phone: '+1-555-1006' },
    { name: 'James Wilson', title: 'Director of IT', email: 'james.w@apexmfg.com', phone: '+1-555-1007' },
    { name: 'Amanda Lee', title: 'Dean', email: 'amanda.lee@brightstar.edu', phone: '+1-555-1008' },
    { name: 'Kevin Garcia', title: 'VP Supply Chain', email: 'kevin.g@velocitylog.com', phone: '+1-555-1009' },
    { name: 'Rachel Thompson', title: 'Head of Analytics', email: 'rachel@corestack.io', phone: '+1-555-1010' },
    { name: 'Daniel Kim', title: 'Managing Director', email: 'daniel.k@pinnaclefin.com', phone: '+1-555-1011' },
    { name: 'Sophia Patel', title: 'CFO', email: 'sophia.p@summitenergy.com', phone: '+1-555-1012' },
  ]

  const createdContacts = []
  for (let i = 0; i < contactsData.length; i++) {
    const contact = await prisma.contact.create({
      data: {
        ...contactsData[i],
        accountId: createdAccounts[i % createdAccounts.length].id,
        accountName: createdAccounts[i % createdAccounts.length].name,
      },
    })
    createdContacts.push(contact)
  }

  // Leads
  const leadsData = [
    { name: 'Tom Harris', company: 'InnovateTech', email: 'tom@innovatetech.com', phone: '+1-555-2001', source: 'website', status: 'new', score: 75, value: 80000 },
    { name: 'Maria Gonzalez', company: 'DataFlow Systems', email: 'maria@dataflow.com', phone: '+1-555-2002', source: 'referral', status: 'contacted', score: 60, value: 50000 },
    { name: 'Chris Johnson', company: 'NextGen Solutions', email: 'chris@nextgen.com', phone: '+1-555-2003', source: 'linkedin', status: 'qualified', score: 85, value: 120000 },
    { name: 'Emily White', company: 'ProScale Inc', email: 'emily@proscale.com', phone: '+1-555-2004', source: 'event', status: 'qualified', score: 70, value: 95000 },
    { name: 'Andrew Davis', company: 'Quantum Labs', email: 'andrew@quantumlabs.com', phone: '+1-555-2005', source: 'cold_call', status: 'new', score: 40, value: 30000 },
    { name: 'Nicole Robinson', company: 'SkyHigh Cloud', email: 'nicole@skyhigh.com', phone: '+1-555-2006', source: 'website', status: 'contacted', score: 55, value: 65000 },
    { name: 'Brian Clark', company: 'FusionWorks', email: 'brian@fusionworks.com', phone: '+1-555-2007', source: 'referral', status: 'qualified', score: 80, value: 110000 },
    { name: 'Michelle Lewis', company: 'PrimeEdge Corp', email: 'michelle@primeedge.com', phone: '+1-555-2008', source: 'linkedin', status: 'new', score: 45, value: 40000 },
    { name: 'Ryan Walker', company: 'NovaStar Inc', email: 'ryan@novastar.com', phone: '+1-555-2009', source: 'website', status: 'contacted', score: 65, value: 75000 },
    { name: 'Laura Hall', company: 'CyberShield Security', email: 'laura@cybershield.com', phone: '+1-555-2010', source: 'event', status: 'qualified', score: 90, value: 150000 },
  ]

  for (const l of leadsData) {
    await prisma.lead.create({ data: { ...l, assignedTo: allUsers[leadsData.indexOf(l) % allUsers.length].id } })
  }

  // Deals
  const dealsData = [
    { title: 'TechNova Enterprise License', value: 250000, stage: 'closing', probability: 90, expectedCloseDate: daysFromNow(14) },
    { title: 'GreenLeaf Digital Transformation', value: 180000, stage: 'proposal', probability: 60, expectedCloseDate: daysFromNow(30) },
    { title: 'UrbanEdge CRM Integration', value: 120000, stage: 'negotiation', probability: 75, expectedCloseDate: daysFromNow(21) },
    { title: 'CloudSync Platform Migration', value: 350000, stage: 'discovery', probability: 30, expectedCloseDate: daysFromNow(60) },
    { title: 'Meridian Healthcare Analytics', value: 200000, stage: 'won', probability: 100, expectedCloseDate: daysAgo(5) },
    { title: 'Apex Manufacturing IoT', value: 150000, stage: 'proposal', probability: 50, expectedCloseDate: daysFromNow(45) },
    { title: 'BrightStar EdTech Platform', value: 75000, stage: 'negotiation', probability: 80, expectedCloseDate: daysFromNow(10) },
    { title: 'Velocity Fleet Management', value: 220000, stage: 'discovery', probability: 25, expectedCloseDate: daysFromNow(90) },
    { title: 'Pinnacle Compliance Suite', value: 400000, stage: 'proposal', probability: 55, expectedCloseDate: daysFromNow(35) },
    { title: 'Summit Energy Dashboard', value: 95000, stage: 'closing', probability: 95, expectedCloseDate: daysFromNow(7) },
  ]

  const createdDeals = []
  for (let i = 0; i < dealsData.length; i++) {
    const deal = await prisma.deal.create({
      data: {
        ...dealsData[i],
        accountId: createdAccounts[i % createdAccounts.length].id,
        accountName: createdAccounts[i % createdAccounts.length].name,
        contactId: createdContacts[i % createdContacts.length].id,
        assignedTo: allUsers[i % allUsers.length].id,
        description: `Strategic deal for ${createdAccounts[i % createdAccounts.length].name}`,
      },
    })
    createdDeals.push(deal)
  }

  // Projects
  const projectsData = [
    { name: 'TechNova Implementation', status: 'in_progress', progress: 65, startDate: daysAgo(30), endDate: daysFromNow(45), budget: 150000, spent: 97500, margin: 35 },
    { name: 'GreenLeaf Data Migration', status: 'in_progress', progress: 40, startDate: daysAgo(15), endDate: daysFromNow(60), budget: 80000, spent: 32000, margin: 28 },
    { name: 'Meridian Analytics Dashboard', status: 'completed', progress: 100, startDate: daysAgo(90), endDate: daysAgo(5), budget: 200000, spent: 185000, margin: 30 },
    { name: 'UrbanEdge CRM Setup', status: 'in_progress', progress: 25, startDate: daysAgo(7), endDate: daysFromNow(75), budget: 120000, spent: 30000, margin: 22 },
    { name: 'Pinnacle Compliance Module', status: 'planning', progress: 10, startDate: daysFromNow(14), endDate: daysFromNow(120), budget: 250000, spent: 25000, margin: 38 },
    { name: 'Summit Energy Integration', status: 'in_progress', progress: 80, startDate: daysAgo(45), endDate: daysFromNow(7), budget: 95000, spent: 76000, margin: 27 },
  ]

  const createdProjects = []
  for (let i = 0; i < projectsData.length; i++) {
    const project = await prisma.project.create({
      data: {
        ...projectsData[i],
        accountId: createdAccounts[i % createdAccounts.length].id,
        accountName: createdAccounts[i % createdAccounts.length].name,
        assignedTo: [allUsers[i % allUsers.length].id],
      },
    })
    createdProjects.push(project)
  }

  // Pilots
  const pilotsData = [
    { name: 'AI-Powered Analytics Pilot', status: 'active', startDate: daysAgo(20), endDate: daysFromNow(30), value: 50000, outcomes: 'Testing ML models for predictive analytics', description: 'Testing ML models for predictive analytics' },
    { name: 'IoT Sensor Integration', status: 'active', startDate: daysAgo(10), endDate: daysFromNow(50), value: 35000, outcomes: 'Evaluating IoT platform for manufacturing', description: 'Evaluating IoT platform for manufacturing' },
    { name: 'Blockchain Supply Chain', status: 'completed', startDate: daysAgo(60), endDate: daysAgo(10), value: 40000, outcomes: 'Successful pilot with 3 suppliers', description: 'Blockchain supply chain pilot' },
    { name: 'Edge Computing Demo', status: 'proposed', startDate: daysFromNow(7), endDate: daysFromNow(45), value: 25000, outcomes: 'Planning phase for edge deployment', description: 'Edge computing demonstration' },
  ]

  for (let i = 0; i < pilotsData.length; i++) {
    await prisma.pilot.create({
      data: {
        ...pilotsData[i],
        accountId: createdAccounts[i].id,
        accountName: createdAccounts[i].name,
        contactId: createdContacts[i].id,
      },
    })
  }

  // Tasks
  const tasksData = [
    { title: 'Follow up with TechNova on contract renewal', status: 'todo', priority: 'high', dueDate: daysFromNow(3) },
    { title: 'Prepare Q4 sales forecast', status: 'in_progress', priority: 'high', dueDate: daysFromNow(7) },
    { title: 'Schedule product demo for CloudSync', status: 'todo', priority: 'medium', dueDate: daysFromNow(14) },
    { title: 'Review GreenLeaf proposal document', status: 'done', priority: 'medium', dueDate: daysAgo(2) },
    { title: 'Send onboarding materials to Meridian', status: 'done', priority: 'low', dueDate: daysAgo(5) },
    { title: 'Update CRM with UrbanEdge meeting notes', status: 'todo', priority: 'high', dueDate: daysFromNow(1) },
    { title: 'Coordinate with engineering on Pinnacle requirements', status: 'in_progress', priority: 'medium', dueDate: daysFromNow(10) },
    { title: 'Prepare Summit go-live checklist', status: 'todo', priority: 'high', dueDate: daysFromNow(5) },
    { title: 'Draft case study for BrightStar project', status: 'todo', priority: 'low', dueDate: daysFromNow(21) },
    { title: 'Quarterly business review presentation', status: 'in_progress', priority: 'high', dueDate: daysFromNow(14) },
    { title: 'Update lead scoring model parameters', status: 'todo', priority: 'medium', dueDate: daysFromNow(7) },
    { title: 'Schedule Apex factory visit', status: 'todo', priority: 'low', dueDate: daysFromNow(30) },
  ]

  for (let i = 0; i < tasksData.length; i++) {
    await prisma.task.create({
      data: {
        ...tasksData[i],
        assignedTo: allUsers[i % allUsers.length].id,
        relatedType: i < 5 ? 'deal' : i < 8 ? 'project' : undefined,
        relatedId: i < 5 ? createdDeals[i].id : i < 8 ? createdProjects[i - 5].id : undefined,
        relatedName: i < 5 ? createdDeals[i].title : i < 8 ? createdProjects[i - 5].name : undefined,
      },
    })
  }

  // Activities
  const activityTypes = ['call', 'email', 'meeting', 'note', 'task']
  for (let i = 0; i < 20; i++) {
    await prisma.activity.create({
      data: {
        type: activityTypes[i % activityTypes.length],
        description: `Completed ${activityTypes[i % activityTypes.length]} regarding project discussion and next steps.`,
        entityType: i < 10 ? 'account' : 'deal',
        entityId: i < 10 ? createdAccounts[i % createdAccounts.length].id : createdDeals[i % createdDeals.length].id,
        entityName: i < 10 ? createdAccounts[i % createdAccounts.length].name : createdDeals[i % createdDeals.length].title,
        userId: allUsers[i % allUsers.length].id,
        userName: allUsers[i % allUsers.length].name,
      },
    })
  }

  // Notifications
  const notificationsData = [
    { title: 'New deal created', message: 'TechNova Enterprise License has been added to the pipeline', type: 'info', entityType: 'deal' },
    { title: 'Task overdue', message: 'Update CRM with UrbanEdge meeting notes is overdue', type: 'warning', entityType: 'task' },
    { title: 'Deal won!', message: 'Meridian Healthcare Analytics deal closed at $200K', type: 'success', entityType: 'deal' },
    { title: 'New lead assigned', message: 'Tom Harris from InnovateTech has been assigned to you', type: 'info', entityType: 'lead' },
    { title: 'Project milestone', message: 'TechNova Implementation has reached 65% completion', type: 'info', entityType: 'project' },
  ]

  for (const n of notificationsData) {
    await prisma.notification.create({
      data: { ...n, userId: ceo.id },
    })
  }

  console.log('Database seeded successfully!')
  console.log(`Created ${allUsers.length} users, ${createdAccounts.length} accounts, ${createdContacts.length} contacts, ${leadsData.length} leads, ${createdDeals.length} deals, ${createdProjects.length} projects`)
  console.log('\nLogin: ceo@strucureo.com / Supra@10')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
