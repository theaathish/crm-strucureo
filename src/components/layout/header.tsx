import * as React from "react"
import { Search, Bell, Plus, Command, ChevronRight, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/store"
import { cn } from "@/lib/utils"

const PAGE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  leads: "Leads",
  accounts: "Accounts",
  contacts: "Contacts",
  deals: "Deals",
  projects: "Projects",
  rnd: "Research & Development",
  pilots: "Pilots",
  tasks: "Tasks",
  reports: "Reports",
  analytics: "Analytics",
  users: "Users",
  settings: "Settings",
  notifications: "Notifications",
}

interface HeaderProps {
  actions?: React.ReactNode
}

export function AppHeader({ actions }: HeaderProps) {
  const { currentPage, setCurrentPage, setCommandOpen, notifications, currentUser, setCurrentUser } = useApp()
  const unreadCount = notifications.filter(n => !n.read).length
  const pageLabel = PAGE_LABELS[currentPage] ?? currentPage

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center border-b border-border bg-background/95 backdrop-blur-sm px-6 gap-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm min-w-0 flex-1">
        <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors" onClick={() => setCurrentPage("dashboard")}>
          Strucureo
        </span>
        <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
        <span className="font-medium text-foreground truncate">{pageLabel}</span>
      </div>

      {/* Search trigger */}
      <button
        onClick={() => setCommandOpen(true)}
        className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-md border border-border bg-muted/50 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors min-w-[200px]"
      >
        <Search className="size-3.5" />
        <span className="flex-1 text-left">Search anything...</span>
        <div className="flex items-center gap-0.5">
          <kbd className="text-[10px] font-mono bg-background border border-border rounded px-1 py-0.5">⌘</kbd>
          <kbd className="text-[10px] font-mono bg-background border border-border rounded px-1 py-0.5">K</kbd>
        </div>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {actions}

        {/* Quick create */}
        <Button
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={() => setCommandOpen(true)}
        >
          <Plus className="size-3.5" />
          <span className="hidden sm:inline">Create</span>
        </Button>

        {/* Notifications */}
        <button
          onClick={() => setCurrentPage("notifications")}
          className={cn(
            "relative size-8 flex items-center justify-center rounded-md border border-border hover:bg-accent transition-colors",
            unreadCount > 0 && "text-foreground"
          )}
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 size-2 rounded-full bg-destructive" />
          )}
        </button>

        {/* User + Logout */}
        {currentUser && (
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground shrink-0">
              {currentUser.name.split(" ").map(n => n[0]).join("")}
            </div>
            <button
              onClick={() => setCurrentUser(null)}
              className="size-8 flex items-center justify-center rounded-md border border-border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        )}

        {/* Command palette */}
        <button
          onClick={() => setCommandOpen(true)}
          className="size-8 flex items-center justify-center rounded-md border border-border hover:bg-accent transition-colors sm:hidden"
        >
          <Command className="size-4" />
        </button>
      </div>
    </header>
  )
}
