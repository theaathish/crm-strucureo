import { motion } from "framer-motion"
import { Bell, CheckCircle2, AlertTriangle, Info, XCircle, Check } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/store"
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/use-notifications"
import { cn } from "@/lib/utils"

const ICON_MAP: Record<string, React.ReactNode> = {
  success: <CheckCircle2 className="size-4 text-emerald-500" />,
  error: <XCircle className="size-4 text-destructive" />,
  warning: <AlertTriangle className="size-4 text-amber-500" />,
  info: <Info className="size-4 text-blue-500" />,
}

export function NotificationsPage() {
  const { setCurrentPage } = useApp()
  const { data: notifications = [], isLoading, error } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()
  const unread = notifications.filter(n => !n.read).length

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]">
      <PageHeader
        title="Notifications"
        description={`${unread} unread notification${unread !== 1 ? "s" : ""}`}
        actions={
          unread > 0 && (
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => markAll.mutate()}>
              <Check className="size-3.5" /> Mark all read
            </Button>
          )
        }
      />
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="size-8 text-muted-foreground mb-3 animate-pulse" />
            <p className="text-sm font-medium">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <XCircle className="size-8 text-destructive mb-3" />
            <p className="text-sm font-medium">Failed to load notifications</p>
            <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="size-8 text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No notifications</p>
            <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((notification, idx) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={cn(
                "flex items-start gap-4 p-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer",
                !notification.read && "bg-muted/20"
              )}
              onClick={() => {
                markRead.mutate(notification.id)
                if (notification.link) setCurrentPage(notification.link.replace("/", ""))
              }}
            >
              <div className="shrink-0 mt-0.5">
                {ICON_MAP[notification.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{notification.title}</p>
                  {!notification.read && (
                    <span className="size-1.5 rounded-full bg-primary shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {new Date(notification.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] shrink-0"
                  onClick={e => { e.stopPropagation(); markRead.mutate(notification.id) }}
                >
                  Mark read
                </Button>
              )}
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}
