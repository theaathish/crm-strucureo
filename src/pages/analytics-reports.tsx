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
import { REVENUE_DATA, MRR_DATA } from "@/lib/data"

const revenueConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  target: { label: "Target", color: "var(--chart-3)" },
} satisfies ChartConfig

const mrrConfig = { mrr: { label: "MRR", color: "var(--chart-1)" } } satisfies ChartConfig

const tierData = [
  { name: "Enterprise", value: 4, color: "var(--chart-1)" },
  { name: "Mid-Market", value: 2, color: "var(--chart-3)" },
  { name: "SMB", value: 2, color: "var(--chart-4)" },
]

const healthConfig = {
  healthy: { label: "Healthy", color: "var(--chart-1)" },
  at_risk: { label: "At Risk", color: "var(--chart-5)" },
} satisfies ChartConfig

const healthData = [
  { month: "Aug", healthy: 7, at_risk: 2 },
  { month: "Sep", healthy: 8, at_risk: 1 },
  { month: "Oct", healthy: 8, at_risk: 2 },
  { month: "Nov", healthy: 7, at_risk: 2 },
  { month: "Dec", healthy: 8, at_risk: 1 },
  { month: "Jan", healthy: 6, at_risk: 2 },
]

export function AnalyticsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]">
      <PageHeader title="Analytics" description="Deep-dive into business performance metrics" actions={
        <Button variant="outline" size="sm" className="h-8 text-xs">Export Report</Button>
      } />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard title="Total Revenue" value={2118000} prefix="$" change={18.2} trend="up" />
        <MetricCard title="NRR" value="112%" change={3.1} trend="up" />
        <MetricCard title="LTV/CAC Ratio" value="4.2x" change={0.3} trend="up" />
        <MetricCard title="Avg. Contract Length" value="14mo" change={1.5} trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-1">Revenue vs Target</h3>
          <p className="text-xs text-muted-foreground mb-4">Monthly revenue performance</p>
          <ChartContainer config={revenueConfig} className="h-[220px] w-full">
            <AreaChart data={REVENUE_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
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
            <BarChart data={MRR_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="mrr" fill="var(--color-mrr)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-1">Account Health Trend</h3>
          <p className="text-xs text-muted-foreground mb-4">Healthy vs at-risk over time</p>
          <ChartContainer config={healthConfig} className="h-[220px] w-full">
            <BarChart data={healthData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="healthy" fill="var(--color-healthy)" radius={[3, 3, 0, 0]} stackId="a" />
              <Bar dataKey="at_risk" fill="var(--color-at_risk)" radius={[3, 3, 0, 0]} stackId="a" />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Account Tier Distribution</h3>
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
        </div>
      </div>
    </motion.div>
  )
}

export function ReportsPage() {
  const reports = [
    { title: "Q4 2024 Revenue Report", date: "2025-01-05", type: "Revenue", status: "ready" },
    { title: "Pipeline Health Report", date: "2025-01-12", type: "Sales", status: "ready" },
    { title: "Account Health Summary", date: "2025-01-15", type: "Customer", status: "ready" },
    { title: "Monthly MRR Report - Jan", date: "2025-01-18", type: "Revenue", status: "generating" },
    { title: "Team Performance Q4", date: "2025-01-05", type: "Team", status: "ready" },
    { title: "Churn Analysis 2024", date: "2024-12-31", type: "Customer", status: "ready" },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]">
      <PageHeader
        title="Reports"
        description="Generate and manage business reports"
        actions={<Button size="sm" className="h-8 text-xs">Generate Report</Button>}
      />
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="space-y-2">
          {reports.map((report, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
                  {report.type.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{report.title}</p>
                  <p className="text-xs text-muted-foreground">{report.type} • {report.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${report.status === "ready" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                  {report.status === "ready" ? "Ready" : "Generating..."}
                </span>
                <Button variant="ghost" size="sm" className="h-7 text-xs">Download</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
