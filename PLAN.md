# Strucureo CRM: Prisma + MCP Server Transformation Plan

## Project Overview
- **Current State**: React 19 + TypeScript SPA with mock data in `src/lib/data.ts`
- **Target State**: Prisma-backed CRM with PostgreSQL (Prisma Data Platform) + Vercel MCP server
- **Database Project ID**: `cmrr1yv0s289f1adz94eegbqr`
- **Approach**: Start fresh (no mock data migration)

---

## Phase 1: Prisma Setup & Schema

**Goal**: Install Prisma, define schema matching existing types, generate client, push to database.

### Task 1.1: Install Dependencies & Initialize Prisma

**Files to modify**:
- `package.json` — add dependencies
- `.gitignore` — add Prisma entries

**Actions**:
```bash
# Navigate to project root
cd /Users/user/Workspace/Projects/Strucureo_Projects/Strucureo-crm

# Install Prisma dependencies
npm install prisma @prisma/client

# Install MCP dependencies
npm install @modelcontextprotocol/sdk zod

# Initialize Prisma with PostgreSQL
npx prisma init --datasource-provider postgresql
```

**Add to `.gitignore`**:
```
# Prisma
prisma/migrations/
.env
.env.local
```

**Verification**:
- `node_modules/prisma` exists
- `prisma/schema.prisma` created
- `.env` file created with `DATABASE_URL`

---

### Task 1.2: Define Prisma Schema

**File to create**: `prisma/schema.prisma`

**Schema definition** (maps to existing `src/lib/types.ts`):

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  role      String   // owner | growth | rnd | product | ai
  avatar    String?
  department String
  joinedAt  DateTime @default(now())
  lastActive DateTime @default(now())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  assignedLeads    Lead[]
  assignedDeals    Deal[]
  assignedProjects Project[]
  assignedTasks    Task[]
  activities       Activity[]
  notifications    Notification[]
}

model Lead {
  id          String   @id @default(cuid())
  name        String
  company     String
  email       String
  phone       String
  status      String   @default("new") // new | contacted | qualified | unqualified | converted
  source      String
  score       Int      @default(0)
  value       Float    @default(0)
  notes       String   @default("")
  tags        String[] // PostgreSQL array
  lastContact DateTime @default(now())
  assignedTo  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  assignedUser User? @relation(fields: [assignedTo], references: [id])
}

model Account {
  id            String   @id @default(cuid())
  name          String
  industry      String
  website       String
  mrr           Float    @default(0)
  arr           Float    @default(0)
  employees     Int      @default(0)
  country       String   @default("")
  status        String   @default("active") // active | churned | prospect
  tier          String   @default("smb")    // enterprise | mid-market | smb
  health        String   @default("healthy") // healthy | at_risk | churning
  contractValue Float    @default(0)
  margin        Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  contacts Contact[]
  deals    Deal[]
  projects Project[]
  pilots   Pilot[]
}

model Contact {
  id          String   @id @default(cuid())
  name        String
  email       String
  phone       String
  title       String
  type        String   @default("primary") // primary | billing | technical | executive
  accountId   String
  lastContact DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  account Account @relation(fields: [accountId], references: [id])
  deals   Deal[]
  pilots  Pilot[]
}

model Deal {
  id              String   @id @default(cuid())
  title           String
  value           Float
  stage           String   @default("discovery") // discovery | proposal | negotiation | closed_won | closed_lost
  probability     Int      @default(0)
  description     String   @default("")
  accountId       String
  contactId       String?
  assignedTo      String?
  expectedCloseDate DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  account  Account @relation(fields: [accountId], references: [id])
  contact  Contact? @relation(fields: [contactId], references: [id])
  assignedUser User? @relation(fields: [assignedTo], references: [id])
}

model Project {
  id          String   @id @default(cuid())
  name        String
  description String   @default("")
  status      String   @default("planning") // planning | active | on_hold | completed | cancelled
  budget      Float    @default(0)
  spent       Float    @default(0)
  margin      Int      @default(0)
  progress    Int      @default(0)
  startDate   DateTime @default(now())
  endDate     DateTime?
  accountId   String
  assignedTo  String[] // PostgreSQL array of user names
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  account Account @relation(fields: [accountId], references: [id])
}

model Task {
  id          String   @id @default(cuid())
  title       String
  description String   @default("")
  status      String   @default("todo") // todo | in_progress | done | cancelled
  priority    String   @default("medium") // low | medium | high | urgent
  assignedTo  String?
  dueDate     DateTime?
  tags        String[] // PostgreSQL array
  relatedType String?  // lead | deal | project | account
  relatedId   String?
  relatedName String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  assignedUser User? @relation(fields: [assignedTo], references: [id])
}

model Activity {
  id          String   @id @default(cuid())
  type        String   // call | email | meeting | note | deal | task
  description String
  entityType  String   // lead | deal | account | task
  entityId    String
  entityName  String   @default("")
  userId      String
  userName    String
  createdAt   DateTime @default(now())

  // Relations
  user User @relation(fields: [userId], references: [id])
}

model Notification {
  id        String   @id @default(cuid())
  title     String
  message   String
  type      String   @default("info") // info | success | warning | error
  read      Boolean  @default(false)
  link      String?
  userId    String
  entityType String?
  entityId  String?
  createdAt DateTime @default(now())

  // Relations
  user User @relation(fields: [userId], references: [id])
}

model Pilot {
  id          String   @id @default(cuid())
  name        String
  description String   @default("")
  status      String   @default("proposed") // proposed | approved | active | completed | failed
  value       Float    @default(0)
  outcomes    String   @default("")
  accountId   String
  contactId   String?
  startDate   DateTime @default(now())
  endDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  account Account @relation(fields: [accountId], references: [id])
  contact Contact? @relation(fields: [contactId], references: [id])
}
```

**Verification**:
```bash
# Validate schema
npx prisma validate

# Generate client
npx prisma generate
```

---

### Task 1.3: Configure Database & Push Schema

**File to modify**: `.env`

**Actions**:
1. Set `DATABASE_URL` to Prisma Data Platform connection string
2. Push schema to database

```bash
# Push schema to Prisma Data Platform
npx prisma db push

# Verify tables created
npx prisma db execute --stdin <<< "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
```

**Verification**:
- All 9 tables created in PostgreSQL
- `npx prisma studio` opens and shows empty tables

---

### Task 1.4: Create Prisma Client Singleton

**File to create**: `src/lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**File to create**: `api/_lib/prisma.ts` (for Vercel serverless functions)

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Verification**:
- `npm run build` passes (no import errors)

---

## Phase 2: Data Layer & API Routes

**Goal**: Remove all mock data, create Vercel serverless API functions for CRUD operations.

### Task 2.1: Remove Mock Data & Create API Helper

**File to modify**: `src/lib/data.ts` — **DELETE ALL CONTENT**, replace with:

```typescript
// This file is intentionally left empty.
// All data now comes from the API layer.
// See api/ directory for serverless functions.
```

**File to create**: `src/lib/api.ts` (client-side API helper)

```typescript
const API_BASE = import.meta.env.VITE_API_URL || '/api'

export interface ApiResponse<T> {
  data?: T
  error?: string
}

async function request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Request failed' }))
      return { error: error.error || `HTTP ${res.status}` }
    }

    return { data: await res.json() }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Network error' }
  }
}

export const api = {
  // Leads
  getLeads: () => request<any[]>('/leads'),
  getLead: (id: string) => request<any>(`/leads/${id}`),
  createLead: (data: any) => request<any>('/leads', { method: 'POST', body: JSON.stringify(data) }),
  updateLead: (id: string, data: any) => request<any>(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteLead: (id: string) => request<void>(`/leads/${id}`, { method: 'DELETE' }),

  // Accounts
  getAccounts: () => request<any[]>('/accounts'),
  getAccount: (id: string) => request<any>(`/accounts/${id}`),
  createAccount: (data: any) => request<any>('/accounts', { method: 'POST', body: JSON.stringify(data) }),
  updateAccount: (id: string, data: any) => request<any>(`/accounts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAccount: (id: string) => request<void>(`/accounts/${id}`, { method: 'DELETE' }),

  // Contacts
  getContacts: () => request<any[]>('/contacts'),
  getContact: (id: string) => request<any>(`/contacts/${id}`),
  createContact: (data: any) => request<any>('/contacts', { method: 'POST', body: JSON.stringify(data) }),
  updateContact: (id: string, data: any) => request<any>(`/contacts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteContact: (id: string) => request<void>(`/contacts/${id}`, { method: 'DELETE' }),

  // Deals
  getDeals: () => request<any[]>('/deals'),
  getDeal: (id: string) => request<any>(`/deals/${id}`),
  createDeal: (data: any) => request<any>('/deals', { method: 'POST', body: JSON.stringify(data) }),
  updateDeal: (id: string, data: any) => request<any>(`/deals/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteDeal: (id: string) => request<void>(`/deals/${id}`, { method: 'DELETE' }),

  // Projects
  getProjects: () => request<any[]>('/projects'),
  getProject: (id: string) => request<any>(`/projects/${id}`),
  createProject: (data: any) => request<any>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id: string, data: any) => request<any>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProject: (id: string) => request<void>(`/projects/${id}`, { method: 'DELETE' }),

  // Tasks
  getTasks: () => request<any[]>('/tasks'),
  getTask: (id: string) => request<any>(`/tasks/${id}`),
  createTask: (data: any) => request<any>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, data: any) => request<any>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTask: (id: string) => request<void>(`/tasks/${id}`, { method: 'DELETE' }),

  // Users
  getUsers: () => request<any[]>('/users'),

  // Activities
  getActivities: (entityType?: string, entityId?: string) => {
    const params = new URLSearchParams()
    if (entityType) params.set('entityType', entityType)
    if (entityId) params.set('entityId', entityId)
    return request<any[]>(`/activities?${params.toString()}`)
  },

  // Notifications
  getNotifications: () => request<any[]>('/notifications'),
  markNotificationRead: (id: string) => request<any>(`/notifications/${id}`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request<any>('/notifications/read-all', { method: 'PATCH' }),

  // Pilots
  getPilots: () => request<any[]>('/pilots'),
  getPilot: (id: string) => request<any>(`/pilots/${id}`),
  createPilot: (data: any) => request<any>('/pilots', { method: 'POST', body: JSON.stringify(data) }),
  updatePilot: (id: string, data: any) => request<any>(`/pilots/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePilot: (id: string) => request<void>(`/pilots/${id}`, { method: 'DELETE' }),

  // Dashboard
  getDashboard: () => request<any>('/dashboard'),
}
```

**Verification**:
- `npm run build` passes
- No imports from `@/lib/data` in any page component (will be fixed in Phase 3)

---

### Task 2.2: Create API Routes (Vercel Serverless Functions)

Create the following files in the `api/` directory (Vercel auto-detects this):

**File to create**: `api/_lib/prisma.ts` (shared Prisma client)

**File to create**: `api/_lib/cors.ts` (CORS helper)

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'

export function cors(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return true
  }
  return false
}
```

**File to create**: `api/leads.ts`

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './_lib/prisma'
import { cors } from './_lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return

  try {
    switch (req.method) {
      case 'GET':
        const leads = await prisma.lead.findMany({
          orderBy: { createdAt: 'desc' },
        })
        return res.status(200).json(leads)

      case 'POST':
        const newLead = await prisma.lead.create({
          data: req.body,
        })
        return res.status(201).json(newLead)

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Leads API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
```

**File to create**: `api/leads/[id].ts`

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../_lib/prisma'
import { cors } from '../_lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return

  const { id } = req.query

  try {
    switch (req.method) {
      case 'GET':
        const lead = await prisma.lead.findUnique({ where: { id: id as string } })
        if (!lead) return res.status(404).json({ error: 'Lead not found' })
        return res.status(200).json(lead)

      case 'PATCH':
        const updated = await prisma.lead.update({
          where: { id: id as string },
          data: req.body,
        })
        return res.status(200).json(updated)

      case 'DELETE':
        await prisma.lead.delete({ where: { id: id as string } })
        return res.status(204).end()

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Lead API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
```

**Repeat this pattern for all entities**:
- `api/accounts.ts` + `api/accounts/[id].ts`
- `api/contacts.ts` + `api/contacts/[id].ts`
- `api/deals.ts` + `api/deals/[id].ts`
- `api/projects.ts` + `api/projects/[id].ts`
- `api/tasks.ts` + `api/tasks/[id].ts`
- `api/users.ts`
- `api/activities.ts`
- `api/notifications.ts` + `api/notifications/[id].ts` + `api/notifications/read-all.ts`
- `api/pilots.ts` + `api/pilots/[id].ts`
- `api/dashboard.ts` (aggregation endpoint)

**File to create**: `api/dashboard.ts`

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './_lib/prisma'
import { cors } from './_lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const [accounts, deals, leads, tasks, activities, projects] = await Promise.all([
      prisma.account.findMany(),
      prisma.deal.findMany(),
      prisma.lead.findMany(),
      prisma.task.findMany(),
      prisma.activity.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
      prisma.project.findMany(),
    ])

    const totalMRR = accounts.reduce((s, a) => s + a.mrr, 0)
    const totalARR = accounts.reduce((s, a) => s + a.arr, 0)
    const openDeals = deals.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost')
    const pipelineValue = openDeals.reduce((s, d) => s + d.value, 0)
    const atRiskAccounts = accounts.filter(a => a.health === 'at_risk' || a.health === 'churning')
    const avgMargin = accounts.length > 0
      ? accounts.reduce((s, a) => s + a.margin, 0) / accounts.length
      : 0
    const qualifiedLeads = leads.filter(l => l.status === 'qualified').length

    return res.status(200).json({
      totalMRR,
      totalARR,
      pipelineValue,
      atRiskAccounts,
      avgMargin,
      qualifiedLeads,
      topAccounts: [...accounts].sort((a, b) => b.mrr - a.mrr).slice(0, 5),
      recentActivities: activities,
      todayTasks: tasks.filter(t => t.status !== 'done' && t.status !== 'cancelled').slice(0, 5),
      activeProjects: projects.filter(p => p.status === 'active'),
      openDeals,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
```

**Install Vercel types**:
```bash
npm install -D @vercel/node
```

**Verification**:
```bash
# Test locally with Vercel CLI
npm install -g vercel
vercel dev
# Visit http://localhost:3000/api/leads
```

---

## Phase 3: React Query Hooks & Component Updates

**Goal**: Create data-fetching hooks, update all 14 page components to use API instead of mock data.

### Task 3.1: Create React Query Hooks

**File to create**: `src/hooks/use-leads.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useLeads() {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const res = await api.getLeads()
      if (res.error) throw new Error(res.error)
      return res.data!
    },
  })
}

export function useCreateLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.createLead(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  })
}

export function useUpdateLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateLead(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  })
}

export function useDeleteLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteLead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  })
}
```

**Repeat this pattern for all entities**:
- `src/hooks/use-accounts.ts`
- `src/hooks/use-contacts.ts`
- `src/hooks/use-deals.ts`
- `src/hooks/use-projects.ts`
- `src/hooks/use-tasks.ts`
- `src/hooks/use-users.ts`
- `src/hooks/use-activities.ts`
- `src/hooks/use-notifications.ts`
- `src/hooks/use-pilots.ts`
- `src/hooks/use-dashboard.ts`

**File to create**: `src/hooks/use-dashboard.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.getDashboard()
      if (res.error) throw new Error(res.error)
      return res.data!
    },
  })
}
```

**Verification**:
- `npm run build` passes
- No TypeScript errors in hooks

---

### Task 3.2: Update Page Components (Batch 1: Dashboard + Leads + Accounts)

**File to modify**: `src/pages/dashboard.tsx`

**Changes**:
1. Remove imports from `@/lib/data`
2. Add `import { useDashboard } from '@/hooks/use-dashboard'`
3. Replace static data with hook data
4. Add loading/error states

**Before**:
```typescript
import { ACCOUNTS, DEALS, LEADS, TASKS, ACTIVITIES, PROJECTS, REVENUE_DATA, MRR_DATA, PIPELINE_DATA } from "@/lib/data"
// ... static computations
const totalMRR = ACCOUNTS.reduce((s, a) => s + a.mrr, 0)
```

**After**:
```typescript
import { useDashboard } from '@/hooks/use-dashboard'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardPage() {
  const { data: dashboard, isLoading, error } = useDashboard()

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-[1600px]">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="p-6 text-destructive">Failed to load dashboard</div>
  }

  const { totalMRR, totalARR, pipelineValue, atRiskAccounts, avgMargin, qualifiedLeads, topAccounts, recentActivities, todayTasks, activeProjects } = dashboard

  // ... rest of component uses these values
}
```

**Note**: Remove `REVENUE_DATA`, `MRR_DATA`, `PIPELINE_DATA` imports — these are static chart data. Keep them as local constants in the dashboard component or create a separate `src/lib/chart-data.ts` file for now.

**File to modify**: `src/pages/leads.tsx`

**Changes**:
1. Remove `import { LEADS } from "@/lib/data"`
2. Add `import { useLeads } from '@/hooks/use-leads'`
3. Replace `LEADS` with hook data
4. Add loading/error states

**File to modify**: `src/pages/accounts.tsx`

**Changes**:
1. Remove `import { ACCOUNTS } from "@/lib/data"`
2. Add `import { useAccounts } from '@/hooks/use-accounts'`
3. Replace `ACCOUNTS` with hook data

**Verification**:
- `npm run build` passes
- Dashboard loads (shows empty state or skeleton)
- Leads page loads (shows empty table)
- Accounts page loads (shows empty table)

---

### Task 3.3: Update Page Components (Batch 2: Contacts + Deals + Projects)

**File to modify**: `src/pages/contacts.tsx`
**File to modify**: `src/pages/deals.tsx`
**File to modify**: `src/pages/projects.tsx`

**Pattern for each**:
1. Remove `import { X } from "@/lib/data"`
2. Add `import { useX } from '@/hooks/use-x'`
3. Replace static array with hook data
4. Add loading/error states

**Verification**:
- `npm run build` passes
- All three pages load without errors

---

### Task 3.4: Update Page Components (Batch 3: Tasks + Users + R&D/Pilots)

**File to modify**: `src/pages/tasks.tsx`
**File to modify**: `src/pages/users.tsx`
**File to modify**: `src/pages/rnd-pilots.tsx`

**Special handling for `rnd-pilots.tsx`**:
- `MOCK_RND` is inline mock data (not from `data.ts`)
- Either keep it as-is for now, or create an `api/rnd.ts` endpoint
- Recommend: Keep `MOCK_RND` as local data, only convert `PILOTS` to API

**Verification**:
- `npm run build` passes
- All three pages load

---

### Task 3.5: Update Remaining Pages & Store

**File to modify**: `src/pages/analytics-reports.tsx`
- Remove `import { REVENUE_DATA, MRR_DATA } from "@/lib/data"`
- Keep chart data as local constants (they're static analytics)

**File to modify**: `src/pages/notifications.tsx`
- Already uses `useApp()` from store
- Update store to fetch notifications from API instead of static `NOTIFICATIONS`

**File to modify**: `src/lib/store.tsx`
- Remove `import { NOTIFICATIONS } from "./data"`
- Add API fetch for notifications on mount
- Or: Keep notifications in store but fetch from API

**File to modify**: `src/pages/settings.tsx`
- No data imports, no changes needed

**File to modify**: `src/components/command-palette.tsx`
- No data imports, no changes needed

**Verification**:
- `npm run build` passes
- All pages load without errors
- No remaining imports from `@/lib/data` (except chart-data.ts if created)

---

## Phase 4: MCP Server

**Goal**: Create a Vercel-deployed MCP server that exposes CRM tools for AI assistants.

### Task 4.1: Create MCP Server Endpoint

**File to create**: `api/mcp.ts`

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './_lib/prisma'
import { cors } from './_lib/cors'

// MCP Server implementation
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return

  // Verify API key
  const apiKey = req.headers['x-api-key']
  if (apiKey !== process.env.MCP_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { method, params } = req.body

  try {
    switch (method) {
      case 'tools/list':
        return res.status(200).json({
          tools: [
            {
              name: 'list_leads',
              description: 'List all leads in the CRM',
              inputSchema: {
                type: 'object',
                properties: {
                  status: { type: 'string', description: 'Filter by status' },
                },
              },
            },
            {
              name: 'get_lead',
              description: 'Get a specific lead by ID',
              inputSchema: {
                type: 'object',
                properties: {
                  id: { type: 'string', description: 'Lead ID' },
                },
                required: ['id'],
              },
            },
            {
              name: 'create_lead',
              description: 'Create a new lead',
              inputSchema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  company: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' },
                  source: { type: 'string' },
                  value: { type: 'number' },
                },
                required: ['name', 'company', 'email'],
              },
            },
            {
              name: 'update_lead',
              description: 'Update an existing lead',
              inputSchema: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  status: { type: 'string' },
                  score: { type: 'number' },
                  notes: { type: 'string' },
                },
                required: ['id'],
              },
            },
            {
              name: 'delete_lead',
              description: 'Delete a lead',
              inputSchema: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                },
                required: ['id'],
              },
            },
            {
              name: 'list_accounts',
              description: 'List all accounts',
              inputSchema: {
                type: 'object',
                properties: {
                  tier: { type: 'string', description: 'Filter by tier' },
                  health: { type: 'string', description: 'Filter by health status' },
                },
              },
            },
            {
              name: 'get_account',
              description: 'Get a specific account by ID',
              inputSchema: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                },
                required: ['id'],
              },
            },
            {
              name: 'list_deals',
              description: 'List all deals',
              inputSchema: {
                type: 'object',
                properties: {
                  stage: { type: 'string', description: 'Filter by stage' },
                },
              },
            },
            {
              name: 'get_deal',
              description: 'Get a specific deal by ID',
              inputSchema: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                },
                required: ['id'],
              },
            },
            {
              name: 'create_deal',
              description: 'Create a new deal',
              inputSchema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  value: { type: 'number' },
                  accountId: { type: 'string' },
                  stage: { type: 'string' },
                },
                required: ['title', 'value', 'accountId'],
              },
            },
            {
              name: 'list_contacts',
              description: 'List all contacts',
              inputSchema: {
                type: 'object',
                properties: {
                  accountId: { type: 'string', description: 'Filter by account' },
                },
              },
            },
            {
              name: 'list_projects',
              description: 'List all projects',
              inputSchema: {
                type: 'object',
                properties: {
                  status: { type: 'string', description: 'Filter by status' },
                },
              },
            },
            {
              name: 'list_tasks',
              description: 'List all tasks',
              inputSchema: {
                type: 'object',
                properties: {
                  status: { type: 'string', description: 'Filter by status' },
                  assignedTo: { type: 'string', description: 'Filter by assignee' },
                },
              },
            },
            {
              name: 'create_task',
              description: 'Create a new task',
              inputSchema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  priority: { type: 'string' },
                  assignedTo: { type: 'string' },
                  dueDate: { type: 'string', description: 'ISO date string' },
                },
                required: ['title'],
              },
            },
            {
              name: 'get_dashboard',
              description: 'Get dashboard summary metrics',
              inputSchema: { type: 'object', properties: {} },
            },
          ],
        })

      case 'tools/call':
        const { name, arguments: args } = params

        switch (name) {
          case 'list_leads': {
            const where = args?.status ? { status: args.status } : {}
            const leads = await prisma.lead.findMany({ where, orderBy: { createdAt: 'desc' } })
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(leads, null, 2) }] })
          }

          case 'get_lead': {
            const lead = await prisma.lead.findUnique({ where: { id: args.id } })
            if (!lead) return res.status(200).json({ content: [{ type: 'text', text: 'Lead not found' }], isError: true })
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(lead, null, 2) }] })
          }

          case 'create_lead': {
            const lead = await prisma.lead.create({ data: args })
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(lead, null, 2) }] })
          }

          case 'update_lead': {
            const { id, ...data } = args
            const lead = await prisma.lead.update({ where: { id }, data })
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(lead, null, 2) }] })
          }

          case 'delete_lead': {
            await prisma.lead.delete({ where: { id: args.id } })
            return res.status(200).json({ content: [{ type: 'text', text: 'Lead deleted' }] })
          }

          case 'list_accounts': {
            const where: any = {}
            if (args?.tier) where.tier = args.tier
            if (args?.health) where.health = args.health
            const accounts = await prisma.account.findMany({ where, orderBy: { createdAt: 'desc' } })
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(accounts, null, 2) }] })
          }

          case 'get_account': {
            const account = await prisma.account.findUnique({
              where: { id: args.id },
              include: { contacts: true, deals: true, projects: true },
            })
            if (!account) return res.status(200).json({ content: [{ type: 'text', text: 'Account not found' }], isError: true })
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(account, null, 2) }] })
          }

          case 'list_deals': {
            const where = args?.stage ? { stage: args.stage } : {}
            const deals = await prisma.deal.findMany({ where, orderBy: { createdAt: 'desc' } })
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(deals, null, 2) }] })
          }

          case 'get_deal': {
            const deal = await prisma.deal.findUnique({ where: { id: args.id } })
            if (!deal) return res.status(200).json({ content: [{ type: 'text', text: 'Deal not found' }], isError: true })
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(deal, null, 2) }] })
          }

          case 'create_deal': {
            const deal = await prisma.deal.create({ data: args })
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(deal, null, 2) }] })
          }

          case 'list_contacts': {
            const where = args?.accountId ? { accountId: args.accountId } : {}
            const contacts = await prisma.contact.findMany({ where, orderBy: { createdAt: 'desc' } })
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(contacts, null, 2) }] })
          }

          case 'list_projects': {
            const where = args?.status ? { status: args.status } : {}
            const projects = await prisma.project.findMany({ where, orderBy: { createdAt: 'desc' } })
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(projects, null, 2) }] })
          }

          case 'list_tasks': {
            const where: any = {}
            if (args?.status) where.status = args.status
            if (args?.assignedTo) where.assignedTo = args.assignedTo
            const tasks = await prisma.task.findMany({ where, orderBy: { createdAt: 'desc' } })
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(tasks, null, 2) }] })
          }

          case 'create_task': {
            const task = await prisma.task.create({ data: args })
            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(task, null, 2) }] })
          }

          case 'get_dashboard': {
            const [accounts, deals, leads, tasks] = await Promise.all([
              prisma.account.findMany(),
              prisma.deal.findMany(),
              prisma.lead.findMany(),
              prisma.task.findMany(),
            ])

            const summary = {
              totalMRR: accounts.reduce((s, a) => s + a.mrr, 0),
              totalARR: accounts.reduce((s, a) => s + a.arr, 0),
              pipelineValue: deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).reduce((s, d) => s + d.value, 0),
              totalLeads: leads.length,
              qualifiedLeads: leads.filter(l => l.status === 'qualified').length,
              openTasks: tasks.filter(t => t.status !== 'done' && t.status !== 'cancelled').length,
            }

            return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }] })
          }

          default:
            return res.status(200).json({
              content: [{ type: 'text', text: `Unknown tool: ${name}` }],
              isError: true,
            })
        }

      default:
        return res.status(200).json({
          jsonrpc: '2.0',
          error: { code: -32601, message: `Method not found: ${method}` },
          id: req.body.id,
        })
    }
  } catch (error) {
    console.error('MCP error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
```

**Verification**:
```bash
# Test MCP endpoint locally
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"method": "tools/list"}'
```

---

### Task 4.2: Add MCP Configuration

**File to create**: `.env.local` (for local development)

```
DATABASE_URL=your-prisma-data-platform-url
MCP_API_KEY=your-secret-api-key
```

**File to create**: `vercel.json` (if not exists)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.ts",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

**Verification**:
- `vercel dev` starts successfully
- MCP endpoint responds to tools/list

---

## Phase 5: Testing & Deployment

**Goal**: Verify everything works, deploy to Vercel.

### Task 5.1: Local Testing

**Commands**:
```bash
# Start local dev with Vercel
vercel dev

# In another terminal, test API endpoints
curl http://localhost:3000/api/leads
curl http://localhost:3000/api/accounts
curl http://localhost:3000/api/dashboard

# Test MCP endpoint
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_KEY" \
  -d '{"method": "tools/list"}'
```

**Verification checklist**:
- [ ] All API endpoints return 200 (or empty arrays for fresh DB)
- [ ] Dashboard endpoint returns aggregated data
- [ ] MCP endpoint lists all tools
- [ ] React app loads in browser
- [ ] All pages render without errors
- [ ] No console errors related to data fetching

---

### Task 5.2: Seed Database (Optional)

**File to create**: `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create users
  const users = await Promise.all([
    prisma.user.create({ data: { name: 'Alex Rivera', email: 'alex@strucureo.com', role: 'owner', department: 'Executive' } }),
    prisma.user.create({ data: { name: 'Jordan Kim', email: 'jordan@strucureo.com', role: 'growth', department: 'Sales' } }),
    prisma.user.create({ data: { name: 'Sam Chen', email: 'sam@strucureo.com', role: 'rnd', department: 'R&D' } }),
    prisma.user.create({ data: { name: 'Morgan Lee', email: 'morgan@strucureo.com', role: 'product', department: 'Product' } }),
    prisma.user.create({ data: { name: 'Casey Brown', email: 'casey@strucureo.com', role: 'ai', department: 'AI' } }),
  ])

  console.log('Created users:', users.length)

  // Add more seed data as needed...
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

**Add to `package.json`**:
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

**Commands**:
```bash
npx prisma db seed
```

---

### Task 5.3: Deploy to Vercel

**Commands**:
```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Set environment variables
vercel env add DATABASE_URL
vercel env add MCP_API_KEY
```

**Post-deployment verification**:
- [ ] Main app loads at `https://your-app.vercel.app`
- [ ] API endpoints respond at `https://your-app.vercel.app/api/leads`
- [ ] MCP endpoint works at `https://your-app.vercel.app/api/mcp`
- [ ] All pages function correctly

---

### Task 5.4: Final Cleanup

**Files to delete**:
- None (mock data already replaced)

**Files to verify**:
- `src/lib/data.ts` — should be empty or contain only chart data
- `src/lib/types.ts` — keep as-is (types still useful for TypeScript)
- `src/lib/store.tsx` — updated to use API for notifications
- All page components — no imports from `@/lib/data`

**Commands**:
```bash
# Verify no remaining data imports
grep -r "from.*@/lib/data" src/

# Run build
npm run build

# Run typecheck
npm run typecheck
```

---

## Summary of Files Created/Modified

### New Files
| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema |
| `src/lib/prisma.ts` | Prisma client (SPA-side, if needed) |
| `src/lib/api.ts` | Client-side API helper |
| `api/_lib/prisma.ts` | Prisma client (serverless) |
| `api/_lib/cors.ts` | CORS helper |
| `api/leads.ts` | Leads CRUD |
| `api/leads/[id].ts` | Lead by ID |
| `api/accounts.ts` | Accounts CRUD |
| `api/accounts/[id].ts` | Account by ID |
| `api/contacts.ts` | Contacts CRUD |
| `api/contacts/[id].ts` | Contact by ID |
| `api/deals.ts` | Deals CRUD |
| `api/deals/[id].ts` | Deal by ID |
| `api/projects.ts` | Projects CRUD |
| `api/projects/[id].ts` | Project by ID |
| `api/tasks.ts` | Tasks CRUD |
| `api/tasks/[id].ts` | Task by ID |
| `api/users.ts` | Users list |
| `api/activities.ts` | Activities list |
| `api/notifications.ts` | Notifications |
| `api/notifications/[id].ts` | Mark read |
| `api/notifications/read-all.ts` | Mark all read |
| `api/pilots.ts` | Pilots CRUD |
| `api/pilots/[id].ts` | Pilot by ID |
| `api/dashboard.ts` | Dashboard aggregation |
| `api/mcp.ts` | MCP server endpoint |
| `src/hooks/use-leads.ts` | React Query hooks |
| `src/hooks/use-accounts.ts` | React Query hooks |
| `src/hooks/use-contacts.ts` | React Query hooks |
| `src/hooks/use-deals.ts` | React Query hooks |
| `src/hooks/use-projects.ts` | React Query hooks |
| `src/hooks/use-tasks.ts` | React Query hooks |
| `src/hooks/use-users.ts` | React Query hooks |
| `src/hooks/use-activities.ts` | React Query hooks |
| `src/hooks/use-notifications.ts` | React Query hooks |
| `src/hooks/use-pilots.ts` | React Query hooks |
| `src/hooks/use-dashboard.ts` | React Query hooks |
| `vercel.json` | Vercel configuration |
| `.env.local` | Local environment variables |

### Modified Files
| File | Changes |
|------|---------|
| `package.json` | Add prisma, @prisma/client, @modelcontextprotocol/sdk, @vercel/node |
| `.gitignore` | Add prisma/migrations, .env, .env.local |
| `src/lib/data.ts` | Remove all mock data |
| `src/lib/store.tsx` | Fetch notifications from API |
| `src/pages/dashboard.tsx` | Use useDashboard hook |
| `src/pages/leads.tsx` | Use useLeads hook |
| `src/pages/accounts.tsx` | Use useAccounts hook |
| `src/pages/contacts.tsx` | Use useContacts hook |
| `src/pages/deals.tsx` | Use useDeals hook |
| `src/pages/projects.tsx` | Use useProjects hook |
| `src/pages/tasks.tsx` | Use useTasks hook |
| `src/pages/users.tsx` | Use useUsers hook |
| `src/pages/rnd-pilots.tsx` | Use usePilots hook |
| `src/pages/analytics-reports.tsx` | Remove data imports |
| `src/pages/notifications.tsx` | Use useNotifications hook |

---

## Execution Order

1. **Phase 1** (Prisma Setup) — 4 tasks, ~30 min
2. **Phase 2** (Data Layer) — 2 tasks, ~45 min
3. **Phase 3** (Component Updates) — 5 tasks, ~60 min
4. **Phase 4** (MCP Server) — 2 tasks, ~30 min
5. **Phase 5** (Testing & Deployment) — 4 tasks, ~30 min

**Total estimated time**: ~3 hours

---

## Critical Path

```
Phase 1.1 → 1.2 → 1.3 → 1.4
                        ↓
Phase 2.1 → 2.2 (API routes)
                        ↓
Phase 3.1 → 3.2 → 3.3 → 3.4 → 3.5
                        ↓
Phase 4.1 → 4.2
                        ↓
Phase 5.1 → 5.2 → 5.3 → 5.4
```

**Parallelization opportunities**:
- Phase 3.2, 3.3, 3.4 can be parallelized (different page components)
- Phase 4.1 can run in parallel with Phase 3 (MCP server is independent)
- Phase 5.2 (seed) can run anytime after Phase 1.3
