import * as React from "react"
import { motion } from "framer-motion"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Plus, Eye, Pencil, Trash2 } from "lucide-react"
import { DataTable, SelectColumn } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { MetricCard } from "@/components/ui/metric-card"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import type { Account } from "@/lib/types"
import { useAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount } from "@/hooks/use-accounts"

export function AccountsPage() {
  const [healthFilter, setHealthFilter] = React.useState("all")
  const { data: accounts = [], isLoading } = useAccounts()
  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()
  const deleteAccount = useDeleteAccount()
  const [detail, setDetailState] = React.useState<Account | null>(null)
  const [deleteTarget, setDeleteTargetState] = React.useState<Account | null>(null)
  const [dialog, setDialog] = React.useState<{ open: boolean; mode?: "create" | "edit"; account?: Account }>({ open: false })
  const [form, setForm] = React.useState({ name: "", industry: "", website: "", mrr: "0", arr: "0", employees: "0", country: "", status: "active" as Account["status"], tier: "mid-market" as Account["tier"], health: "healthy" as Account["health"], contractValue: "0", margin: "0" })

  function openEdit(account: Account) {
    setForm({ name: account.name, industry: account.industry, website: account.website, mrr: String(account.mrr), arr: String(account.arr), employees: String(account.employees), country: account.country, status: account.status, tier: account.tier, health: account.health, contractValue: String(account.contractValue), margin: String(account.margin) })
    setDialog({ open: true, mode: "edit", account })
  }

  const filtered = healthFilter === "all" ? accounts : accounts.filter(a => a.health === healthFilter)
  const totalMRR = accounts.reduce((s, a) => s + a.mrr, 0)
  const totalARR = accounts.reduce((s, a) => s + a.arr, 0)
  const avgMargin = accounts.length > 0 ? Math.round(accounts.reduce((s, a) => s + a.margin, 0) / accounts.length) : 0
  const atRisk = accounts.filter(a => a.health !== "healthy").length

  function resetForm() {
    setForm({ name: "", industry: "", website: "", mrr: "0", arr: "0", employees: "0", country: "", status: "active", tier: "mid-market", health: "healthy", contractValue: "0", margin: "0" })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!dialog.open) return
    const data = { ...form, mrr: Number(form.mrr), arr: Number(form.arr), employees: Number(form.employees), contractValue: Number(form.contractValue), margin: Number(form.margin) }
    if (dialog.mode === "create") {
      createAccount.mutate(data, { onSuccess: () => setDialog({ open: false }) })
    } else {
      updateAccount.mutate({ id: dialog.account!.id, data }, { onSuccess: () => setDialog({ open: false }) })
    }
  }

  const columns: ColumnDef<Account>[] = [
    SelectColumn<Account>(),
    { accessorKey: "name", header: "Account", cell: ({ row }) => (<div className="flex items-center gap-2.5"><div className="size-8 rounded-lg bg-muted text-foreground text-xs font-bold flex items-center justify-center shrink-0">{row.original.name.slice(0, 2).toUpperCase()}</div><div><p className="font-medium text-foreground">{row.original.name}</p><p className="text-[10px] text-muted-foreground">{row.original.website}</p></div></div>) },
    { accessorKey: "industry", header: "Industry", cell: ({ row }) => <span className="text-muted-foreground">{row.original.industry}</span> },
    { accessorKey: "tier", header: "Tier", cell: ({ row }) => <StatusBadge status={row.original.tier} /> },
    { accessorKey: "health", header: "Health", cell: ({ row }) => <StatusBadge status={row.original.health} /> },
    { accessorKey: "mrr", header: "MRR", cell: ({ row }) => <span className="font-semibold tabular-nums">${row.original.mrr.toLocaleString()}</span> },
    { accessorKey: "arr", header: "ARR", cell: ({ row }) => <span className="tabular-nums">${row.original.arr.toLocaleString()}</span> },
    { accessorKey: "margin", header: "Margin", cell: ({ row }) => (<div className="flex items-center gap-2"><div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden"><div className={`h-full rounded-full ${row.original.margin >= 70 ? "bg-emerald-500" : row.original.margin >= 55 ? "bg-amber-500" : "bg-destructive"}`} style={{ width: `${row.original.margin}%` }} /></div><span className={`text-xs font-medium ${row.original.margin < 55 ? "text-destructive" : ""}`}>{row.original.margin}%</span></div>) },
    { accessorKey: "employees", header: "Employees", cell: ({ row }) => <span className="text-muted-foreground tabular-nums">{row.original.employees}</span> },
    { accessorKey: "country", header: "Country", cell: ({ row }) => <span className="text-muted-foreground">{row.original.country}</span> },
    { id: "actions", size: 40, cell: ({ row }) => (<div onClick={e => e.stopPropagation()}><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-7"><MoreHorizontal className="size-3.5" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => setDetailState(row.original)}><Eye className="size-3.5 mr-2" />View Account</DropdownMenuItem><DropdownMenuItem onClick={() => openEdit(row.original)}><Pencil className="size-3.5 mr-2" />Edit</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={() => setDeleteTargetState(row.original)}><Trash2 className="size-3.5 mr-2" />Archive</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>) },
  ]

  if (isLoading) {
    return <div className="p-6 space-y-6 max-w-[1600px]"><PageHeader title="Accounts" description="Manage your customer accounts and track health" /><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <div key={i} className="rounded-xl border border-border bg-card p-5 animate-pulse"><div className="h-4 w-24 bg-muted rounded mb-3" /><div className="h-8 w-20 bg-muted rounded" /></div>)}</div><div className="rounded-xl border border-border bg-card p-5 animate-pulse"><div className="h-8 w-36 bg-muted rounded mb-4" /><div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-muted rounded" />)}</div></div></div>
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]">
      <PageHeader title="Accounts" description="Manage your customer accounts and track health" actions={<Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => { resetForm(); setDialog({ open: true, mode: "create" }) }}><Plus className="size-3.5" /> Add Account</Button>} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard title="Total MRR" value={totalMRR} prefix="$" change={4.8} trend="up" />
        <MetricCard title="Total ARR" value={totalARR} prefix="$" change={4.8} trend="up" />
        <MetricCard title="Avg. Margin" value={`${avgMargin}%`} change={1.2} trend="up" />
        <MetricCard title="At-Risk Accounts" value={atRisk} trend="down" danger={atRisk > 0} change={atRisk > 0 ? -1 : 0} />
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <DataTable columns={columns} data={filtered} searchKey="name" searchPlaceholder="Search accounts..." onRowClick={row => setDetailState(row)} toolbar={<Select value={healthFilter} onValueChange={setHealthFilter}><SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="All Health" /></SelectTrigger><SelectContent><SelectItem value="all">All Health</SelectItem><SelectItem value="healthy">Healthy</SelectItem><SelectItem value="at_risk">At Risk</SelectItem><SelectItem value="churning">Churning</SelectItem></SelectContent></Select>} />
      </div>

      <Dialog open={dialog.open} onOpenChange={o => { if (!o) setDialog({ open: false }) }}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmit}>
            <DialogHeader><DialogTitle>{dialog.mode === "create" ? "Add Account" : "Edit Account"}</DialogTitle><DialogDescription>{dialog.mode === "create" ? "Create a new account" : "Update account details"}</DialogDescription></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
                <div className="grid gap-2"><Label>Industry</Label><Input value={form.industry} onChange={e => setForm(p => ({ ...p, industry: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Website</Label><Input value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} /></div>
                <div className="grid gap-2"><Label>Country</Label><Input value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-2"><Label>Status</Label><Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as Account["status"] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="churned">Churned</SelectItem><SelectItem value="prospect">Prospect</SelectItem></SelectContent></Select></div>
                <div className="grid gap-2"><Label>Tier</Label><Select value={form.tier} onValueChange={v => setForm(p => ({ ...p, tier: v as Account["tier"] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="enterprise">Enterprise</SelectItem><SelectItem value="mid-market">Mid-Market</SelectItem><SelectItem value="smb">SMB</SelectItem></SelectContent></Select></div>
                <div className="grid gap-2"><Label>Health</Label><Select value={form.health} onValueChange={v => setForm(p => ({ ...p, health: v as Account["health"] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="healthy">Healthy</SelectItem><SelectItem value="at_risk">At Risk</SelectItem><SelectItem value="churning">Churning</SelectItem></SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-2"><Label>MRR ($)</Label><Input type="number" value={form.mrr} onChange={e => setForm(p => ({ ...p, mrr: e.target.value }))} /></div>
                <div className="grid gap-2"><Label>ARR ($)</Label><Input type="number" value={form.arr} onChange={e => setForm(p => ({ ...p, arr: e.target.value }))} /></div>
                <div className="grid gap-2"><Label>Employees</Label><Input type="number" value={form.employees} onChange={e => setForm(p => ({ ...p, employees: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Contract Value ($)</Label><Input type="number" value={form.contractValue} onChange={e => setForm(p => ({ ...p, contractValue: e.target.value }))} /></div>
                <div className="grid gap-2"><Label>Margin (%)</Label><Input type="number" value={form.margin} onChange={e => setForm(p => ({ ...p, margin: e.target.value }))} /></div>
              </div>
            </div>
            <DialogFooter><Button type="submit" disabled={createAccount.isPending || updateAccount.isPending}>{dialog.mode === "create" ? "Create" : "Save"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={o => { if (!o) setDeleteTargetState(null) }} title="Archive Account" description={`Are you sure you want to archive "${deleteTarget?.name}"?`} onConfirm={() => deleteTarget && deleteAccount.mutate(deleteTarget.id, { onSuccess: () => setDeleteTargetState(null) })} loading={deleteAccount.isPending} variant="destructive" />

      <Dialog open={!!detail} onOpenChange={o => { if (!o) setDetailState(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{detail?.name}</DialogTitle><DialogDescription>Account details</DialogDescription></DialogHeader>
          {detail && (<div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-muted-foreground">Industry</span><p className="font-medium">{detail.industry}</p></div>
              <div><span className="text-muted-foreground">Status</span><p><StatusBadge status={detail.status} /></p></div>
              <div><span className="text-muted-foreground">Tier</span><p><StatusBadge status={detail.tier} /></p></div>
              <div><span className="text-muted-foreground">Health</span><p><StatusBadge status={detail.health} /></p></div>
              <div><span className="text-muted-foreground">MRR</span><p className="font-medium">${detail.mrr.toLocaleString()}</p></div>
              <div><span className="text-muted-foreground">ARR</span><p className="font-medium">${detail.arr.toLocaleString()}</p></div>
              <div><span className="text-muted-foreground">Employees</span><p className="font-medium">{detail.employees}</p></div>
              <div><span className="text-muted-foreground">Country</span><p className="font-medium">{detail.country}</p></div>
              <div><span className="text-muted-foreground">Website</span><p className="font-medium">{detail.website}</p></div>
              <div><span className="text-muted-foreground">Margin</span><p className="font-medium">{detail.margin}%</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t"><div><span className="text-muted-foreground">Created</span><p className="font-medium">{new Date(detail.createdAt).toLocaleDateString()}</p></div></div>
          </div>)}
          <DialogFooter><Button variant="outline" onClick={() => setDetailState(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
