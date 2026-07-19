import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './_lib/prisma'
import { cors } from './_lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { entityType, entityId } = req.query
    const where: any = {}
    if (entityType) where.entityType = entityType
    if (entityId) where.entityId = entityId

    const activities = await prisma.activity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return res.status(200).json(activities)
  } catch (error) {
    console.error('Activities API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
