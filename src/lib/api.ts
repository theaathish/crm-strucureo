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

    if (res.status === 204) return { data: undefined as T }
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
