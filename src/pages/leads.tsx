import { motion } from "framer-motion"
import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Plus, Eye, Pencil, Trash2, ArrowUpRight } from "lucide-react"
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
import type { Lead } from "@/lib/types"
import { useLeads, useCreateLead, useUpdateLead, useDeleteLead } from "@/hooks/use-leads"

const statuses: Lead["status"][] = ["new", "contacted", "qualified", "unqualified", "converted"]

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-zinc-400"}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-medium tabular-nums">{score}</span>
    </div>
  )
}

export function LeadsPage() {
  const { data: leads = [], isLoading } = useLeads()
  const createLead = useCreateLead()
  const updateLead = useUpdateLead()
  const deleteLead = useDeleteLead()
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [dialog, setDialog] = React.useState<{ open: boolean; mode?: "create" | "edit"; lead?: Lead }>({ open: false })
  const [detail, setDetail] = React.useState<Lead | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<Lead | null>(null)
  const [form, setForm] = React.useState({ name: "", company: "", email: "", phone: "", status: "new" as Lead["status"], source: "", score: "50", value: "0", notes: "", tags: "", assignedTo: "" })

  const filteredLeads = statusFilter === "all" ? leads : leads.filter(l => l.status === statusFilter)
  const totalValue = leads.reduce((s, l) => s + l.value, 0)
  const qualifiedCount = leads.filter(l => l.status === "qualified").length
  const avgScore = leads.length > 0 ? Math.round(leads.reduce((s, l) => s + l.score, 0) / leads.length) : 0

  function resetForm() {
    setForm({ name: "", company: "", email: "", phone: "", status: "new", source: "", score: "50", value: "0", notes: "", tags: "", assignedTo: "" })
  }

  function openEdit(lead: Lead) {
    setForm({ name: lead.name, company: lead.company, email: lead.email, phone: lead.phone, status: lead.status, source: lead.source, score: String(lead.score), value: String(lead.value), notes: lead.notes || "", tags: (lead.tags || []).join(", "), assignedTo: lead.assignedTo })
    setDialog({ open: true, mode: "edit", lead })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!dialog.open) return
    const data = { ...form, score: Number(form.score), value: Number(form.value), tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) }
    if (dialog.mode === "create") {
      createLead.mutate(data, { onSuccess: () => setDialog({ open: false }) })
    } else {
      updateLead.mutate({ id: dialog.lead!.id, data }, { onSuccess: () => setDialog({ open: false }) })
    }
  }

  const columns: ColumnDef<Lead>[] = [
    SelectColumn<Lead>(),
    { accessorKey: "name", header: "Name", cell: ({ row }) => (<div><p className="font-medium text-foreground">{row.original.name}</p><p className="text-[10px] text-muted-foreground">{row.original.email}</p></div>) },
    { accessorKey: "company", header: "Company", cell: ({ row }) => (<div className="flex items-center gap-2"><div className="size-6 rounded bg-muted text-foreground text-[10px] font-semibold flex items-center justify-center shrink-0">{row.original.company.slice(0, 2).toUpperCase()}</div><span>{row.original.company}</span></div>) },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "source", header: "Source", cell: ({ row }) => <span className="text-muted-foreground">{row.original.source}</span> },
    { accessorKey: "score", header: "Score", cell: ({ row }) => <ScoreBar score={row.original.score} /> },
    { accessorKey: "value", header: "Value", cell: ({ row }) => <span className="font-medium tabular-nums">${row.original.value.toLocaleString()}</span> },
    { accessorKey: "assignedTo", header: "Assigned", cell: ({ row }) => (<div className="flex items-center gap-1.5"><div className="size-5 rounded-full bg-foreground text-background text-[9px] font-bold flex items-center justify-center">{row.original.assignedTo.split(" ").map(n => n[0]).join("")}</div><span className="text-muted-foreground text-xs">{row.original.assignedTo.split(" ")[0]}</span></div>) },
    { accessorKey: "lastContact", header: "Last Contact", cell: ({ row }) => <span className="text-muted-foreground">{row.original.lastContact}</span> },
    { id: "actions", size: 40, cell: ({ row }) => (<div onClick={e => e.stopPropagation()}><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-7"><MoreHorizontal className="size-3.5" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => setDetail(row.original)}><Eye className="size-3.5 mr-2" />View Details</DropdownMenuItem><DropdownMenuItem onClick={() => openEdit(row.original)}><Pencil className="size-3.5 mr-2" />Edit Lead</DropdownMenuItem><DropdownMenuItem><ArrowUpRight className="size-3.5 mr-2" />Convert to Account</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(row.original)}><Trash2 className="size-3.5 mr-2" />Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>) },
  ]

  if (isLoading) {
    return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]"><PageHeader title="Leads" description="Track and manage your sales pipeline" actions={<Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => { resetForm(); setDialog({ open: true, mode: "create" }) }}><Plus className="size-3.5" /> Add Lead</Button>} /><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl border border-border bg-card animate-pulse" />)}</div><div className="rounded-xl border border-border bg-card p-5"><div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded bg-muted animate-pulse" />)}</div></div></motion.div>
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]">
      <PageHeader title="Leads" description="Track and manage your sales pipeline" actions={<Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => { resetForm(); setDialog({ open: true, mode: "create" }) }}><Plus className="size-3.5" /> Add Lead</Button>} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard title="Total Leads" value={leads.length} change={12} trend="up" />
        <MetricCard title="Qualified" value={qualifiedCount} change={8} trend="up" />
        <MetricCard title="Pipeline Value" value={totalValue} prefix="$" change={15} trend="up" />
        <MetricCard title="Avg. Score" value={avgScore} change={3} trend="up" />
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <DataTable columns={columns} data={filteredLeads} searchKey="name" searchPlaceholder="Search leads..." onRowClick={row => setDetail(row)} toolbar={<Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="All Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="new">New</SelectItem><SelectItem value="contacted">Contacted</SelectItem><SelectItem value="qualified">Qualified</SelectItem><SelectItem value="unqualified">Unqualified</SelectItem><SelectItem value="converted">Converted</SelectItem></SelectContent></Select>} />
      </div>

      <Dialog open={dialog.open} onOpenChange={o => { if (!o) setDialog({ open: false }) }}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmit}>
            <DialogHeader><DialogTitle>{dialog.mode === "create" ? "Add Lead" : "Edit Lead"}</DialogTitle><DialogDescription>{dialog.mode === "create" ? "Create a new lead" : "Update lead details"}</DialogDescription></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
                <div className="grid gap-2"><Label>Company</Label><Input value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
                <div className="grid gap-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-2"><Label>Status</Label><Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as Lead["status"] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                <div className="grid gap-2"><Label>Source</Label><Input value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))} /></div>
                <div className="grid gap-2"><Label>Value ($)</Label><Input type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Score (0-100)</Label><Input type="number" min={0} max={100} value={form.score} onChange={e => setForm(p => ({ ...p, score: e.target.value }))} /></div>
                <div className="grid gap-2"><Label>Assigned To</Label><Input value={form.assignedTo} onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))} /></div>
              </div>
              <div className="grid gap-2"><Label>Tags</Label><Input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="Comma-separated" /></div>
              <div className="grid gap-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} /></div>
            </div>
            <DialogFooter><Button type="submit" disabled={createLead.isPending || updateLead.isPending}>{dialog.mode === "create" ? "Create" : "Save"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={o => { if (!o) setDeleteTarget(null) }} title="Delete Lead" description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`} onConfirm={() => deleteTarget && deleteLead.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })} loading={deleteLead.isPending} />

      <Dialog open={!!detail} onOpenChange={o => { if (!o) setDetail(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{detail?.name}</DialogTitle><DialogDescription>Lead details</DialogDescription></DialogHeader>
          {detail && (<div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-muted-foreground">Company</span><p className="font-medium">{detail.company}</p></div>
              <div><span className="text-muted-foreground">Status</span><p><StatusBadge status={detail.status} /></p></div>
              <div><span className="text-muted-foreground">Email</span><p className="font-medium">{detail.email}</p></div>
              <div><span className="text-muted-foreground">Phone</span><p className="font-medium">{detail.phone}</p></div>
              <div><span className="text-muted-foreground">Source</span><p className="font-medium">{detail.source}</p></div>
              <div><span className="text-muted-foreground">Score</span><p><ScoreBar score={detail.score} /></p></div>
              <div><span className="text-muted-foreground">Value</span><p className="font-medium">${detail.value.toLocaleString()}</p></div>
              <div><span className="text-muted-foreground">Assigned To</span><p className="font-medium">{detail.assignedTo}</p></div>
            </div>
            {detail.notes && <div><span className="text-muted-foreground">Notes</span><p className="mt-1">{detail.notes}</p></div>}
            {(detail.tags || []).length > 0 && <div><span className="text-muted-foreground">Tags</span><div className="flex flex-wrap gap-1 mt-1">{detail.tags.map(t => <span key={t} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md">{t}</span>)}</div></div>}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t"><div><span className="text-muted-foreground">Created</span><p className="font-medium">{new Date(detail.createdAt).toLocaleDateString()}</p></div><div><span className="text-muted-foreground">Last Contact</span><p className="font-medium">{detail.lastContact}</p></div></div>
          </div>)}
          <DialogFooter><Button variant="outline" onClick={() => setDetail(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
