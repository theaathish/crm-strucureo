import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCircle,
  TrendingUp,
  FolderKanban,
  FlaskConical,
  TestTube2,
  CheckSquare,
  BarChart3,
  PieChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut,
  Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useApp } from "@/lib/store"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number | string
  danger?: boolean
}

const navSections: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "analytics", label: "Analytics", icon: PieChart },
      { id: "reports", label: "Reports", icon: BarChart3 },
    ],
  },
  {
    label: "Revenue",
    items: [
      { id: "leads", label: "Leads", icon: TrendingUp, badge: 8 },
      { id: "accounts", label: "Accounts", icon: Building2 },
      { id: "contacts", label: "Contacts", icon: UserCircle },
      { id: "deals", label: "Deals", icon: Zap, badge: 7 },
    ],
  },
  {
    label: "Delivery",
    items: [
      { id: "projects", label: "Projects", icon: FolderKanban, badge: 5 },
      { id: "rnd", label: "Research & Dev", icon: FlaskConical },
      { id: "pilots", label: "Pilots", icon: TestTube2, badge: 3 },
      { id: "tasks", label: "Tasks", icon: CheckSquare, badge: 4 },
    ],
  },
  {
    label: "Team",
    items: [
      { id: "users", label: "Users", icon: Users },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
]

export function AppSidebar() {
  const { currentPage, setCurrentPage, sidebarCollapsed, toggleSidebar, notifications } = useApp()
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        animate={{ width: sidebarCollapsed ? 60 : 240 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="relative flex flex-col border-r border-border bg-sidebar h-screen sticky top-0 overflow-hidden shrink-0"
      >
        {/* Logo */}
        <div className="flex items-center h-14 px-4 border-b border-sidebar-border shrink-0">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2.5"
              >
                <div className="size-7 rounded-lg bg-foreground flex items-center justify-center shrink-0">
                  <span className="text-background text-xs font-bold tracking-tighter">S</span>
                </div>
                <span className="font-semibold text-sm tracking-tight text-foreground">Strucureo</span>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="size-7 rounded-lg bg-foreground flex items-center justify-center"
              >
                <span className="text-background text-xs font-bold tracking-tighter">S</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
          {navSections.map((section) => (
            <div key={section.label}>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60"
                  >
                    {section.label}
                  </motion.p>
                )}
              </AnimatePresence>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = currentPage === item.id
                  const Icon = item.icon
                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setCurrentPage(item.id)}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-all duration-100 group",
                            isActive
                              ? "bg-foreground text-background font-medium"
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                          )}
                        >
                          <Icon className={cn("size-4 shrink-0", isActive ? "text-background" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground")} />
                          <AnimatePresence>
                            {!sidebarCollapsed && (
                              <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.15 }}
                                className="flex-1 text-left whitespace-nowrap overflow-hidden"
                              >
                                {item.label}
                              </motion.span>
                            )}
                          </AnimatePresence>
                          {!sidebarCollapsed && item.badge !== undefined && (
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-[10px] h-4 min-w-4 px-1 ml-auto font-medium",
                                isActive ? "bg-background/20 text-background border-0" : "bg-border text-foreground/60"
                              )}
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </button>
                      </TooltipTrigger>
                      {sidebarCollapsed && (
                        <TooltipContent side="right" className="font-medium">
                          {item.label}
                          {item.badge !== undefined && (
                            <span className="ml-1.5 text-muted-foreground">({item.badge})</span>
                          )}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  )
                })}
              </div>
              {section.label !== "Team" && <Separator className="mt-4 bg-sidebar-border" />}
            </div>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-2 pb-4 pt-2 border-t border-sidebar-border space-y-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setCurrentPage("notifications")}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-all duration-100",
                  currentPage === "notifications"
                    ? "bg-foreground text-background"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <div className="relative shrink-0">
                  <Bell className="size-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-destructive" />
                  )}
                </div>
                {!sidebarCollapsed && (
                  <span className="flex-1 text-left">Notifications</span>
                )}
                {!sidebarCollapsed && unreadCount > 0 && (
                  <Badge variant="destructive" className="text-[10px] h-4 min-w-4 px-1">
                    {unreadCount}
                  </Badge>
                )}
              </button>
            </TooltipTrigger>
            {sidebarCollapsed && (
              <TooltipContent side="right">Notifications {unreadCount > 0 && `(${unreadCount})`}</TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* User section */}
        <div className="px-2 pb-3 border-t border-sidebar-border pt-3">
          <div className={cn("flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-sidebar-accent transition-colors cursor-pointer", sidebarCollapsed && "justify-center")}>
            <div className="size-6 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-semibold shrink-0">
              AR
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">Alex Rivera</p>
                <p className="text-[10px] text-muted-foreground truncate">Owner</p>
              </div>
            )}
            {!sidebarCollapsed && (
              <LogOut className="size-3.5 text-muted-foreground shrink-0" />
            )}
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 size-6 rounded-full border border-border bg-background shadow-sm flex items-center justify-center hover:bg-accent transition-colors z-10"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="size-3 text-muted-foreground" />
          ) : (
            <ChevronLeft className="size-3 text-muted-foreground" />
          )}
        </button>
      </motion.aside>
    </TooltipProvider>
  )
}
