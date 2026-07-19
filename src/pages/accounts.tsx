import * as React from "react"
import { motion } from "framer-motion"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Plus } from "lucide-react"
import { DataTable, SelectColumn } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { MetricCard } from "@/components/ui/metric-card"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import type { Account } from "@/lib/types"
import { useAccounts } from "@/hooks/use-accounts"

const columns: ColumnDef<Account>[] = [
  SelectColumn<Account>(),
  {
    accessorKey: "name",
    header: "Account",
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <div className="size-8 rounded-lg bg-muted text-foreground text-xs font-bold flex items-center justify-center shrink-0">
          {row.original.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-foreground">{row.original.name}</p>
          <p className="text-[10px] text-muted-foreground">{row.original.website}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "industry",
    header: "Industry",
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.industry}</span>,
  },
  {
    accessorKey: "tier",
    header: "Tier",
    cell: ({ row }) => <StatusBadge status={row.original.tier} />,
  },
  {
    accessorKey: "health",
    header: "Health",
    cell: ({ row }) => <StatusBadge status={row.original.health} />,
  },
  {
    accessorKey: "mrr",
    header: "MRR",
    cell: ({ row }) => (
      <span className="font-semibold tabular-nums">${row.original.mrr.toLocaleString()}</span>
    ),
  },
  {
    accessorKey: "arr",
    header: "ARR",
    cell: ({ row }) => (
      <span className="tabular-nums">${row.original.arr.toLocaleString()}</span>
    ),
  },
  {
    accessorKey: "margin",
    header: "Margin",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full ${row.original.margin >= 70 ? "bg-emerald-500" : row.original.margin >= 55 ? "bg-amber-500" : "bg-destructive"}`}
            style={{ width: `${row.original.margin}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${row.original.margin < 55 ? "text-destructive" : ""}`}>
          {row.original.margin}%
        </span>
      </div>
    ),
  },
  {
    accessorKey: "employees",
    header: "Employees",
    cell: ({ row }) => <span className="text-muted-foreground tabular-nums">{row.original.employees}</span>,
  },
  {
    accessorKey: "country",
    header: "Country",
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.country}</span>,
  },
  {
    id: "actions",
    size: 40,
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-7">
            <MoreHorizontal className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View Account</DropdownMenuItem>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>View Contacts</DropdownMenuItem>
          <DropdownMenuItem>View Deals</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Archive</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export function AccountsPage() {
  const [healthFilter, setHealthFilter] = React.useState("all")
  const { data: accounts = [], isLoading, error } = useAccounts()

  const filtered = healthFilter === "all" ? accounts : accounts.filter(a => a.health === healthFilter)
  const totalMRR = accounts.reduce((s, a) => s + a.mrr, 0)
  const totalARR = accounts.reduce((s, a) => s + a.arr, 0)
  const avgMargin = accounts.length > 0 ? Math.round(accounts.reduce((s, a) => s + a.margin, 0) / accounts.length) : 0
  const atRisk = accounts.filter(a => a.health !== "healthy").length

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-[1600px]">
        <PageHeader title="Accounts" description="Manage your customer accounts and track health" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 animate-pulse">
              <div className="h-4 w-24 bg-muted rounded mb-3" />
              <div className="h-8 w-20 bg-muted rounded" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border bg-card p-5 animate-pulse">
          <div className="h-8 w-36 bg-muted rounded mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 space-y-6 max-w-[1600px]">
        <PageHeader title="Accounts" description="Manage your customer accounts and track health" />
        <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-8 text-center">
          <p className="text-sm text-destructive font-medium">Failed to load accounts</p>
          <p className="text-xs text-muted-foreground mt-1">{error instanceof Error ? error.message : "An unexpected error occurred"}</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]">
      <PageHeader
        title="Accounts"
        description="Manage your customer accounts and track health"
        actions={<Button size="sm" className="h-8 gap-1.5 text-xs"><Plus className="size-3.5" /> Add Account</Button>}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard title="Total MRR" value={totalMRR} prefix="$" change={4.8} trend="up" />
        <MetricCard title="Total ARR" value={totalARR} prefix="$" change={4.8} trend="up" />
        <MetricCard title="Avg. Margin" value={`${avgMargin}%`} change={1.2} trend="up" />
        <MetricCard title="At-Risk Accounts" value={atRisk} trend="down" danger={atRisk > 0} change={atRisk > 0 ? -1 : 0} />
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <DataTable
          columns={columns}
          data={filtered}
          searchKey="name"
          searchPlaceholder="Search accounts..."
          toolbar={
            <Select value={healthFilter} onValueChange={setHealthFilter}>
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue placeholder="All Health" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Health</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="at_risk">At Risk</SelectItem>
                <SelectItem value="churning">Churning</SelectItem>
              </SelectContent>
            </Select>
          }
        />
      </div>
    </motion.div>
  )
}
