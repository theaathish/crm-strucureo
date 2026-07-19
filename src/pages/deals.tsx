import { motion } from "framer-motion"
import { Plus, MoreHorizontal } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { MetricCard } from "@/components/ui/metric-card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Deal } from "@/lib/types"
import { useDeals } from "@/hooks/use-deals"

const STAGES = [
  { id: "discovery", label: "Discovery" },
  { id: "proposal", label: "Proposal" },
  { id: "negotiation", label: "Negotiation" },
  { id: "closed_won", label: "Closed Won" },
  { id: "closed_lost", label: "Closed Lost" },
] as const

function DealCard({ deal }: { deal: Deal }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card rounded-lg border border-border p-3 hover:border-foreground/20 transition-colors cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-foreground leading-snug truncate">{deal.title}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{deal.accountName}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-5 opacity-0 group-hover:opacity-100 shrink-0">
              <MoreHorizontal className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit Deal</DropdownMenuItem>
            <DropdownMenuItem>View Details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-sm font-semibold">${(deal.value / 1000).toFixed(0)}K</span>
        <div className="flex items-center gap-1">
          <div className="w-12 h-1 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-foreground rounded-full" style={{ width: `${deal.probability}%` }} />
          </div>
          <span className="text-[10px] text-muted-foreground">{deal.probability}%</span>
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground">Close: {deal.closeDate}</span>
        <div className="size-4 rounded-full bg-muted text-foreground text-[8px] font-bold flex items-center justify-center ml-auto">
          {deal.assignedTo.split(" ").map(n => n[0]).join("")}
        </div>
      </div>
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-card rounded-lg border border-border p-3 animate-pulse">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="h-3 bg-muted rounded w-3/4" />
          <div className="h-2 bg-muted rounded w-1/2" />
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-between">
        <div className="h-4 bg-muted rounded w-12" />
        <div className="flex items-center gap-1">
          <div className="w-12 h-1 rounded-full bg-muted" />
          <div className="h-2 bg-muted rounded w-6" />
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <div className="h-2 bg-muted rounded w-16" />
      </div>
    </div>
  )
}

export function DealsPage() {
  const { data: deals = [], isLoading, error } = useDeals()

  if (error) {
    return (
      <div className="p-6 space-y-6 max-w-[1600px]">
        <PageHeader
          title="Deals"
          description="Manage your deal pipeline with Kanban view"
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <p className="text-sm text-destructive">Failed to load deals</p>
            <p className="text-xs text-muted-foreground">Please try again later</p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-[1600px]">
        <PageHeader
          title="Deals"
          description="Manage your deal pipeline with Kanban view"
          actions={<Button size="sm" className="h-8 gap-1.5 text-xs" disabled><Plus className="size-3.5" /> Add Deal</Button>}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-card rounded-lg border border-border p-4 animate-pulse">
              <div className="h-2 bg-muted rounded w-20 mb-2" />
              <div className="h-5 bg-muted rounded w-24 mb-1" />
              <div className="h-2 bg-muted rounded w-16" />
            </div>
          ))}
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-max">
            {STAGES.map(stage => (
              <div key={stage.id} className="w-72 shrink-0">
                <div className="flex items-center justify-between mb-2.5 px-1">
                  <div className="h-5 bg-muted rounded w-24" />
                  <div className="h-4 bg-muted rounded w-12" />
                </div>
                <div className="space-y-2">
                  {[1, 2].map(j => (
                    <SkeletonCard key={j} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const activeDeals = deals.filter(d => d.stage !== "closed_won" && d.stage !== "closed_lost")
  const wonDeals = deals.filter(d => d.stage === "closed_won")
  const totalPipeline = activeDeals.reduce((s, d) => s + d.value, 0)
  const wonValue = wonDeals.reduce((s, d) => s + d.value, 0)
  const winRate = deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0
  const avgDeal = deals.length > 0 ? Math.round(deals.reduce((s, d) => s + d.value, 0) / deals.length) : 0

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]">
      <PageHeader
        title="Deals"
        description="Manage your deal pipeline with Kanban view"
        actions={<Button size="sm" className="h-8 gap-1.5 text-xs"><Plus className="size-3.5" /> Add Deal</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard title="Pipeline Value" value={totalPipeline} prefix="$" change={12} trend="up" />
        <MetricCard title="Won This Month" value={wonValue} prefix="$" change={22} trend="up" />
        <MetricCard title="Win Rate" value={`${winRate}%`} change={3} trend="up" />
        <MetricCard title="Avg. Deal Size" value={avgDeal} prefix="$" change={8} trend="up" />
      </div>

      {/* Kanban */}
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
                    <DealCard key={deal.id} deal={deal} />
                  ))}
                  {stageDeals.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border p-6 text-center">
                      <p className="text-xs text-muted-foreground">No deals</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
