import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../_lib/prisma.js'
import { cors } from '../_lib/cors.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return
  const { id } = req.query

  try {
    switch (req.method) {
      case 'GET':
        const lead = await prisma.lead.findUnique({ where: { id: id as string } })
        if (!lead) return res.status(404).json({ error: 'Lead not found' })
        return res.status(200).json(lead)
      case 'PATCH':
        const updated = await prisma.lead.update({ where: { id: id as string }, data: req.body })
        return res.status(200).json(updated)
      case 'DELETE':
        await prisma.lead.delete({ where: { id: id as string } })
        return res.status(204).end()
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Lead API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
