import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../_lib/prisma.js'
import { cors } from '../_lib/cors.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return
  const { id } = req.query

  try {
    switch (req.method) {
      case 'GET':
        const contact = await prisma.contact.findUnique({ where: { id: id as string } })
        if (!contact) return res.status(404).json({ error: 'Contact not found' })
        return res.status(200).json(contact)
      case 'PATCH':
        const updated = await prisma.contact.update({ where: { id: id as string }, data: req.body })
        return res.status(200).json(updated)
      case 'DELETE':
        await prisma.contact.delete({ where: { id: id as string } })
        return res.status(204).end()
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Contact API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
