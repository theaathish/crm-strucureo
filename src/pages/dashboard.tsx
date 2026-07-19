import { motion } from "framer-motion"
import {
  AreaChart, Area, BarChart, Bar, Line,
  XAxis, YAxis, CartesianGrid
} from "recharts"
import {
  TrendingUp, FolderKanban,
  AlertTriangle, ArrowUpRight, Activity, Clock, CheckCircle2, Loader2
} from "lucide-react"
import { MetricCard } from "@/components/ui/metric-card"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useApp } from "@/lib/store"
import { REVENUE_DATA, MRR_DATA, PIPELINE_DATA } from "@/lib/data"
import { useDashboard } from "@/hooks/use-dashboard"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

const revenueConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  target: { label: "Target", color: "var(--chart-3)" },
} satisfies ChartConfig

const mrrConfig = {
  mrr: { label: "MRR", color: "var(--chart-1)" },
} satisfies ChartConfig

const pipelineConfig = {
  discovery: { label: "Discovery", color: "var(--chart-3)" },
  proposal: { label: "Proposal", color: "var(--chart-4)" },
  negotiation: { label: "Negotiation", color: "var(--chart-2)" },
  closed: { label: "Closed", color: "var(--chart-1)" },
} satisfies ChartConfig

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
}

export function DashboardPage() {
  const { setCurrentPage } = useApp()
  const { data, isLoading, error } = useDashboard()

  if (isLoading) {
    return (
      <div className="p-6 max-w-[1600px]">
        <PageHeader title="Dashboard" description="Your business at a glance" />
        <div className="flex items-center justify-center h-64 text-muted-foreground gap-2">
          <Loader2 className="size-5 animate-spin" />
          <span className="text-sm">Loading dashboard…</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-[1600px]">
        <PageHeader title="Dashboard" description="Your business at a glance" />
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-2">
          <AlertTriangle className="size-5 text-destructive" />
          <p className="text-sm text-destructive">Failed to load dashboard data</p>
          <p className="text-xs">{error.message}</p>
        </div>
      </div>
    )
  }

  const {
    totalMRR, totalARR, pipelineValue, atRiskAccounts, avgMargin,
    qualifiedLeads, topAccounts, recentActivities, todayTasks,
    activeProjects, openDeals,
  } = data!

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-6 max-w-[1600px]"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Dashboard"
          description="Your business at a glance"
          actions={
            <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5">
              <Clock className="size-3.5" />
              Last 30 days
            </Button>
          }
        />
      </motion.div>

      {/* KPI Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        <MetricCard title="MRR" value={totalMRR} prefix="$" change={4.8} trend="up" changeLabel="vs last month" />
        <MetricCard title="ARR" value={totalARR} prefix="$" change={4.8} trend="up" />
        <MetricCard title="Pipeline" value={pipelineValue} prefix="$" change={12.3} trend="up" changeLabel="vs last quarter" />
        <MetricCard title="Avg. Margin" value={`${avgMargin.toFixed(0)}%`} change={1.2} trend="up" />
        <MetricCard
          title="At-Risk Accounts"
          value={atRiskAccounts.length}
          change={-1}
          trend="down"
          danger
          subtitle={`${atRiskAccounts.map((a: any) => a.name).join(", ")}`}
        />
        <MetricCard title="Hot Leads" value={qualifiedLeads} change={25} trend="up" changeLabel="this week" />
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Revenue vs Target</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly performance tracking</p>
            </div>
            <Badge variant="secondary" className="text-xs">6 months</Badge>
          </div>
          <ChartContainer config={revenueConfig} className="h-[200px] w-full">
            <AreaChart data={REVENUE_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} fill="url(#revenueGrad)" />
              <Line type="monotone" dataKey="target" stroke="var(--color-target)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </AreaChart>
          </ChartContainer>
        </div>

        {/* MRR Chart */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">MRR Growth</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly recurring revenue</p>
            </div>
          </div>
          <ChartContainer config={mrrConfig} className="h-[200px] w-full">
            <BarChart data={MRR_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="mrr" fill="var(--color-mrr)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      </motion.div>

      {/* Pipeline + Top Accounts */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pipeline funnel */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Deal Pipeline</h3>
            <button onClick={() => setCurrentPage("deals")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              View all <ArrowUpRight className="size-3" />
            </button>
          </div>
          <ChartContainer config={pipelineConfig} className="h-[180px] w-full">
            <BarChart data={PIPELINE_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="closed" fill="var(--color-closed)" radius={[3, 3, 0, 0]} stackId="a" />
              <Bar dataKey="negotiation" fill="var(--color-negotiation)" stackId="a" />
              <Bar dataKey="proposal" fill="var(--color-proposal)" stackId="a" />
              <Bar dataKey="discovery" fill="var(--color-discovery)" stackId="a" />
            </BarChart>
          </ChartContainer>
          <div className="mt-3 space-y-2">
            {openDeals.slice(0, 3).map((deal: any) => (
              <div key={deal.id} className="flex items-center justify-between text-xs">
                <span className="text-foreground truncate max-w-[140px]">{deal.title}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={deal.stage} />
                  <span className="font-medium">${(deal.value/1000).toFixed(0)}K</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top accounts */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Top Accounts</h3>
            <button onClick={() => setCurrentPage("accounts")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              View all <ArrowUpRight className="size-3" />
            </button>
          </div>
          <div className="space-y-3">
            {topAccounts.map((account: any, idx: number) => (
              <div key={account.id} className="flex items-center gap-3 group">
                <span className="text-xs text-muted-foreground w-4 shrink-0">{idx + 1}</span>
                <div className="size-8 rounded-lg bg-muted flex items-center justify-center text-xs font-semibold text-foreground shrink-0">
                  {account.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{account.name}</p>
                    <StatusBadge status={account.health} />
                    <StatusBadge status={account.tier} />
                  </div>
                  <p className="text-xs text-muted-foreground">{account.industry}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold">${(account.mrr/1000).toFixed(1)}K</p>
                  <p className="text-xs text-muted-foreground">{account.margin}% margin</p>
                </div>
                <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden shrink-0">
                  <div
                    className="h-full bg-foreground rounded-full"
                    style={{ width: `${account.margin}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          {atRiskAccounts.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium text-destructive">Churn Risk Alert</p>
                  <p className="text-muted-foreground mt-0.5">
                    {atRiskAccounts.map((a: any) => a.name).join(" and ")} {atRiskAccounts.length === 1 ? "is" : "are"} showing signs of churn. Immediate action required.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Activity + Tasks */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Recent Activity</h3>
            <Activity className="size-4 text-muted-foreground" />
          </div>
          <div className="space-y-0">
            {recentActivities.map((activity: any, idx: number) => {
              const icons: Record<string, string> = {
                call: "📞", email: "✉️", meeting: "🤝", note: "📝", deal: "⚡", task: "✅"
              }
              return (
                <div key={activity.id} className="flex gap-3 pb-3">
                  <div className="flex flex-col items-center">
                    <span className="text-base">{icons[activity.type] ?? "•"}</span>
                    {idx < recentActivities.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-1.5" />
                    )}
                  </div>
                  <div className="pb-3 flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-relaxed">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground">{activity.userName}</span>
                      <span className="text-[10px] text-muted-foreground">•</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Open Tasks</h3>
            <button onClick={() => setCurrentPage("tasks")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              View all <ArrowUpRight className="size-3" />
            </button>
          </div>
          <div className="space-y-2">
            {todayTasks.map((task: any) => (
              <div key={task.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
                <div className={`mt-0.5 size-4 rounded border-2 shrink-0 flex items-center justify-center ${task.status === "done" ? "bg-foreground border-foreground" : "border-border"}`}>
                  {task.status === "done" && <CheckCircle2 className="size-3 text-background" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground leading-snug">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={task.priority} />
                    <span className="text-[10px] text-muted-foreground">{task.assignedTo}</span>
                    {task.dueDate && (
                      <span className="text-[10px] text-muted-foreground">Due {task.dueDate}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Projects + Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Active Projects */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Active Projects</h3>
            <button onClick={() => setCurrentPage("projects")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              View all <ArrowUpRight className="size-3" />
            </button>
          </div>
          <div className="space-y-3">
            {activeProjects.map((project: any) => (
              <div key={project.id} className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <FolderKanban className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-xs font-medium truncate">{project.name}</p>
                    <span className="text-xs text-muted-foreground shrink-0">{project.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="h-full bg-foreground rounded-full"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">{project.accountName}</span>
                    <span className="text-[10px] text-muted-foreground">{project.margin}% margin</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key metrics */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">NRR</p>
            <p className="text-2xl font-semibold">112%</p>
            <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1.5">
              <TrendingUp className="size-3" /> +3% vs last quarter
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">IP / Patents</p>
            <p className="text-2xl font-semibold">14</p>
            <p className="text-xs text-muted-foreground mt-1.5">3 pending approval</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">Retention Rate</p>
            <p className="text-2xl font-semibold">94.2%</p>
            <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1.5">
              <TrendingUp className="size-3" /> Above target
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
