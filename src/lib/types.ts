export type LeadStatus = "new" | "contacted" | "qualified" | "unqualified" | "converted"
export type DealStage = "discovery" | "proposal" | "negotiation" | "closed_won" | "closed_lost"
export type ProjectStatus = "planning" | "active" | "on_hold" | "completed" | "cancelled"
export type TaskPriority = "low" | "medium" | "high" | "urgent"
export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled"
export type ContactType = "primary" | "billing" | "technical" | "executive"
export type PilotStatus = "proposed" | "approved" | "active" | "completed" | "failed"
export type UserRole = "owner" | "growth" | "rnd" | "product" | "ai"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  department: string
  joinedAt: string
  lastActive: string
}

export interface Lead {
  id: string
  name: string
  company: string
  email: string
  phone: string
  status: LeadStatus
  source: string
  score: number
  value: number
  assignedTo: string
  createdAt: string
  lastContact: string
  notes: string
  tags: string[]
}

export interface Account {
  id: string
  name: string
  industry: string
  website: string
  mrr: number
  arr: number
  employees: number
  country: string
  status: "active" | "churned" | "prospect"
  tier: "enterprise" | "mid-market" | "smb"
  health: "healthy" | "at_risk" | "churning"
  createdAt: string
  contractValue: number
  margin: number
}

export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  title: string
  accountId: string
  accountName: string
  type: ContactType
  avatar?: string
  lastContact: string
  createdAt: string
}

export interface Deal {
  id: string
  title: string
  accountId: string
  accountName: string
  stage: DealStage
  value: number
  probability: number
  closeDate: string
  assignedTo: string
  createdAt: string
  description: string
}

export interface Project {
  id: string
  name: string
  accountId: string
  accountName: string
  status: ProjectStatus
  budget: number
  spent: number
  margin: number
  startDate: string
  endDate: string
  assignedTo: string[]
  progress: number
  description: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignedTo: string
  dueDate: string
  createdAt: string
  relatedTo?: { type: string; id: string; name: string }
  tags: string[]
}

export interface Activity {
  id: string
  type: "call" | "email" | "meeting" | "note" | "deal" | "task"
  description: string
  userId: string
  userName: string
  relatedTo: { type: string; id: string; name: string }
  createdAt: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  createdAt: string
  link?: string
}

export interface Pilot {
  id: string
  name: string
  accountId: string
  accountName: string
  status: PilotStatus
  startDate: string
  endDate: string
  value: number
  description: string
  outcomes: string
}

export interface MetricCard {
  title: string
  value: string | number
  change: number
  changeLabel: string
  trend: "up" | "down" | "neutral"
  prefix?: string
  suffix?: string
  danger?: boolean
}
