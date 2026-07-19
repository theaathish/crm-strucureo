import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './_lib/prisma'
import { cors } from './_lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
    return res.status(200).json(users)
  } catch (error) {
    console.error('Users API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
