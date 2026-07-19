import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './_lib/prisma.js'
import { cors } from './_lib/cors.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return

  try {
    switch (req.method) {
      case 'GET':
        const accounts = await prisma.account.findMany({ orderBy: { createdAt: 'desc' } })
        return res.status(200).json(accounts)
      case 'POST':
        const newAccount = await prisma.account.create({ data: req.body })
        return res.status(201).json(newAccount)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Accounts API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
