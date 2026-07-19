import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './_lib/prisma.js'
import { cors } from './_lib/cors.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return

  try {
    switch (req.method) {
      case 'GET':
        const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } })
        return res.status(200).json(leads)
      case 'POST':
        const newLead = await prisma.lead.create({ data: req.body })
        return res.status(201).json(newLead)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Leads API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
