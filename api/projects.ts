import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './_lib/prisma'
import { cors } from './_lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return

  try {
    switch (req.method) {
      case 'GET':
        const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } })
        return res.status(200).json(projects)
      case 'POST':
        const newProject = await prisma.project.create({ data: req.body })
        return res.status(201).json(newProject)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Projects API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
