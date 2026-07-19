import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AppSidebar } from "@/components/layout/sidebar"
import { AppHeader } from "@/components/layout/header"
import { CommandPalette } from "@/components/command-palette"
import { AppProvider, useApp } from "@/lib/store"

import { DashboardPage } from "@/pages/dashboard"
import { LeadsPage } from "@/pages/leads"
import { AccountsPage } from "@/pages/accounts"
import { ContactsPage } from "@/pages/contacts"
import { DealsPage } from "@/pages/deals"
import { ProjectsPage } from "@/pages/projects"
import { TasksPage } from "@/pages/tasks"
import { RndPage, PilotsPage } from "@/pages/rnd-pilots"
import { AnalyticsPage, ReportsPage } from "@/pages/analytics-reports"
import { UsersPage } from "@/pages/users"
import { NotificationsPage } from "@/pages/notifications"
import { SettingsPage } from "@/pages/settings"
import { LoginPage } from "@/pages/login"

function PageRenderer() {
  const { currentPage } = useApp()

  const pages: Record<string, React.ReactNode> = {
    dashboard: <DashboardPage />,
    leads: <LeadsPage />,
    accounts: <AccountsPage />,
    contacts: <ContactsPage />,
    deals: <DealsPage />,
    projects: <ProjectsPage />,
    rnd: <RndPage />,
    pilots: <PilotsPage />,
    tasks: <TasksPage />,
    analytics: <AnalyticsPage />,
    reports: <ReportsPage />,
    users: <UsersPage />,
    notifications: <NotificationsPage />,
    settings: <SettingsPage />,
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPage}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.15 }}
        className="min-h-full"
      >
        {pages[currentPage] ?? <DashboardPage />}
      </motion.div>
    </AnimatePresence>
  )
}

function AppLayout() {
  const { currentUser } = useApp()
  if (!currentUser) return <LoginPage />

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto">
          <PageRenderer />
        </main>
      </div>
      <CommandPalette />
    </div>
  )
}

export function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  )
}

export default App
