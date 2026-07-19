import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Search, Users, Clock, Filter } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Badge } from "@/components/ui/badge"
import type { Activity } from "@/lib/types"

const TYPE_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  call: "default",
  email: "secondary",
  meeting: "outline",
  note: "default",
  deal: "destructive",
  task: "secondary",
}

export function UserLogsPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  useEffect(() => {
    setIsLoading(true)
    fetch("/api/activities")
      .then(r => { if (!r.ok) throw new Error("Failed to fetch"); return r.json() })
      .then(data => { setActivities(data); setIsLoading(false) })
      .catch(err => { setError(err.message); setIsLoading(false) })
  }, [])

  const types = useMemo(() => {
    const s = new Set(activities.map(a => a.type))
    return Array.from(s).sort()
  }, [activities])

  const filtered = useMemo(() => {
    return activities.filter(a => {
      if (typeFilter !== "all" && a.type !== typeFilter) return false
      if (search) {
        const q = search.toLowerCase()
        if (!a.description.toLowerCase().includes(q) && !a.relatedTo.name.toLowerCase().includes(q)) return false
      }
      if (dateFrom && new Date(a.createdAt) < new Date(dateFrom)) return false
      if (dateTo) {
        const end = new Date(dateTo)
        end.setHours(23, 59, 59, 999)
        if (new Date(a.createdAt) > end) return false
      }
      return true
    })
  }, [activities, typeFilter, search, dateFrom, dateTo])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]">
      <PageHeader title="Activity Log" description="Track all user actions across the workspace" />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search activity..."
            className="pl-8 h-9 text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="size-4 text-muted-foreground" />
          <NativeSelect size="sm" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <NativeSelectOption value="all">All types</NativeSelectOption>
            {types.map(t => (
              <NativeSelectOption key={t} value={t}>{t}</NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="size-4 text-muted-foreground" />
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="h-8 rounded-md border border-input bg-transparent px-2 text-xs shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="h-8 rounded-md border border-input bg-transparent px-2 text-xs shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="size-8 text-muted-foreground mb-3 animate-pulse" />
            <p className="text-sm font-medium">Loading activity log...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="size-8 text-destructive mb-3" />
            <p className="text-sm font-medium">Failed to load activity log</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="size-8 text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No activity found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search || typeFilter !== "all" || dateFrom || dateTo
                ? "Try adjusting your filters"
                : "No activities have been recorded yet"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((activity, idx) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
                className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="shrink-0 mt-0.5">
                  <Users className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{activity.userName}</span>
                    <Badge variant={TYPE_COLORS[activity.type] ?? "outline"} className="capitalize text-[10px] px-1.5 py-0">
                      {activity.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{activity.relatedTo.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(activity.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
