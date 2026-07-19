import { createHash } from 'crypto'
import type { VercelRequest } from '@vercel/node'

export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

export function getApiKey(req: VercelRequest): string | null {
  const header = req.headers['x-api-key']
  if (header) return Array.isArray(header) ? header[0] : header
  const auth = req.headers['authorization']
  if (auth?.startsWith('Bearer ')) return auth.slice(7)
  return null
}

export function verifyApiKey(req: VercelRequest): boolean {
  const expected = process.env['MCP_API_KEY']
  if (!expected) return true // allow if not configured
  return getApiKey(req) === expected
}
