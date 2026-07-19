import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../_lib/prisma'
import { cors } from '../_lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return
  const { id } = req.query

  try {
    switch (req.method) {
      case 'GET':
        const deal = await prisma.deal.findUnique({ where: { id: id as string } })
        if (!deal) return res.status(404).json({ error: 'Deal not found' })
        return res.status(200).json(deal)
      case 'PATCH':
        const updated = await prisma.deal.update({ where: { id: id as string }, data: req.body })
        return res.status(200).json(updated)
      case 'DELETE':
        await prisma.deal.delete({ where: { id: id as string } })
        return res.status(204).end()
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Deal API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
