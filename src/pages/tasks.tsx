import * as React from "react"
import { motion } from "framer-motion"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Plus, CheckCircle2, Circle, Eye, Pencil, Trash2 } from "lucide-react"
import { DataTable, SelectColumn } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { MetricCard } from "@/components/ui/metric-card"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import type { Task } from "@/lib/types"
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks"

const statuses: Task["status"][] = ["todo", "in_progress", "done", "cancelled"]
const priorities: Task["priority"][] = ["low", "medium", "high", "urgent"]

export function TasksPage() {
  const { data: tasks = [], isLoading } = useTasks()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [dialog, setDialog] = React.useState<{ open: boolean; mode?: "create" | "edit"; task?: Task }>({ open: false })
  const [detail, setDetail] = React.useState<Task | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<Task | null>(null)
  const [form, setForm] = React.useState({ title: "", description: "", status: "todo" as Task["status"], priority: "medium" as Task["priority"], dueDate: "", tags: "" })

  const filtered = statusFilter === "all" ? tasks : tasks.filter(t => t.status === statusFilter)
  const todo = tasks.filter(t => t.status === "todo").length
  const inProgress = tasks.filter(t => t.status === "in_progress").length
  const done = tasks.filter(t => t.status === "done").length
  const urgent = tasks.filter(t => t.priority === "urgent").length

  function resetForm() {
    setForm({ title: "", description: "", status: "todo", priority: "medium", dueDate: "", tags: "" })
  }

  function openCreate() {
    resetForm()
    setDialog({ open: true, mode: "create" })
  }

  function openEdit(task: Task) {
    setForm({ title: task.title, description: task.description, status: task.status, priority: task.priority, dueDate: task.dueDate?.split("T")[0] || "", tags: task.tags?.join(", ") || "" })
    setDialog({ open: true, mode: "edit", task })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!dialog.open) return
    const data = { ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean), assignedTo: tasks[0]?.assignedTo || "" }
    if (dialog.mode === "create") {
      createTask.mutate(data, { onSuccess: () => setDialog({ open: false }) })
    } else {
      updateTask.mutate({ id: dialog.task!.id, data }, { onSuccess: () => setDialog({ open: false }) })
    }
  }

  function handleDelete() {
    if (!deleteTarget) return
    deleteTask.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
  }

  function handleMarkDone(task: Task) {
    updateTask.mutate({ id: task.id, data: { status: task.status === "done" ? "todo" : "done" } })
  }

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
            {(row.original.assignedTo || "??").split(" ").map(n => n[0]).join("")}
          </div>
          <span className="text-muted-foreground text-xs">{(row.original.assignedTo || "").split(" ")[0]}</span>
        </div>
      ),
    },
    { accessorKey: "dueDate", header: "Due Date", cell: ({ row }) => <span className="text-muted-foreground">{row.original.dueDate?.split("T")[0] || ""}</span> },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {(row.original.tags || []).slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md">{tag}</span>
          ))}
        </div>
      ),
    },
    {
      id: "actions", size: 40,
      cell: ({ row }) => (
        <div onClick={e => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-7"><MoreHorizontal className="size-3.5" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDetail(row.original)}><Eye className="size-3.5 mr-2" />View Details</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleMarkDone(row.original)}><CheckCircle2 className="size-3.5 mr-2" />{row.original.status === "done" ? "Reopen" : "Mark Done"}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEdit(row.original)}><Pencil className="size-3.5 mr-2" />Edit</DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(row.original)}><Trash2 className="size-3.5 mr-2" />Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      ),
    },
  ]

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]">
        <PageHeader title="Tasks" description="Track and manage team tasks" actions={<Button size="sm" className="h-8 gap-1.5 text-xs" onClick={openCreate}><Plus className="size-3.5" /> Add Task</Button>} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-[100px] rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
        <div className="rounded-xl border border-border bg-card p-5"><div className="space-y-3">{[1, 2, 3, 4, 5].map(i => (<div key={i} className="h-12 rounded-md bg-muted animate-pulse" />))}</div></div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]">
      <PageHeader title="Tasks" description="Track and manage team tasks" actions={<Button size="sm" className="h-8 gap-1.5 text-xs" onClick={openCreate}><Plus className="size-3.5" /> Add Task</Button>} />

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
          onRowClick={row => setDetail(row)}
          toolbar={
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="All Status" /></SelectTrigger>
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

      <Dialog open={dialog.open} onOpenChange={o => { if (!o) setDialog({ open: false }) }}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{dialog.mode === "create" ? "Add Task" : "Edit Task"}</DialogTitle>
              <DialogDescription>{dialog.mode === "create" ? "Create a new task" : "Update the task details"}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="Task title" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional description" rows={3} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as Task["status"] }))}>
                    <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                    <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v as Task["priority"] }))}>
                    <SelectTrigger id="priority"><SelectValue /></SelectTrigger>
                    <SelectContent>{priorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags</Label>
                <Input id="tags" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="Comma-separated (e.g. design, frontend)" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createTask.isPending || updateTask.isPending}>
                {dialog.mode === "create" ? "Create" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={o => { if (!o) setDeleteTarget(null) }}
        title="Delete Task"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleteTask.isPending}
      />

      <Dialog open={!!detail} onOpenChange={o => { if (!o) setDetail(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{detail?.title}</DialogTitle>
            <DialogDescription>Task details</DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Status</span><p className="font-medium"><StatusBadge status={detail.status} /></p></div>
                <div><span className="text-muted-foreground">Priority</span><p className="font-medium"><StatusBadge status={detail.priority} /></p></div>
                <div><span className="text-muted-foreground">Due Date</span><p className="font-medium">{detail.dueDate?.split("T")[0] || "—"}</p></div>
                <div><span className="text-muted-foreground">Assigned To</span><p className="font-medium">{detail.assignedTo || "—"}</p></div>
              </div>
              {detail.description && (
                <div><span className="text-muted-foreground">Description</span><p className="mt-1">{detail.description}</p></div>
              )}
              {detail.tags && detail.tags.length > 0 && (
                <div><span className="text-muted-foreground">Tags</span><div className="flex flex-wrap gap-1 mt-1">{detail.tags.map(t => <span key={t} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md">{t}</span>)}</div></div>
              )}
              {detail.relatedTo && (
                <div><span className="text-muted-foreground">Related {detail.relatedTo.type}</span><p className="font-medium">{detail.relatedTo.name}</p></div>
              )}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <div><span className="text-muted-foreground">Created</span><p className="font-medium">{new Date(detail.createdAt).toLocaleDateString()}</p></div>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setDetail(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
