import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './_lib/prisma.js'
import { cors } from './_lib/cors.js'

type PrismaModel = {
  findMany: (args?: any) => Promise<any[]>
  findUnique: (args: any) => Promise<any>
  create: (args: any) => Promise<any>
  update: (args: any) => Promise<any>
  delete: (args: any) => Promise<any>
  updateMany?: (args: any) => Promise<any>
}

const models: Record<string, { model: PrismaModel; includes?: Record<string, boolean> }> = {
  leads: { model: prisma.lead },
  accounts: { model: prisma.account, includes: { contacts: true, deals: true, projects: true, pilots: true } },
  contacts: { model: prisma.contact },
  deals: { model: prisma.deal },
  projects: { model: prisma.project },
  tasks: { model: prisma.task },
  pilots: { model: prisma.pilot },
  notifications: { model: prisma.notification },
  users: { model: prisma.user },
  activities: { model: prisma.activity },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return

  const pathParts = (req.query.path as string[]) || []
  const entity = pathParts[0]
  const id = pathParts[1]
  const action = pathParts[2]

  if (!entity) {
    return res.status(404).json({ error: 'Not found' })
  }

  try {
    // Handle dashboard
    if (entity === 'dashboard' && req.method === 'GET' && !id) {
      const [accounts, deals, leads, tasks, activities, projects] = await Promise.all([
        prisma.account.findMany(),
        prisma.deal.findMany(),
        prisma.lead.findMany(),
        prisma.task.findMany(),
        prisma.activity.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
        prisma.project.findMany(),
      ])
      const totalMRR = accounts.reduce((s: number, a: any) => s + a.mrr, 0)
      const totalARR = accounts.reduce((s: number, a: any) => s + a.arr, 0)
      const openDeals = deals.filter((d: any) => d.stage !== 'closed_won' && d.stage !== 'closed_lost')
      const pipelineValue = openDeals.reduce((s: number, d: any) => s + d.value, 0)
      const atRiskAccounts = accounts.filter((a: any) => a.health === 'at_risk' || a.health === 'churning')
      const avgMargin = accounts.length > 0 ? accounts.reduce((s: number, a: any) => s + a.margin, 0) / accounts.length : 0
      const qualifiedLeads = leads.filter((l: any) => l.status === 'qualified').length

      return res.status(200).json({
        totalMRR, totalARR, pipelineValue, atRiskAccounts,
        avgMargin: Math.round(avgMargin), qualifiedLeads,
        topAccounts: [...accounts].sort((a: any, b: any) => b.mrr - a.mrr).slice(0, 5),
        recentActivities: activities,
        todayTasks: tasks.filter((t: any) => t.status !== 'done' && t.status !== 'cancelled').slice(0, 5),
        activeProjects: projects.filter((p: any) => p.status === 'active'),
        openDeals,
      })
    }

    // Handle notifications read-all
    if (entity === 'notifications' && action === 'read-all' && req.method === 'PATCH') {
      await prisma.notification.updateMany({ where: { read: false }, data: { read: true } })
      return res.status(200).json({ success: true })
    }

    if (!models[entity]) {
      return res.status(404).json({ error: 'Not found' })
    }

    const { model, includes } = models[entity]

    switch (req.method) {
      case 'GET': {
        if (id) {
          const item = await model.findUnique({ where: { id }, include: includes })
          if (!item) return res.status(404).json({ error: 'Not found' })
          return res.status(200).json(item)
        }
        const where: Record<string, string> = {}
        if (entity === 'activities') {
          if (req.query.entityType) where.entityType = req.query.entityType as string
          if (req.query.entityId) where.entityId = req.query.entityId as string
        }
        const items = await model.findMany({
          where: Object.keys(where).length ? where : undefined,
          orderBy: { createdAt: 'desc' },
          ...(entity === 'notifications' ? { take: 50 } : {}),
          ...(entity === 'activities' ? { take: 50 } : {}),
        })
        return res.status(200).json(items)
      }

      case 'POST': {
        const created = await model.create({ data: req.body })
        return res.status(201).json(created)
      }

      case 'PATCH': {
        if (!id) return res.status(400).json({ error: 'ID required' })
        const updated = await model.update({ where: { id }, data: req.body })
        return res.status(200).json(updated)
      }

      case 'DELETE': {
        if (!id) return res.status(400).json({ error: 'ID required' })
        await model.delete({ where: { id } })
        return res.status(204).end()
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error(`API error [${entity}]:`, error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
