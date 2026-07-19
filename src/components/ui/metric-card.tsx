import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  trend?: "up" | "down" | "neutral"
  prefix?: string
  suffix?: string
  danger?: boolean
  subtitle?: string
  className?: string
  loading?: boolean
}

function formatValue(value: string | number, prefix?: string, suffix?: string) {
  if (typeof value === "number") {
    const formatted = value >= 1_000_000
      ? `${(value / 1_000_000).toFixed(1)}M`
      : value >= 1_000
      ? `${(value / 1_000).toFixed(1)}K`
      : value.toLocaleString()
    return `${prefix ?? ""}${formatted}${suffix ?? ""}`
  }
  return `${prefix ?? ""}${value}${suffix ?? ""}`
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  trend = "neutral",
  prefix,
  suffix,
  danger,
  subtitle,
  className,
  loading,
}: MetricCardProps) {
  const isPositive = trend === "up"
  const isNegative = trend === "down"

  if (loading) {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-5", className)}>
        <div className="h-4 w-24 rounded bg-muted animate-pulse mb-3" />
        <div className="h-8 w-32 rounded bg-muted animate-pulse mb-2" />
        <div className="h-3 w-20 rounded bg-muted animate-pulse" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "rounded-xl border border-border bg-card p-5 hover:border-foreground/20 transition-colors",
        danger && "border-destructive/20 bg-destructive/[0.02]",
        className
      )}
    >
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
        {title}
      </p>
      <p className={cn(
        "text-2xl font-semibold tracking-tight",
        danger && "text-destructive"
      )}>
        {formatValue(value, prefix, suffix)}
      </p>
      {subtitle && (
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      )}
      {change !== undefined && (
        <div className={cn(
          "mt-2 flex items-center gap-1 text-xs font-medium",
          isPositive && !danger && "text-emerald-600",
          isNegative && "text-destructive",
          !isPositive && !isNegative && "text-muted-foreground"
        )}>
          {isPositive && <TrendingUp className="size-3" />}
          {isNegative && <TrendingDown className="size-3" />}
          {!isPositive && !isNegative && <Minus className="size-3" />}
          <span>
            {change > 0 ? "+" : ""}{change}% {changeLabel ?? "vs last month"}
          </span>
        </div>
      )}
    </motion.div>
  )
}
