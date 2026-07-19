import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './_lib/prisma'
import { cors } from './_lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return

  const apiKey = req.headers['x-api-key']
  if (apiKey !== process.env.MCP_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { method, params } = req.body

  try {
    switch (method) {
      case 'tools/list':
        return res.status(200).json({
          tools: [
            { name: 'list_leads', description: 'List all leads', inputSchema: { type: 'object', properties: { status: { type: 'string' } } } },
            { name: 'get_lead', description: 'Get lead by ID', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
            { name: 'create_lead', description: 'Create a new lead', inputSchema: { type: 'object', properties: { name: { type: 'string' }, company: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string' }, source: { type: 'string' }, value: { type: 'number' } }, required: ['name', 'company', 'email'] } },
            { name: 'update_lead', description: 'Update a lead', inputSchema: { type: 'object', properties: { id: { type: 'string' }, status: { type: 'string' }, score: { type: 'number' }, notes: { type: 'string' } }, required: ['id'] } },
            { name: 'delete_lead', description: 'Delete a lead', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
            { name: 'list_accounts', description: 'List all accounts', inputSchema: { type: 'object', properties: { tier: { type: 'string' }, health: { type: 'string' } } } },
            { name: 'get_account', description: 'Get account by ID', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
            { name: 'create_account', description: 'Create a new account', inputSchema: { type: 'object', properties: { name: { type: 'string' }, industry: { type: 'string' }, website: { type: 'string' }, tier: { type: 'string' } }, required: ['name', 'industry'] } },
            { name: 'update_account', description: 'Update an account', inputSchema: { type: 'object', properties: { id: { type: 'string' }, mrr: { type: 'number' }, health: { type: 'string' } }, required: ['id'] } },
            { name: 'list_contacts', description: 'List all contacts', inputSchema: { type: 'object', properties: { accountId: { type: 'string' } } } },
            { name: 'create_contact', description: 'Create a new contact', inputSchema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string' }, title: { type: 'string' }, accountId: { type: 'string' } }, required: ['name', 'email', 'accountId'] } },
            { name: 'list_deals', description: 'List all deals', inputSchema: { type: 'object', properties: { stage: { type: 'string' } } } },
            { name: 'get_deal', description: 'Get deal by ID', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
            { name: 'create_deal', description: 'Create a new deal', inputSchema: { type: 'object', properties: { title: { type: 'string' }, value: { type: 'number' }, accountId: { type: 'string' }, stage: { type: 'string' } }, required: ['title', 'value', 'accountId'] } },
            { name: 'list_projects', description: 'List all projects', inputSchema: { type: 'object', properties: { status: { type: 'string' } } } },
            { name: 'list_tasks', description: 'List all tasks', inputSchema: { type: 'object', properties: { status: { type: 'string' }, assignedTo: { type: 'string' } } } },
            { name: 'create_task', description: 'Create a new task', inputSchema: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' }, priority: { type: 'string' }, assignedTo: { type: 'string' }, dueDate: { type: 'string' } }, required: ['title'] } },
            { name: 'list_pilots', description: 'List all pilots', inputSchema: { type: 'object', properties: { status: { type: 'string' } } } },
            { name: 'get_dashboard', description: 'Get dashboard summary', inputSchema: { type: 'object', properties: {} } },
          ],
        })

      case 'tools/call':
        const { name, arguments: args } = params

        switch (name) {
          case 'list_leads': {
            const where = args?.status ? { status: args.status } : {}
            const leads = await prisma.lead.findMany({ where, orderBy: { createdAt: 'desc' } })
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(leads, null, 2) }] })
          }
          case 'get_lead': {
            const lead = await prisma.lead.findUnique({ where: { id: args.id } })
            if (!lead) return res.status(200).json({ content: [{ type: 'text', text: 'Lead not found' }], isError: true })
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(lead, null, 2) }] })
          }
          case 'create_lead': {
            const lead = await prisma.lead.create({ data: args })
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(lead, null, 2) }] })
          }
          case 'update_lead': {
            const { id, ...data } = args
            const lead = await prisma.lead.update({ where: { id }, data })
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(lead, null, 2) }] })
          }
          case 'delete_lead': {
            await prisma.lead.delete({ where: { id: args.id } })
            return res.status(200).json({ content: [{ type: 'text', text: 'Lead deleted' }] })
          }
          case 'list_accounts': {
            const where: any = {}
            if (args?.tier) where.tier = args.tier
            if (args?.health) where.health = args.health
            const accounts = await prisma.account.findMany({ where, orderBy: { createdAt: 'desc' } })
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(accounts, null, 2) }] })
          }
          case 'get_account': {
            const account = await prisma.account.findUnique({ where: { id: args.id }, include: { contacts: true, deals: true, projects: true } })
            if (!account) return res.status(200).json({ content: [{ type: 'text', text: 'Account not found' }], isError: true })
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(account, null, 2) }] })
          }
          case 'create_account': {
            const account = await prisma.account.create({ data: args })
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(account, null, 2) }] })
          }
          case 'update_account': {
            const { id, ...data } = args
            const account = await prisma.account.update({ where: { id }, data })
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(account, null, 2) }] })
          }
          case 'list_contacts': {
            const where = args?.accountId ? { accountId: args.accountId } : {}
            const contacts = await prisma.contact.findMany({ where, orderBy: { createdAt: 'desc' } })
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(contacts, null, 2) }] })
          }
          case 'create_contact': {
            const contact = await prisma.contact.create({ data: args })
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(contact, null, 2) }] })
          }
          case 'list_deals': {
            const where = args?.stage ? { stage: args.stage } : {}
            const deals = await prisma.deal.findMany({ where, orderBy: { createdAt: 'desc' } })
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(deals, null, 2) }] })
          }
          case 'get_deal': {
            const deal = await prisma.deal.findUnique({ where: { id: args.id } })
            if (!deal) return res.status(200).json({ content: [{ type: 'text', text: 'Deal not found' }], isError: true })
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(deal, null, 2) }] })
          }
          case 'create_deal': {
            const deal = await prisma.deal.create({ data: args })
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(deal, null, 2) }] })
          }
          case 'list_projects': {
            const where = args?.status ? { status: args.status } : {}
            const projects = await prisma.project.findMany({ where, orderBy: { createdAt: 'desc' } })
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(projects, null, 2) }] })
          }
          case 'list_tasks': {
            const where: any = {}
            if (args?.status) where.status = args.status
            if (args?.assignedTo) where.assignedTo = args.assignedTo
            const tasks = await prisma.task.findMany({ where, orderBy: { createdAt: 'desc' } })
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(tasks, null, 2) }] })
          }
          case 'create_task': {
            const task = await prisma.task.create({ data: args })
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(task, null, 2) }] })
          }
          case 'list_pilots': {
            const where = args?.status ? { status: args.status } : {}
            const pilots = await prisma.pilot.findMany({ where, orderBy: { createdAt: 'desc' } })
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(pilots, null, 2) }] })
          }
          case 'get_dashboard': {
            const [accounts, deals, leads, tasks] = await Promise.all([
              prisma.account.findMany(),
              prisma.deal.findMany(),
              prisma.lead.findMany(),
              prisma.task.findMany(),
            ])
            const summary = {
              totalMRR: accounts.reduce((s, a) => s + a.mrr, 0),
              totalARR: accounts.reduce((s, a) => s + a.arr, 0),
              pipelineValue: deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).reduce((s, d) => s + d.value, 0),
              totalLeads: leads.length,
              qualifiedLeads: leads.filter(l => l.status === 'qualified').length,
              openTasks: tasks.filter(t => t.status !== 'done' && t.status !== 'cancelled').length,
            }
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }] })
          }
          default:
            return res.status(200).json({ content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true })
        }

      default:
        return res.status(200).json({
          jsonrpc: '2.0',
          error: { code: -32601, message: `Method not found: ${method}` },
          id: req.body.id,
        })
    }
  } catch (error) {
    console.error('MCP error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
