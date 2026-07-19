import * as React from "react"
import type { Notification } from "./types"

interface AppState {
  currentPage: string
  setCurrentPage: (page: string) => void
  commandOpen: boolean
  setCommandOpen: (open: boolean) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  notifications: Notification[]
  setNotifications: (notifications: Notification[]) => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void
}

const AppContext = React.createContext<AppState | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = React.useState("dashboard")
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)

  const value: AppState = React.useMemo(() => ({
    currentPage,
    setCurrentPage,
    commandOpen,
    setCommandOpen,
    searchQuery,
    setSearchQuery,
    notifications,
    setNotifications,
    sidebarCollapsed,
    toggleSidebar: () => setSidebarCollapsed(prev => !prev),
  }), [currentPage, commandOpen, searchQuery, notifications, sidebarCollapsed])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = React.useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
