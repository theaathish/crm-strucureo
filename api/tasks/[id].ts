import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../_lib/prisma'
import { cors } from '../_lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return
  const { id } = req.query

  try {
    switch (req.method) {
      case 'GET':
        const task = await prisma.task.findUnique({ where: { id: id as string } })
        if (!task) return res.status(404).json({ error: 'Task not found' })
        return res.status(200).json(task)
      case 'PATCH':
        const updated = await prisma.task.update({ where: { id: id as string }, data: req.body })
        return res.status(200).json(updated)
      case 'DELETE':
        await prisma.task.delete({ where: { id: id as string } })
        return res.status(204).end()
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Task API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
