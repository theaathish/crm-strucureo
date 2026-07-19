import { motion } from "framer-motion"
import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Plus } from "lucide-react"
import { DataTable, SelectColumn } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { MetricCard } from "@/components/ui/metric-card"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Lead } from "@/lib/types"
import { useLeads } from '@/hooks/use-leads'

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-zinc-400"}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-medium tabular-nums">{score}</span>
    </div>
  )
}

const columns: ColumnDef<Lead>[] = [
  SelectColumn<Lead>(),
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-foreground">{row.original.name}</p>
        <p className="text-[10px] text-muted-foreground">{row.original.email}</p>
      </div>
    ),
  },
  {
    accessorKey: "company",
    header: "Company",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="size-6 rounded bg-muted text-foreground text-[10px] font-semibold flex items-center justify-center shrink-0">
          {row.original.company.slice(0, 2).toUpperCase()}
        </div>
        <span>{row.original.company}</span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.source}</span>
    ),
  },
  {
    accessorKey: "score",
    header: "Score",
    cell: ({ row }) => <ScoreBar score={row.original.score} />,
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">${row.original.value.toLocaleString()}</span>
    ),
  },
  {
    accessorKey: "assignedTo",
    header: "Assigned",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <div className="size-5 rounded-full bg-foreground text-background text-[9px] font-bold flex items-center justify-center">
          {row.original.assignedTo.split(" ").map(n => n[0]).join("")}
        </div>
        <span className="text-muted-foreground text-xs">{row.original.assignedTo.split(" ")[0]}</span>
      </div>
    ),
  },
  {
    accessorKey: "lastContact",
    header: "Last Contact",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.lastContact}</span>
    ),
  },
  {
    id: "actions",
    size: 40,
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100">
            <MoreHorizontal className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View Details</DropdownMenuItem>
          <DropdownMenuItem>Edit Lead</DropdownMenuItem>
          <DropdownMenuItem>Convert to Account</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export function LeadsPage() {
  const { data: leads = [], isLoading, error } = useLeads()
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredLeads = statusFilter === "all"
    ? leads
    : leads.filter(l => l.status === statusFilter)

  const totalValue = leads.reduce((s, l) => s + l.value, 0)
  const qualifiedCount = leads.filter(l => l.status === "qualified").length
  const avgScore = leads.length > 0 ? Math.round(leads.reduce((s, l) => s + l.score, 0) / leads.length) : 0

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="p-6 space-y-6 max-w-[1600px]"
      >
        <PageHeader
          title="Leads"
          description="Track and manage your sales pipeline"
          actions={
            <Button size="sm" className="h-8 gap-1.5 text-xs">
              <Plus className="size-3.5" /> Add Lead
            </Button>
          }
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 rounded bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="p-6 space-y-6 max-w-[1600px]"
      >
        <PageHeader
          title="Leads"
          description="Track and manage your sales pipeline"
          actions={
            <Button size="sm" className="h-8 gap-1.5 text-xs">
              <Plus className="size-3.5" /> Add Lead
            </Button>
          }
        />
        <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-center gap-3">
          <p className="text-destructive text-sm font-medium">Failed to load leads</p>
          <p className="text-muted-foreground text-xs">Please try again later.</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="p-6 space-y-6 max-w-[1600px]"
    >
      <PageHeader
        title="Leads"
        description="Track and manage your sales pipeline"
        actions={
          <Button size="sm" className="h-8 gap-1.5 text-xs">
            <Plus className="size-3.5" /> Add Lead
          </Button>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard title="Total Leads" value={leads.length} change={12} trend="up" />
        <MetricCard title="Qualified" value={qualifiedCount} change={8} trend="up" />
        <MetricCard title="Pipeline Value" value={totalValue} prefix="$" change={15} trend="up" />
        <MetricCard title="Avg. Score" value={avgScore} change={3} trend="up" />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card p-5">
        <DataTable
          columns={columns}
          data={filteredLeads}
          searchKey="name"
          searchPlaceholder="Search leads..."
          toolbar={
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="unqualified">Unqualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
              </SelectContent>
            </Select>
          }
        />
      </div>
    </motion.div>
  )
}
