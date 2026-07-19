import { motion } from "framer-motion"
import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Plus, Eye, Pencil, Trash2, FlaskConical } from "lucide-react"
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
import type { Pilot } from "@/lib/types"
import { usePilots, useCreatePilot, useUpdatePilot, useDeletePilot } from "@/hooks/use-pilots"

const MOCK_RND = [
  { id: "r1", title: "AI-Powered Lead Scoring Engine", status: "active", category: "AI/ML", owner: "Casey Brown", startDate: "2024-10-01", priority: "high", description: "Machine learning model for automated lead prioritization" },
  { id: "r2", title: "Predictive Churn Detection", status: "active", category: "Analytics", owner: "Sam Chen", startDate: "2024-11-15", priority: "urgent", description: "Early warning system for at-risk customer identification" },
  { id: "r3", title: "Automated Contract Analysis", status: "planning", category: "Automation", owner: "Morgan Lee", startDate: "2025-02-01", priority: "medium", description: "NLP-based contract review and risk flagging" },
  { id: "r4", title: "Revenue Intelligence Platform", status: "completed", category: "Analytics", owner: "Casey Brown", startDate: "2024-07-01", priority: "high", description: "Unified revenue data aggregation and insights platform" },
]

export function RndPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]">
      <PageHeader title="Research & Development" description="Internal R&D initiatives and innovation projects" actions={<Button size="sm" className="h-8 gap-1.5 text-xs"><Plus className="size-3.5" /> New Initiative</Button>} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard title="Active R&D" value={MOCK_RND.filter(r => r.status === "active").length} change={0} trend="neutral" />
        <MetricCard title="Planning" value={MOCK_RND.filter(r => r.status === "planning").length} change={0} trend="neutral" />
        <MetricCard title="Completed" value={MOCK_RND.filter(r => r.status === "completed").length} change={25} trend="up" />
        <MetricCard title="IP Assets" value={14} change={12} trend="up" />
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4">R&D Initiatives</h3>
        <div className="space-y-2">
          {MOCK_RND.map(item => (
            <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
              <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0"><FlaskConical className="size-4 text-muted-foreground" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><p className="text-sm font-medium truncate">{item.title}</p><StatusBadge status={item.status as "active"} /><StatusBadge status={item.priority as "high"} /></div>
                <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
              </div>
              <div className="text-right shrink-0"><p className="text-xs font-medium">{item.category}</p><p className="text-[10px] text-muted-foreground">{item.owner}</p></div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export function PilotsPage() {
  const { data: pilots = [], isLoading, error } = usePilots()
  const createPilot = useCreatePilot()
  const updatePilot = useUpdatePilot()
  const deletePilot = useDeletePilot()
  const [detail, setDetail] = React.useState<Pilot | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<Pilot | null>(null)
  const [dialog, setDialog] = React.useState<{ open: false } | { open: true; mode: "create" } | { open: true; mode: "edit"; pilot: Pilot }>({ open: false })
  const [form, setForm] = React.useState({ name: "", accountId: "", accountName: "", status: "active" as Pilot["status"], value: "0", startDate: "", endDate: "", outcomes: "" })

  function resetForm() { setForm({ name: "", accountId: "", accountName: "", status: "active", value: "0", startDate: "", endDate: "", outcomes: "" }) }
  function openEdit(pilot: Pilot) {
    setForm({ name: pilot.name, accountId: pilot.accountId, accountName: pilot.accountName, status: pilot.status, value: String(pilot.value), startDate: pilot.startDate, endDate: pilot.endDate, outcomes: pilot.outcomes })
    setDialog({ open: true, mode: "edit", pilot })
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data = { ...form, value: Number(form.value) }
    if (dialog.mode === "create") {
      createPilot.mutate(data, { onSuccess: () => setDialog({ open: false }) })
    } else {
      updatePilot.mutate({ id: dialog.pilot.id, data }, { onSuccess: () => setDialog({ open: false }) })
    }
  }

  const active = pilots.filter(p => p.status === "active").length
  const totalValue = pilots.reduce((s, p) => s + p.value, 0)

  const pilotColumns: ColumnDef<Pilot>[] = [
    SelectColumn<Pilot>(),
    { accessorKey: "name", header: "Pilot", cell: ({ row }) => (<div><p className="font-medium text-foreground">{row.original.name}</p><p className="text-[10px] text-muted-foreground">{row.original.accountName}</p></div>) },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "value", header: "Value", cell: ({ row }) => <span className="font-medium tabular-nums">${row.original.value.toLocaleString()}</span> },
    { accessorKey: "startDate", header: "Start", cell: ({ row }) => <span className="text-muted-foreground">{row.original.startDate}</span> },
    { accessorKey: "endDate", header: "End", cell: ({ row }) => <span className="text-muted-foreground">{row.original.endDate}</span> },
    { accessorKey: "outcomes", header: "Expected Outcomes", cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.outcomes}</span> },
    { id: "actions", size: 40, cell: ({ row }) => (<DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-7" onClick={e => e.stopPropagation()}><MoreHorizontal className="size-3.5" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => setDetail(row.original)}><Eye className="size-3.5 mr-2" />View Pilot</DropdownMenuItem><DropdownMenuItem onClick={() => openEdit(row.original)}><Pencil className="size-3.5 mr-2" />Edit</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(row.original)}><Trash2 className="size-3.5 mr-2" />Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu>) },
  ]

  if (isLoading) {
    return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]"><PageHeader title="Pilots" description="Active and planned customer pilots" /><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[...Array(4)].map((_, i) => (<div key={i} className="rounded-xl border border-border bg-card p-5 animate-pulse"><div className="h-4 bg-muted rounded w-24 mb-2" /><div className="h-7 bg-muted rounded w-16" /></div>))}</div><div className="rounded-xl border border-border bg-card p-5"><div className="space-y-2">{[...Array(3)].map((_, i) => (<div key={i} className="h-12 bg-muted rounded animate-pulse" />))}</div></div></motion.div>)
  }
  if (error) {
    return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]"><PageHeader title="Pilots" description="Active and planned customer pilots" /><div className="rounded-xl border border-destructive/50 bg-destructive/10 p-5 text-center"><p className="text-sm text-destructive">Failed to load pilots. Please try again later.</p></div></motion.div>)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]">
      <PageHeader title="Pilots" description="Active and planned customer pilots" actions={<Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => { resetForm(); setDialog({ open: true, mode: "create" }) }}><Plus className="size-3.5" /> New Pilot</Button>} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard title="Active Pilots" value={active} change={0} trend="neutral" />
        <MetricCard title="Total Pilots" value={pilots.length} change={0} trend="neutral" />
        <MetricCard title="Total Value" value={totalValue} prefix="$" change={15} trend="up" />
        <MetricCard title="Conversion Rate" value="66%" change={5} trend="up" />
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <DataTable columns={pilotColumns} data={pilots} searchKey="name" searchPlaceholder="Search pilots..." onRowClick={row => setDetail(row)} />
      </div>

      <Dialog open={dialog.open} onOpenChange={o => { if (!o) { resetForm(); setDialog({ open: false }) }}}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmit}>
            <DialogHeader><DialogTitle>{dialog.mode === "create" ? "New Pilot" : "Edit Pilot"}</DialogTitle><DialogDescription>{dialog.mode === "create" ? "Create a new customer pilot" : "Update pilot details"}</DialogDescription></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label>Pilot Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Account Name</Label><Input value={form.accountName} onChange={e => setForm(p => ({ ...p, accountName: e.target.value }))} /></div>
                <div className="grid gap-2"><Label>Status</Label><Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as Pilot["status"] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="planning">Planning</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-2"><Label>Value ($)</Label><Input type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} /></div>
                <div className="grid gap-2"><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} /></div>
                <div className="grid gap-2"><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} /></div>
              </div>
              <div className="grid gap-2"><Label>Expected Outcomes</Label><Textarea value={form.outcomes} onChange={e => setForm(p => ({ ...p, outcomes: e.target.value }))} rows={2} /></div>
            </div>
            <DialogFooter><Button type="submit" disabled={createPilot.isPending || updatePilot.isPending}>{dialog.mode === "create" ? "Create" : "Save"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={o => { if (!o) setDeleteTarget(null) }} title="Delete Pilot" description={`Are you sure you want to delete "${deleteTarget?.name}"?`} onConfirm={() => deleteTarget && deletePilot.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })} loading={deletePilot.isPending} />

      <Dialog open={!!detail} onOpenChange={o => { if (!o) setDetail(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{detail?.name}</DialogTitle><DialogDescription>Pilot details</DialogDescription></DialogHeader>
          {detail && (<div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-muted-foreground">Account</span><p className="font-medium">{detail.accountName}</p></div>
              <div><span className="text-muted-foreground">Status</span><p><StatusBadge status={detail.status} /></p></div>
              <div><span className="text-muted-foreground">Value</span><p className="font-medium">${detail.value.toLocaleString()}</p></div>
              <div><span className="text-muted-foreground">Start</span><p className="font-medium">{detail.startDate}</p></div>
              <div><span className="text-muted-foreground">End</span><p className="font-medium">{detail.endDate}</p></div>
              <div><span className="text-muted-foreground">Outcomes</span><p className="font-medium">{detail.outcomes}</p></div>
            </div>
            <div className="pt-2 border-t"><span className="text-muted-foreground">Created</span><p className="font-medium">{new Date(detail.createdAt).toLocaleDateString()}</p></div>
          </div>)}
          <DialogFooter><Button variant="outline" onClick={() => setDetail(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
