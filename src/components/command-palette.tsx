import * as React from "react"
import { useApp } from "@/lib/store"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  LayoutDashboard, TrendingUp, Building2, UserCircle, Zap,
  FolderKanban, FlaskConical, TestTube2, CheckSquare,
  BarChart3, PieChart, Users, Settings, Bell, Plus,
} from "lucide-react"

const PAGES = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "leads", label: "Leads", icon: TrendingUp },
  { id: "accounts", label: "Accounts", icon: Building2 },
  { id: "contacts", label: "Contacts", icon: UserCircle },
  { id: "deals", label: "Deals", icon: Zap },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "rnd", label: "Research & Development", icon: FlaskConical },
  { id: "pilots", label: "Pilots", icon: TestTube2 },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "analytics", label: "Analytics", icon: PieChart },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "users", label: "Users", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "notifications", label: "Notifications", icon: Bell },
]

const ACTIONS = [
  { id: "new-lead", label: "Create New Lead", icon: Plus, description: "Add a new lead to pipeline" },
  { id: "new-deal", label: "Create New Deal", icon: Plus, description: "Start a new deal" },
  { id: "new-task", label: "Create New Task", icon: Plus, description: "Add a task" },
  { id: "new-contact", label: "Create New Contact", icon: Plus, description: "Add a contact" },
]

export function CommandPalette() {
  const { commandOpen, setCommandOpen, setCurrentPage } = useApp()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault()
        setCommandOpen(true)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [setCommandOpen])

  const navigate = (page: string) => {
    setCurrentPage(page)
    setCommandOpen(false)
  }

  return (
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen} title="Command Palette" description="Search pages and actions">
      <CommandInput placeholder="Search pages, actions, or records..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {PAGES.map((page) => {
            const Icon = page.icon
            return (
              <CommandItem
                key={page.id}
                value={page.label}
                onSelect={() => navigate(page.id)}
                className="gap-2.5"
              >
                <Icon className="size-4 text-muted-foreground" />
                <span>{page.label}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          {ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <CommandItem
                key={action.id}
                value={action.label}
                onSelect={() => setCommandOpen(false)}
                className="gap-2.5"
              >
                <Icon className="size-4 text-muted-foreground" />
                <div>
                  <span>{action.label}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{action.description}</span>
                </div>
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
