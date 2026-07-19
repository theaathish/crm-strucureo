import * as React from "react"
import type { Notification, User } from "./types"

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
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
}

const AppContext = React.createContext<AppState | null>(null)

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem("crm_user")
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = React.useState("dashboard")
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [currentUser, setCurrentUser] = React.useState<User | null>(getStoredUser)

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
    currentUser,
    setCurrentUser: (user: User | null) => {
      setCurrentUser(user)
      if (user) {
        localStorage.setItem("crm_user", JSON.stringify(user))
      } else {
        localStorage.removeItem("crm_user")
      }
    },
  }), [currentPage, commandOpen, searchQuery, notifications, sidebarCollapsed, currentUser])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = React.useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
