import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './_lib/prisma.js'
import { cors } from './_lib/cors.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const [accounts, deals, leads, tasks, activities, projects] = await Promise.all([
      prisma.account.findMany(),
      prisma.deal.findMany(),
      prisma.lead.findMany(),
      prisma.task.findMany(),
      prisma.activity.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
      prisma.project.findMany(),
    ])

    const totalMRR = accounts.reduce((s, a) => s + a.mrr, 0)
    const totalARR = accounts.reduce((s, a) => s + a.arr, 0)
    const openDeals = deals.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost')
    const pipelineValue = openDeals.reduce((s, d) => s + d.value, 0)
    const atRiskAccounts = accounts.filter(a => a.health === 'at_risk' || a.health === 'churning')
    const avgMargin = accounts.length > 0
      ? accounts.reduce((s, a) => s + a.margin, 0) / accounts.length
      : 0
    const qualifiedLeads = leads.filter(l => l.status === 'qualified').length

    return res.status(200).json({
      totalMRR,
      totalARR,
      pipelineValue,
      atRiskAccounts,
      avgMargin: Math.round(avgMargin),
      qualifiedLeads,
      topAccounts: [...accounts].sort((a, b) => b.mrr - a.mrr).slice(0, 5),
      recentActivities: activities,
      todayTasks: tasks.filter(t => t.status !== 'done' && t.status !== 'cancelled').slice(0, 5),
      activeProjects: projects.filter(p => p.status === 'active'),
      openDeals,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
