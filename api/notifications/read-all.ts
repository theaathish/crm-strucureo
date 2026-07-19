import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../_lib/prisma.js'
import { cors } from '../_lib/cors.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    await prisma.notification.updateMany({
      where: { read: false },
      data: { read: true },
    })
    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Notifications read-all API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
