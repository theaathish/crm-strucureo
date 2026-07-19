import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './_lib/prisma'
import { cors } from './_lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return

  try {
    switch (req.method) {
      case 'GET':
        const notifications = await prisma.notification.findMany({
          orderBy: { createdAt: 'desc' },
          take: 50,
        })
        return res.status(200).json(notifications)
      case 'POST':
        const newNotification = await prisma.notification.create({ data: req.body })
        return res.status(201).json(newNotification)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Notifications API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
