import { motion } from "framer-motion"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Plus } from "lucide-react"
import { DataTable, SelectColumn } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { MetricCard } from "@/components/ui/metric-card"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Project } from "@/lib/types"
import { useProjects } from "@/hooks/use-projects"

function ProgressCell({ value }: { value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-foreground rounded-full" style={{ width: `${value}%` }} />
        </div>
        <span className="text-xs font-medium ml-2 tabular-nums">{value}%</span>
      </div>
    </div>
  )
}

const columns: ColumnDef<Project>[] = [
  SelectColumn<Project>(),
  {
    accessorKey: "name",
    header: "Project",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-foreground">{row.original.name}</p>
        <p className="text-[10px] text-muted-foreground">{row.original.accountName}</p>
      </div>
    ),
  },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  { accessorKey: "progress", header: "Progress", cell: ({ row }) => <ProgressCell value={row.original.progress} /> },
  { accessorKey: "budget", header: "Budget", cell: ({ row }) => <span className="tabular-nums">${row.original.budget.toLocaleString()}</span> },
  { accessorKey: "spent", header: "Spent", cell: ({ row }) => <span className="tabular-nums">${row.original.spent.toLocaleString()}</span> },
  {
    accessorKey: "margin",
    header: "Margin",
    cell: ({ row }) => (
      <span className={`font-medium tabular-nums ${row.original.margin < 60 ? "text-destructive" : "text-emerald-600"}`}>
        {row.original.margin}%
      </span>
    ),
  },
  { accessorKey: "endDate", header: "Deadline", cell: ({ row }) => <span className="text-muted-foreground">{row.original.endDate}</span> },
  {
    accessorKey: "assignedTo",
    header: "Team",
    cell: ({ row }) => (
      <div className="flex -space-x-1">
        {row.original.assignedTo.map((name, i) => (
          <div key={i} className="size-5 rounded-full bg-foreground text-background text-[9px] font-bold flex items-center justify-center ring-1 ring-background">
            {name.split(" ").map(n => n[0]).join("")}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "actions", size: 40,
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-7"><MoreHorizontal className="size-3.5" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View Project</DropdownMenuItem>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem variant="destructive">Archive</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export function ProjectsPage() {
  const { data: projects = [], isLoading, error } = useProjects()

  const totalBudget = projects.reduce((s, p) => s + p.budget, 0)
  const totalSpent = projects.reduce((s, p) => s + p.spent, 0)
  const avgMargin = projects.length ? Math.round(projects.reduce((s, p) => s + p.margin, 0) / projects.length) : 0
  const activeCount = projects.filter(p => p.status === "active").length

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]">
        <PageHeader
          title="Projects"
          description="Track active projects and deliverables"
          actions={<Button size="sm" className="h-8 gap-1.5 text-xs"><Plus className="size-3.5" /> New Project</Button>}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 animate-pulse">
              <div className="h-4 bg-muted rounded w-24 mb-2" />
              <div className="h-8 bg-muted rounded w-16" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]">
        <PageHeader
          title="Projects"
          description="Track active projects and deliverables"
          actions={<Button size="sm" className="h-8 gap-1.5 text-xs"><Plus className="size-3.5" /> New Project</Button>}
        />
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-sm text-destructive font-medium">Failed to load projects</p>
          <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]">
      <PageHeader
        title="Projects"
        description="Track active projects and deliverables"
        actions={<Button size="sm" className="h-8 gap-1.5 text-xs"><Plus className="size-3.5" /> New Project</Button>}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard title="Active Projects" value={activeCount} change={0} trend="neutral" />
        <MetricCard title="Total Budget" value={totalBudget} prefix="$" change={8} trend="up" />
        <MetricCard title="Total Spent" value={totalSpent} prefix="$" change={15} trend="up" />
        <MetricCard title="Avg. Margin" value={`${avgMargin}%`} change={2} trend="up" />
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <DataTable columns={columns} data={projects} searchKey="name" searchPlaceholder="Search projects..." />
      </div>
    </motion.div>
  )
}
