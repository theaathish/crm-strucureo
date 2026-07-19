import { motion } from "framer-motion"
import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Plus, Eye, Pencil, Trash2 } from "lucide-react"
import { DataTable, SelectColumn } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { MetricCard } from "@/components/ui/metric-card"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import type { Project } from "@/lib/types"
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from "@/hooks/use-projects"

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

export function ProjectsPage() {
  const { data: projects = [], isLoading, error } = useProjects()
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()
  const [detail, setDetail] = React.useState<Project | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<Project | null>(null)
  const [dialog, setDialog] = React.useState<{ open: boolean; mode?: "create" | "edit"; project?: Project }>({ open: false })
  const [form, setForm] = React.useState({ name: "", accountId: "", accountName: "", status: "active" as Project["status"], progress: 0, budget: "0", spent: "0", endDate: "", assignedTo: [] as string[], description: "" })

  function resetForm() { setForm({ name: "", accountId: "", accountName: "", status: "active", progress: 0, budget: "0", spent: "0", endDate: "", assignedTo: [], description: "" }) }
  function openEdit(project: Project) {
    setForm({ name: project.name, accountId: project.accountId, accountName: project.accountName, status: project.status, progress: project.progress, budget: String(project.budget), spent: String(project.spent), endDate: project.endDate, assignedTo: project.assignedTo, description: project.description })
    setDialog({ open: true, mode: "edit", project })
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!dialog.open) return
    const data = { ...form, budget: Number(form.budget), spent: Number(form.spent), progress: Number(form.progress) }
    if (dialog.mode === "create") {
      createProject.mutate(data, { onSuccess: () => setDialog({ open: false }) })
    } else {
      updateProject.mutate({ id: dialog.project!.id, data }, { onSuccess: () => setDialog({ open: false }) })
    }
  }

  const totalBudget = projects.reduce((s, p) => s + p.budget, 0)
  const totalSpent = projects.reduce((s, p) => s + p.spent, 0)
  const avgMargin = projects.length ? Math.round(projects.reduce((s, p) => s + p.margin, 0) / projects.length) : 0
  const activeCount = projects.filter(p => p.status === "active").length

  const columns: ColumnDef<Project>[] = [
    SelectColumn<Project>(),
    { accessorKey: "name", header: "Project", cell: ({ row }) => (<div><p className="font-medium text-foreground">{row.original.name}</p><p className="text-[10px] text-muted-foreground">{row.original.accountName}</p></div>) },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "progress", header: "Progress", cell: ({ row }) => <ProgressCell value={row.original.progress} /> },
    { accessorKey: "budget", header: "Budget", cell: ({ row }) => <span className="tabular-nums">${row.original.budget.toLocaleString()}</span> },
    { accessorKey: "spent", header: "Spent", cell: ({ row }) => <span className="tabular-nums">${row.original.spent.toLocaleString()}</span> },
    { accessorKey: "margin", header: "Margin", cell: ({ row }) => (<span className={`font-medium tabular-nums ${row.original.margin < 60 ? "text-destructive" : "text-emerald-600"}`}>{row.original.margin}%</span>) },
    { accessorKey: "endDate", header: "Deadline", cell: ({ row }) => <span className="text-muted-foreground">{row.original.endDate}</span> },
    { accessorKey: "assignedTo", header: "Team", cell: ({ row }) => (<div className="flex -space-x-1">{row.original.assignedTo.map((name, i) => (<div key={i} className="size-5 rounded-full bg-foreground text-background text-[9px] font-bold flex items-center justify-center ring-1 ring-background">{name.split(" ").map(n => n[0]).join("")}</div>))}</div>) },
    { id: "actions", size: 40, cell: ({ row }) => (<div onClick={e => e.stopPropagation()}><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-7"><MoreHorizontal className="size-3.5" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => setDetail(row.original)}><Eye className="size-3.5 mr-2" />View Project</DropdownMenuItem><DropdownMenuItem onClick={() => openEdit(row.original)}><Pencil className="size-3.5 mr-2" />Edit</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(row.original)}><Trash2 className="size-3.5 mr-2" />Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>) },
  ]

  if (isLoading) {
    return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]"><PageHeader title="Projects" description="Track active projects and deliverables" actions={<Button size="sm" className="h-8 gap-1.5 text-xs" disabled><Plus className="size-3.5" /> New Project</Button>} /><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[1, 2, 3, 4].map((i) => (<div key={i} className="rounded-xl border border-border bg-card p-5 animate-pulse"><div className="h-4 bg-muted rounded w-24 mb-2" /><div className="h-8 bg-muted rounded w-16" /></div>))}</div><div className="rounded-xl border border-border bg-card p-5"><div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => (<div key={i} className="h-12 bg-muted rounded animate-pulse" />))}</div></div></motion.div>)
  }
  if (error) {
    return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]"><PageHeader title="Projects" description="Track active projects and deliverables" /><div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center"><p className="text-sm text-destructive font-medium">Failed to load projects</p><p className="text-xs text-muted-foreground mt-1">{error.message}</p></div></motion.div>)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]">
      <PageHeader title="Projects" description="Track active projects and deliverables" actions={<Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => { resetForm(); setDialog({ open: true, mode: "create" }) }}><Plus className="size-3.5" /> New Project</Button>} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard title="Active Projects" value={activeCount} change={0} trend="neutral" />
        <MetricCard title="Total Budget" value={totalBudget} prefix="$" change={8} trend="up" />
        <MetricCard title="Total Spent" value={totalSpent} prefix="$" change={15} trend="up" />
        <MetricCard title="Avg. Margin" value={`${avgMargin}%`} change={2} trend="up" />
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <DataTable columns={columns} data={projects} searchKey="name" searchPlaceholder="Search projects..." onRowClick={row => setDetail(row)} />
      </div>

      <Dialog open={dialog.open} onOpenChange={o => { if (!o) { resetForm(); setDialog({ open: false }) }}}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmit}>
            <DialogHeader><DialogTitle>{dialog.mode === "create" ? "New Project" : "Edit Project"}</DialogTitle><DialogDescription>{dialog.mode === "create" ? "Create a new project" : "Update project details"}</DialogDescription></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label>Project Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Account Name</Label><Input value={form.accountName} onChange={e => setForm(p => ({ ...p, accountName: e.target.value }))} /></div>
                <div className="grid gap-2"><Label>Status</Label><Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as Project["status"] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="on_hold">On Hold</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-2"><Label>Budget ($)</Label><Input type="number" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} /></div>
                <div className="grid gap-2"><Label>Spent ($)</Label><Input type="number" value={form.spent} onChange={e => setForm(p => ({ ...p, spent: e.target.value }))} /></div>
                <div className="grid gap-2"><Label>Progress (%)</Label><Input type="number" min={0} max={100} value={form.progress} onChange={e => setForm(p => ({ ...p, progress: Number(e.target.value) }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Deadline</Label><Input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} /></div>
              </div>
              <div className="grid gap-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
            </div>
            <DialogFooter><Button type="submit" disabled={createProject.isPending || updateProject.isPending}>{dialog.mode === "create" ? "Create" : "Save"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={o => { if (!o) setDeleteTarget(null) }} title="Delete Project" description={`Are you sure you want to delete "${deleteTarget?.name}"?`} onConfirm={() => deleteTarget && deleteProject.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })} loading={deleteProject.isPending} />

      <Dialog open={!!detail} onOpenChange={o => { if (!o) setDetail(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{detail?.name}</DialogTitle><DialogDescription>Project details</DialogDescription></DialogHeader>
          {detail && (<div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-muted-foreground">Account</span><p className="font-medium">{detail.accountName}</p></div>
              <div><span className="text-muted-foreground">Status</span><p><StatusBadge status={detail.status} /></p></div>
              <div><span className="text-muted-foreground">Budget</span><p className="font-medium">${detail.budget.toLocaleString()}</p></div>
              <div><span className="text-muted-foreground">Spent</span><p className="font-medium">${detail.spent.toLocaleString()}</p></div>
              <div><span className="text-muted-foreground">Progress</span><p className="font-medium">{detail.progress}%</p></div>
              <div><span className="text-muted-foreground">Margin</span><p className="font-medium">{detail.margin}%</p></div>
              <div><span className="text-muted-foreground">Deadline</span><p className="font-medium">{detail.endDate}</p></div>
              <div><span className="text-muted-foreground">Team</span><p className="font-medium">{detail.assignedTo.join(", ") || "—"}</p></div>
            </div>
            {detail.description && <div className="pt-2 border-t"><span className="text-muted-foreground">Description</span><p className="mt-1">{detail.description}</p></div>}
          </div>)}
          <DialogFooter><Button variant="outline" onClick={() => setDetail(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
