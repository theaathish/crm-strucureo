import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Terminal, Clock, AlertCircle } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { Activity } from "@/lib/types"

const TYPE_ICONS: Record<string, React.ReactNode> = {
  call: <Terminal className="size-4 text-blue-500" />,
  email: <Terminal className="size-4 text-emerald-500" />,
  meeting: <Terminal className="size-4 text-amber-500" />,
  note: <Terminal className="size-4 text-muted-foreground" />,
  deal: <Terminal className="size-4 text-purple-500" />,
  task: <Terminal className="size-4 text-cyan-500" />,
}

function isMcpRelated(activity: Activity): boolean {
  const entityType = activity.relatedTo?.type ?? ""
  const desc = activity.description ?? ""
  return (
    entityType.toLowerCase().includes("mcp") ||
    entityType.toLowerCase().includes("tool") ||
    desc.toLowerCase().includes("mcp") ||
    desc.toLowerCase().includes("tool")
  )
}

export function McpLogsPage() {
  const [logs, setLogs] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    setLoading(true)
    fetch("/api/activities")
      .then<Activity[]>(res => {
        if (!res.ok) throw new Error("Failed to fetch activities")
        return res.json()
      })
      .then(data => {
        setLogs(data.filter(isMcpRelated))
        setLoading(false)
      })
      .catch(err => {
        setError(err)
        setLoading(false)
      })
  }, [])

  const filtered = logs.filter(a =>
    !search ||
    a.description.toLowerCase().includes(search.toLowerCase()) ||
    a.type.toLowerCase().includes(search.toLowerCase()) ||
    a.userName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]">
      <PageHeader title="MCP Logs" description="Model Context Protocol tool call history" />

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            className="pl-8 h-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Terminal className="size-8 text-muted-foreground mb-3 animate-pulse" />
            <p className="text-sm font-medium">Loading MCP logs...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="size-8 text-destructive mb-3" />
            <p className="text-sm font-medium">Failed to load MCP logs</p>
            <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Terminal className="size-8 text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No MCP logs found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search ? "Try a different search term" : "MCP tool calls will appear here"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((log, idx) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={cn(
                  "flex items-start gap-4 p-4 last:border-0 hover:bg-muted/30 transition-colors"
                )}
              >
                <div className="shrink-0 mt-0.5">
                  {TYPE_ICONS[log.type] ?? <Terminal className="size-4 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{log.type}</span>
                    {log.userName && (
                      <span className="text-xs text-muted-foreground">by {log.userName}</span>
                    )}
                  </div>
                  <p className="text-sm text-foreground mt-0.5">{log.description}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="size-3" />
                    {new Date(log.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
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
