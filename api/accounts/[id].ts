import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../_lib/prisma'
import { cors } from '../_lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return
  const { id } = req.query

  try {
    switch (req.method) {
      case 'GET':
        const account = await prisma.account.findUnique({
          where: { id: id as string },
          include: { contacts: true, deals: true, projects: true, pilots: true },
        })
        if (!account) return res.status(404).json({ error: 'Account not found' })
        return res.status(200).json(account)
      case 'PATCH':
        const updated = await prisma.account.update({ where: { id: id as string }, data: req.body })
        return res.status(200).json(updated)
      case 'DELETE':
        await prisma.account.delete({ where: { id: id as string } })
        return res.status(204).end()
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Account API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
