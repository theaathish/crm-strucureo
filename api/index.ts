import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './_lib/prisma.js'
import { cors } from './_lib/cors.js'
import { hashPassword, verifyPassword } from './_lib/auth.js'

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

  if (req.url?.includes('debug')) {
    return res.status(200).json({ url: req.url, method: req.method, headers: Object.fromEntries(Object.entries(req.headers).filter(([k]) => !k.includes('auth') && !k.includes('cookie') && !k.includes('x-forwarded'))) })
  }

  const url = new URL(req.url || '', 'https://example.com')
  const pathParts = url.pathname.replace(/^\/api\//, '').split('/').filter(Boolean)
  const entity = pathParts[0]
  const id = pathParts[1]
  const action = pathParts[2]

  if (!entity) {
    return res.status(404).json({ error: 'Not found' })
  }

  try {
    // Handle login
    if (entity === 'auth' && id === 'login' && req.method === 'POST') {
      const { email, password } = req.body || {}
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' })
      }
      const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
      if (!user || !verifyPassword(password, user.password)) {
        return res.status(401).json({ error: 'Invalid email or password' })
      }
      const { password: _, ...userWithoutPassword } = user
      return res.status(200).json(userWithoutPassword)
    }

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

      // Compute chart data from real records
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

      const mrrData = accounts.reduce((acc: Record<string, number>, a: any) => {
        const d = new Date(a.createdAt)
        const key = months[d.getMonth()]
        acc[key] = (acc[key] || 0) + a.mrr
        return acc
      }, {})
      const mrrChartData = months.filter(m => mrrData[m]).map(m => ({ month: m, mrr: mrrData[m] }))
      if (mrrChartData.length === 0) {
        mrrChartData.push({ month: 'Jan', mrr: totalMRR })
      }

      const revenueData: Record<string, { revenue: number; target: number }> = {}
      deals.filter((d: any) => d.stage === 'closed_won').forEach((d: any) => {
        const dt = new Date(d.createdAt)
        const key = months[dt.getMonth()]
        if (!revenueData[key]) revenueData[key] = { revenue: 0, target: 0 }
        revenueData[key].revenue += d.value
      })
      accounts.forEach((a: any) => {
        const dt = new Date(a.createdAt)
        const key = months[dt.getMonth()]
        if (!revenueData[key]) revenueData[key] = { revenue: 0, target: 0 }
        revenueData[key].target += a.mrr * 1.1
      })
      const revenueChartData = months
        .filter(m => revenueData[m])
        .map(m => ({ month: m, revenue: revenueData[m].revenue, target: revenueData[m].target }))
      if (revenueChartData.length === 0) {
        revenueChartData.push({ month: 'Jan', revenue: totalMRR, target: totalMRR * 1.1 })
      }

      const pipelineData: Record<string, Record<string, number>> = {}
      const stageKeys = ['discovery', 'proposal', 'negotiation', 'closed']
      deals.forEach((d: any) => {
        const dt = new Date(d.createdAt)
        const key = months[dt.getMonth()]
        if (!pipelineData[key]) pipelineData[key] = {}
        const stage = stageKeys.includes(d.stage) ? d.stage : 'discovery'
        pipelineData[key][stage] = (pipelineData[key][stage] || 0) + 1
      })
      const pipelineChartData = months
        .filter(m => pipelineData[m])
        .map(m => ({ month: m, ...pipelineData[m] }))
      if (pipelineChartData.length === 0) {
        pipelineChartData.push({ month: 'Jan', discovery: 1, proposal: 0, negotiation: 0, closed: 0 })
      }

      return res.status(200).json({
        totalMRR, totalARR, pipelineValue, atRiskAccounts,
        avgMargin: Math.round(avgMargin), qualifiedLeads,
        topAccounts: [...accounts].sort((a: any, b: any) => b.mrr - a.mrr).slice(0, 5),
        recentActivities: activities,
        todayTasks: tasks.filter((t: any) => t.status !== 'done' && t.status !== 'cancelled').slice(0, 5),
        activeProjects: projects.filter((p: any) => p.status === 'active'),
        openDeals,
        revenueData: revenueChartData,
        mrrData: mrrChartData,
        pipelineData: pipelineChartData,
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
          if (entity === 'users' && item.password) delete item.password
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
        if (entity === 'users') {
          items.forEach((u: any) => { delete u.password })
        }
        return res.status(200).json(items)
      }

      case 'POST': {
        if (entity === 'users' && req.body.password) {
          req.body.password = hashPassword(req.body.password)
        }
        const created = await model.create({ data: req.body })
        if (entity === 'users' && created.password) delete created.password
        return res.status(201).json(created)
      }

      case 'PATCH': {
        if (!id) return res.status(400).json({ error: 'ID required' })
        if (entity === 'users' && req.body.password) {
          req.body.password = hashPassword(req.body.password)
        }
        const updated = await model.update({ where: { id }, data: req.body })
        if (entity === 'users' && updated.password) delete updated.password
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
