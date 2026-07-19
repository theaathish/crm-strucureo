import { motion } from "framer-motion"
import * as React from "react"
import { Plus, MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { MetricCard } from "@/components/ui/metric-card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import type { Deal } from "@/lib/types"
import { useDeals, useCreateDeal, useUpdateDeal, useDeleteDeal } from "@/hooks/use-deals"

const STAGES = [
  { id: "discovery", label: "Discovery" },
  { id: "proposal", label: "Proposal" },
  { id: "negotiation", label: "Negotiation" },
  { id: "closed_won", label: "Closed Won" },
  { id: "closed_lost", label: "Closed Lost" },
] as const

export function DealsPage() {
  const { data: deals = [], isLoading, error } = useDeals()
  const createDeal = useCreateDeal()
  const updateDeal = useUpdateDeal()
  const deleteDeal = useDeleteDeal()
  const [detail, setDetail] = React.useState<Deal | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<Deal | null>(null)
  const [dialog, setDialog] = React.useState<{ open: false } | { open: true; mode: "create" } | { open: true; mode: "edit"; deal: Deal }>({ open: false })
  const [form, setForm] = React.useState({ title: "", accountId: "", accountName: "", stage: "discovery" as Deal["stage"], value: "0", probability: "50", closeDate: "", assignedTo: "", description: "" })

  function resetForm() { setForm({ title: "", accountId: "", accountName: "", stage: "discovery", value: "0", probability: "50", closeDate: "", assignedTo: "", description: "" }) }
  function openEdit(deal: Deal) {
    setForm({ title: deal.title, accountId: deal.accountId, accountName: deal.accountName, stage: deal.stage, value: String(deal.value), probability: String(deal.probability), closeDate: deal.closeDate, assignedTo: deal.assignedTo, description: deal.description })
    setDialog({ open: true, mode: "edit", deal })
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data = { ...form, value: Number(form.value), probability: Number(form.probability) }
    if (dialog.mode === "create") {
      createDeal.mutate(data, { onSuccess: () => setDialog({ open: false }) })
    } else {
      updateDeal.mutate({ id: dialog.deal.id, data }, { onSuccess: () => setDialog({ open: false }) })
    }
  }

  if (error) {
    return <div className="p-6 space-y-6 max-w-[1600px]"><PageHeader title="Deals" description="Manage your deal pipeline with Kanban view" /><div className="flex items-center justify-center py-12"><div className="text-center space-y-2"><p className="text-sm text-destructive">Failed to load deals</p><p className="text-xs text-muted-foreground">Please try again later</p></div></div></div>
  }

  if (isLoading) {
    return <div className="p-6 space-y-6 max-w-[1600px]"><PageHeader title="Deals" description="Manage your deal pipeline with Kanban view" actions={<Button size="sm" className="h-8 gap-1.5 text-xs" disabled><Plus className="size-3.5" /> Add Deal</Button>} /><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[1, 2, 3, 4].map(i => <div key={i} className="bg-card rounded-lg border border-border p-4 animate-pulse"><div className="h-2 bg-muted rounded w-20 mb-2" /><div className="h-5 bg-muted rounded w-24 mb-1" /><div className="h-2 bg-muted rounded w-16" /></div>)}</div><div className="overflow-x-auto pb-4"><div className="flex gap-3 min-w-max">{STAGES.map(stage => <div key={stage.id} className="w-72 shrink-0"><div className="flex items-center justify-between mb-2.5 px-1"><div className="h-5 bg-muted rounded w-24" /><div className="h-4 bg-muted rounded w-12" /></div><div className="space-y-2">{[1, 2].map(j => <div key={j} className="bg-card rounded-lg border border-border p-3 animate-pulse"><div className="space-y-1.5"><div className="h-3 bg-muted rounded w-3/4" /><div className="h-2 bg-muted rounded w-1/2" /></div></div>)}</div></div>)}</div></div></div>
  }

  const activeDeals = deals.filter(d => d.stage !== "closed_won" && d.stage !== "closed_lost")
  const wonDeals = deals.filter(d => d.stage === "closed_won")
  const totalPipeline = activeDeals.reduce((s, d) => s + d.value, 0)
  const wonValue = wonDeals.reduce((s, d) => s + d.value, 0)
  const winRate = deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0
  const avgDeal = deals.length > 0 ? Math.round(deals.reduce((s, d) => s + d.value, 0) / deals.length) : 0

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]">
      <PageHeader title="Deals" description="Manage your deal pipeline with Kanban view" actions={<Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => { resetForm(); setDialog({ open: true, mode: "create" }) }}><Plus className="size-3.5" /> Add Deal</Button>} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard title="Pipeline Value" value={totalPipeline} prefix="$" change={12} trend="up" />
        <MetricCard title="Won This Month" value={wonValue} prefix="$" change={22} trend="up" />
        <MetricCard title="Win Rate" value={`${winRate}%`} change={3} trend="up" />
        <MetricCard title="Avg. Deal Size" value={avgDeal} prefix="$" change={8} trend="up" />
      </div>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-max">
          {STAGES.map(stage => {
            const stageDeals = deals.filter(d => d.stage === stage.id)
            const stageValue = stageDeals.reduce((s, d) => s + d.value, 0)
            return (
              <div key={stage.id} className="w-72 shrink-0">
                <div className="flex items-center justify-between mb-2.5 px-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={stage.id} />
                    <span className="text-xs text-muted-foreground">{stageDeals.length}</span>
                  </div>
                  <span className="text-xs font-medium">${(stageValue / 1000).toFixed(0)}K</span>
                </div>
                <div className="space-y-2">
                  {stageDeals.map(deal => (
                    <motion.div key={deal.id} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-lg border border-border p-3 hover:border-foreground/20 transition-colors cursor-pointer group" onClick={() => setDetail(deal)}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground leading-snug truncate">{deal.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{deal.accountName}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-5 opacity-0 group-hover:opacity-100 shrink-0" onClick={e => e.stopPropagation()}><MoreHorizontal className="size-3" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEdit(deal) }}><Pencil className="size-3 mr-2" />Edit Deal</DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDetail(deal) }}><Eye className="size-3 mr-2" />View Details</DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onClick={(e) => { e.stopPropagation(); setDeleteTarget(deal) }}><Trash2 className="size-3 mr-2" />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between">
                        <span className="text-sm font-semibold">${(deal.value / 1000).toFixed(0)}K</span>
                        <div className="flex items-center gap-1">
                          <div className="w-12 h-1 rounded-full bg-muted overflow-hidden"><div className="h-full bg-foreground rounded-full" style={{ width: `${deal.probability}%` }} /></div>
                          <span className="text-[10px] text-muted-foreground">{deal.probability}%</span>
                        </div>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">Close: {deal.closeDate}</span>
                        <div className="size-4 rounded-full bg-muted text-foreground text-[8px] font-bold flex items-center justify-center ml-auto">{deal.assignedTo.split(" ").map(n => n[0]).join("")}</div>
                      </div>
                    </motion.div>
                  ))}
                  {stageDeals.length === 0 && <div className="rounded-lg border border-dashed border-border p-6 text-center"><p className="text-xs text-muted-foreground">No deals</p></div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Dialog open={dialog.open} onOpenChange={o => { if (!o) setDialog({ open: false }) }}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmit}>
            <DialogHeader><DialogTitle>{dialog.mode === "create" ? "Add Deal" : "Edit Deal"}</DialogTitle><DialogDescription>{dialog.mode === "create" ? "Create a new deal" : "Update deal details"}</DialogDescription></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label>Title</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Account Name</Label><Input value={form.accountName} onChange={e => setForm(p => ({ ...p, accountName: e.target.value }))} /></div>
                <div className="grid gap-2"><Label>Stage</Label><Select value={form.stage} onValueChange={v => setForm(p => ({ ...p, stage: v as Deal["stage"] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STAGES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-2"><Label>Value ($)</Label><Input type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} /></div>
                <div className="grid gap-2"><Label>Probability (%)</Label><Input type="number" min={0} max={100} value={form.probability} onChange={e => setForm(p => ({ ...p, probability: e.target.value }))} /></div>
                <div className="grid gap-2"><Label>Close Date</Label><Input type="date" value={form.closeDate} onChange={e => setForm(p => ({ ...p, closeDate: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Assigned To</Label><Input value={form.assignedTo} onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))} /></div>
              </div>
              <div className="grid gap-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
            </div>
            <DialogFooter><Button type="submit" disabled={createDeal.isPending || updateDeal.isPending}>{dialog.mode === "create" ? "Create" : "Save"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={o => { if (!o) setDeleteTarget(null) }} title="Delete Deal" description={`Are you sure you want to delete "${deleteTarget?.title}"?`} onConfirm={() => deleteTarget && deleteDeal.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })} loading={deleteDeal.isPending} />

      <Dialog open={!!detail} onOpenChange={o => { if (!o) setDetail(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{detail?.title}</DialogTitle><DialogDescription>Deal details</DialogDescription></DialogHeader>
          {detail && (<div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-muted-foreground">Account</span><p className="font-medium">{detail.accountName}</p></div>
              <div><span className="text-muted-foreground">Stage</span><p><StatusBadge status={detail.stage} /></p></div>
              <div><span className="text-muted-foreground">Value</span><p className="font-medium">${detail.value.toLocaleString()}</p></div>
              <div><span className="text-muted-foreground">Probability</span><p className="font-medium">{detail.probability}%</p></div>
              <div><span className="text-muted-foreground">Close Date</span><p className="font-medium">{detail.closeDate}</p></div>
              <div><span className="text-muted-foreground">Assigned To</span><p className="font-medium">{detail.assignedTo}</p></div>
            </div>
            {detail.description && <div><span className="text-muted-foreground">Description</span><p className="mt-1">{detail.description}</p></div>}
            <div className="pt-2 border-t"><span className="text-muted-foreground">Created</span><p className="font-medium">{new Date(detail.createdAt).toLocaleDateString()}</p></div>
          </div>)}
          <DialogFooter><Button variant="outline" onClick={() => setDetail(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
