import * as React from "react"
import { motion } from "framer-motion"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Plus, CheckCircle2, Circle } from "lucide-react"
import { DataTable, SelectColumn } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { MetricCard } from "@/components/ui/metric-card"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Task } from "@/lib/types"
import { useTasks } from "@/hooks/use-tasks"

const columns: ColumnDef<Task>[] = [
  SelectColumn<Task>(),
  {
    accessorKey: "title",
    header: "Task",
    cell: ({ row }) => (
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 shrink-0">
          {row.original.status === "done" ? (
            <CheckCircle2 className="size-4 text-emerald-500" />
          ) : (
            <Circle className="size-4 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0">
          <p className={`font-medium text-foreground ${row.original.status === "done" ? "line-through text-muted-foreground" : ""}`}>
            {row.original.title}
          </p>
          {row.original.relatedTo && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {row.original.relatedTo.type}: {row.original.relatedTo.name}
            </p>
          )}
        </div>
      </div>
    ),
  },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  { accessorKey: "priority", header: "Priority", cell: ({ row }) => <StatusBadge status={row.original.priority} /> },
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
  { accessorKey: "dueDate", header: "Due Date", cell: ({ row }) => <span className="text-muted-foreground">{row.original.dueDate}</span> },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.tags.slice(0, 2).map(tag => (
          <span key={tag} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md">{tag}</span>
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
          <DropdownMenuItem>Mark Done</DropdownMenuItem>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export function TasksPage() {
  const { data: tasks = [], isLoading, error } = useTasks()
  const [statusFilter, setStatusFilter] = React.useState("all")
  const filtered = statusFilter === "all" ? tasks : tasks.filter(t => t.status === statusFilter)
  const todo = tasks.filter(t => t.status === "todo").length
  const inProgress = tasks.filter(t => t.status === "in_progress").length
  const done = tasks.filter(t => t.status === "done").length
  const urgent = tasks.filter(t => t.priority === "urgent").length

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]">
        <PageHeader
          title="Tasks"
          description="Track and manage team tasks"
          actions={<Button size="sm" className="h-8 gap-1.5 text-xs"><Plus className="size-3.5" /> Add Task</Button>}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-[100px] rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 rounded-md bg-muted animate-pulse" />
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
          title="Tasks"
          description="Track and manage team tasks"
          actions={<Button size="sm" className="h-8 gap-1.5 text-xs"><Plus className="size-3.5" /> Add Task</Button>}
        />
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">Failed to load tasks. Please try again later.</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]">
      <PageHeader
        title="Tasks"
        description="Track and manage team tasks"
        actions={<Button size="sm" className="h-8 gap-1.5 text-xs"><Plus className="size-3.5" /> Add Task</Button>}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard title="To Do" value={todo} change={0} trend="neutral" />
        <MetricCard title="In Progress" value={inProgress} change={0} trend="neutral" />
        <MetricCard title="Completed" value={done} change={8} trend="up" />
        <MetricCard title="Urgent" value={urgent} danger={urgent > 0} change={0} trend="neutral" />
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <DataTable
          columns={columns}
          data={filtered}
          searchKey="title"
          searchPlaceholder="Search tasks..."
          toolbar={
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          }
        />
      </div>
    </motion.div>
  )
}
