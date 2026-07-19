import 'dotenv/config'
import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient({
  accelerateUrl: process.env['DATABASE_URL'],
})

async function main() {
  console.log('Seeding database...')

  const users = await Promise.all([
    prisma.user.create({ data: { name: 'Alex Rivera', email: 'alex@strucureo.com', role: 'owner', department: 'Executive' } }),
    prisma.user.create({ data: { name: 'Jordan Kim', email: 'jordan@strucureo.com', role: 'growth', department: 'Sales' } }),
    prisma.user.create({ data: { name: 'Sam Chen', email: 'sam@strucureo.com', role: 'rnd', department: 'R&D' } }),
    prisma.user.create({ data: { name: 'Morgan Lee', email: 'morgan@strucureo.com', role: 'product', department: 'Product' } }),
    prisma.user.create({ data: { name: 'Casey Brown', email: 'casey@strucureo.com', role: 'ai', department: 'AI' } }),
  ])
  console.log(`Created ${users.length} users`)

  const accounts = await Promise.all([
    prisma.account.create({ data: { name: 'Nexus Analytics', industry: 'Data & Analytics', website: 'nexusanalytics.com', mrr: 12500, arr: 150000, employees: 340, country: 'US', status: 'active', tier: 'enterprise', health: 'healthy', contractValue: 180000, margin: 68 } }),
    prisma.account.create({ data: { name: 'TechCorp Inc', industry: 'Software', website: 'techcorp.com', mrr: 8750, arr: 105000, employees: 220, country: 'US', status: 'active', tier: 'enterprise', health: 'healthy', contractValue: 120000, margin: 72 } }),
    prisma.account.create({ data: { name: 'Cloud Nine Tech', industry: 'Cloud Services', website: 'cloudnine.com', mrr: 18000, arr: 216000, employees: 580, country: 'US', status: 'active', tier: 'enterprise', health: 'healthy', contractValue: 250000, margin: 75 } }),
    prisma.account.create({ data: { name: 'FutureStack AI', industry: 'Artificial Intelligence', website: 'futurestack.ai', mrr: 22000, arr: 264000, employees: 120, country: 'US', status: 'active', tier: 'enterprise', health: 'healthy', contractValue: 300000, margin: 80 } }),
  ])
  console.log(`Created ${accounts.length} accounts`)

  const leads = await Promise.all([
    prisma.lead.create({ data: { name: 'James Wilson', company: 'TechCorp Inc', email: 'james@techcorp.com', phone: '+1 555 0101', status: 'qualified', source: 'Inbound', score: 87, value: 45000, assignedTo: users[1].id } }),
    prisma.lead.create({ data: { name: 'Emma Davis', company: 'Cloud Nine Tech', email: 'emma@cloudnine.com', phone: '+1 555 0104', status: 'qualified', source: 'Website', score: 91, value: 120000, assignedTo: users[1].id } }),
    prisma.lead.create({ data: { name: 'Olivia Brown', company: 'FutureStack AI', email: 'olivia@futurestack.ai', phone: '+1 555 0108', status: 'qualified', source: 'Inbound', score: 78, value: 67000, assignedTo: users[0].id } }),
  ])
  console.log(`Created ${leads.length} leads`)

  const contacts = await Promise.all([
    prisma.contact.create({ data: { name: 'Lisa Park', email: 'lisa@nexusanalytics.com', phone: '+1 555 0201', title: 'VP of Engineering', accountId: accounts[0].id, accountName: 'Nexus Analytics', type: 'primary' } }),
    prisma.contact.create({ data: { name: 'James Wilson', email: 'james@techcorp.com', phone: '+1 555 0101', title: 'CTO', accountId: accounts[1].id, accountName: 'TechCorp Inc', type: 'primary' } }),
    prisma.contact.create({ data: { name: 'Emma Davis', email: 'emma@cloudnine.com', phone: '+1 555 0104', title: 'CEO', accountId: accounts[2].id, accountName: 'Cloud Nine Tech', type: 'executive' } }),
    prisma.contact.create({ data: { name: 'Olivia Brown', email: 'olivia@futurestack.ai', phone: '+1 555 0108', title: 'Head of Partnerships', accountId: accounts[3].id, accountName: 'FutureStack AI', type: 'primary' } }),
  ])
  console.log(`Created ${contacts.length} contacts`)

  const deals = await Promise.all([
    prisma.deal.create({ data: { title: 'Nexus Analytics - Enterprise Expansion', value: 180000, stage: 'negotiation', probability: 75, accountId: accounts[0].id, accountName: 'Nexus Analytics', assignedTo: users[0].id, description: 'Expanding license to 500 seats' } }),
    prisma.deal.create({ data: { title: 'TechCorp - Platform Upgrade', value: 120000, stage: 'proposal', probability: 55, accountId: accounts[1].id, accountName: 'TechCorp Inc', assignedTo: users[1].id, description: 'Migrating to enterprise tier' } }),
    prisma.deal.create({ data: { title: 'Cloud Nine - New Module', value: 85000, stage: 'discovery', probability: 30, accountId: accounts[2].id, accountName: 'Cloud Nine Tech', assignedTo: users[1].id, description: 'AI automation module' } }),
    prisma.deal.create({ data: { title: 'FutureStack - Premium Support', value: 45000, stage: 'closed_won', probability: 100, accountId: accounts[3].id, accountName: 'FutureStack AI', assignedTo: users[0].id, description: '24/7 dedicated support package' } }),
  ])
  console.log(`Created ${deals.length} deals`)

  const tasks = await Promise.all([
    prisma.task.create({ data: { title: 'Follow up with James Wilson re: enterprise demo', status: 'todo', priority: 'high', assignedTo: users[1].id, dueDate: new Date('2025-01-20'), relatedType: 'lead', relatedId: leads[0].id, relatedName: 'James Wilson', tags: ['sales', 'demo'] } }),
    prisma.task.create({ data: { title: 'Prepare Q1 pipeline report', status: 'in_progress', priority: 'urgent', assignedTo: users[0].id, dueDate: new Date('2025-01-25'), tags: ['reporting', 'board'] } }),
    prisma.task.create({ data: { title: 'Send renewal proposal to DataFlow', status: 'in_progress', priority: 'high', assignedTo: users[1].id, dueDate: new Date('2025-01-19'), tags: ['sales', 'renewal'] } }),
  ])
  console.log(`Created ${tasks.length} tasks`)

  const activities = await Promise.all([
    prisma.activity.create({ data: { type: 'call', description: 'Discovery call with James Wilson - discussed platform needs', entityType: 'lead', entityId: leads[0].id, entityName: 'James Wilson', userId: users[1].id, userName: 'Jordan Kim' } }),
    prisma.activity.create({ data: { type: 'deal', description: "Deal 'FutureStack - Premium Support' moved to Closed Won", entityType: 'deal', entityId: deals[3].id, entityName: 'FutureStack - Premium Support', userId: users[0].id, userName: 'Alex Rivera' } }),
    prisma.activity.create({ data: { type: 'email', description: 'Sent renewal proposal to DataFlow Systems team', entityType: 'deal', entityId: deals[2].id, entityName: 'DataFlow - Annual Renewal', userId: users[1].id, userName: 'Jordan Kim' } }),
  ])
  console.log(`Created ${activities.length} activities`)

  console.log('Seeding complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
