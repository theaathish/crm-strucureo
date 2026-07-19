import { motion } from "framer-motion"
import {
  AreaChart, Area, BarChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts"
import { PageHeader } from "@/components/ui/page-header"
import { MetricCard } from "@/components/ui/metric-card"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { useDashboard } from "@/hooks/use-dashboard"

const revenueConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  target: { label: "Target", color: "var(--chart-3)" },
} satisfies ChartConfig

const mrrConfig = { mrr: { label: "MRR", color: "var(--chart-1)" } } satisfies ChartConfig

const tierColors: Record<string, string> = {
  enterprise: "var(--chart-1)",
  "mid-market": "var(--chart-3)",
  smb: "var(--chart-4)",
}

export function AnalyticsPage() {
  const { data } = useDashboard()
  const revenueData = data?.revenueData ?? []
  const mrrData = data?.mrrData ?? []
  const accounts = data?.topAccounts ?? []
  const totalRevenue = revenueData.reduce((s: number, r: any) => s + r.revenue, 0) || 0

  // Compute tier distribution from accounts
  const tierMap: Record<string, number> = {}
  accounts.forEach((a: any) => { tierMap[a.tier] = (tierMap[a.tier] || 0) + 1 })
  const tierData = Object.entries(tierMap).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: tierColors[name] ?? "var(--chart-4)",
  }))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]">
      <PageHeader title="Analytics" description="Deep-dive into business performance metrics" actions={
        <Button variant="outline" size="sm" className="h-8 text-xs">Export Report</Button>
      } />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard title="Total Revenue" value={totalRevenue} prefix="$" change={18.2} trend="up" />
        <MetricCard title="NRR" value="112%" change={3.1} trend="up" />
        <MetricCard title="LTV/CAC Ratio" value="4.2x" change={0.3} trend="up" />
        <MetricCard title="Avg. Contract Length" value="14mo" change={1.5} trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-1">Revenue vs Target</h3>
          <p className="text-xs text-muted-foreground mb-4">Monthly revenue performance</p>
          <ChartContainer config={revenueConfig} className="h-[220px] w-full">
            <AreaChart data={revenueData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} fill="url(#revGrad)" />
              <Line type="monotone" dataKey="target" stroke="var(--color-target)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </AreaChart>
          </ChartContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-1">MRR Growth</h3>
          <p className="text-xs text-muted-foreground mb-4">Monthly recurring revenue trend</p>
          <ChartContainer config={mrrConfig} className="h-[220px] w-full">
            <BarChart data={mrrData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="mrr" fill="var(--color-mrr)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Account Tier Distribution</h3>
          {tierData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-40 h-40 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={tierData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2}>
                      {tierData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2.5">
                {tierData.map(tier => (
                  <div key={tier.name} className="flex items-center gap-2">
                    <div className="size-2.5 rounded-sm shrink-0" style={{ background: tier.color }} />
                    <span className="text-sm text-foreground">{tier.name}</span>
                    <span className="text-sm text-muted-foreground ml-auto">{tier.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No accounts yet</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export function ReportsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]">
      <PageHeader
        title="Reports"
        description="Generate and manage business reports"
        actions={<Button size="sm" className="h-8 text-xs">Generate Report</Button>}
      />
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-sm text-muted-foreground">No reports yet. Generate your first report to get started.</p>
      </div>
    </motion.div>
  )
}
