import { cn } from "@/lib/utils"
import type { LeadStatus, DealStage, ProjectStatus, TaskStatus, TaskPriority, PilotStatus } from "@/lib/types"

type StatusVariant = LeadStatus | DealStage | ProjectStatus | TaskStatus | TaskPriority | PilotStatus | "active" | "churned" | "prospect" | "healthy" | "at_risk" | "churning" | "enterprise" | "mid-market" | "smb" | "primary" | "billing" | "technical" | "executive"

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  // Lead status
  new: { label: "New", className: "bg-blue-50 text-blue-700 border-blue-200" },
  contacted: { label: "Contacted", className: "bg-amber-50 text-amber-700 border-amber-200" },
  qualified: { label: "Qualified", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  unqualified: { label: "Unqualified", className: "bg-zinc-100 text-zinc-600 border-zinc-200" },
  converted: { label: "Converted", className: "bg-purple-50 text-purple-700 border-purple-200" },
  // Deal stage
  discovery: { label: "Discovery", className: "bg-blue-50 text-blue-700 border-blue-200" },
  proposal: { label: "Proposal", className: "bg-amber-50 text-amber-700 border-amber-200" },
  negotiation: { label: "Negotiation", className: "bg-orange-50 text-orange-700 border-orange-200" },
  closed_won: { label: "Closed Won", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  closed_lost: { label: "Closed Lost", className: "bg-red-50 text-red-700 border-red-200" },
  // Project status
  planning: { label: "Planning", className: "bg-blue-50 text-blue-700 border-blue-200" },
  active: { label: "Active", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  on_hold: { label: "On Hold", className: "bg-amber-50 text-amber-700 border-amber-200" },
  completed: { label: "Completed", className: "bg-zinc-100 text-zinc-600 border-zinc-200" },
  cancelled: { label: "Cancelled", className: "bg-red-50 text-red-700 border-red-200" },
  // Task
  todo: { label: "To Do", className: "bg-zinc-100 text-zinc-600 border-zinc-200" },
  in_progress: { label: "In Progress", className: "bg-blue-50 text-blue-700 border-blue-200" },
  done: { label: "Done", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  // Priority
  low: { label: "Low", className: "bg-zinc-100 text-zinc-500 border-zinc-200" },
  medium: { label: "Medium", className: "bg-amber-50 text-amber-600 border-amber-200" },
  high: { label: "High", className: "bg-orange-50 text-orange-700 border-orange-200" },
  urgent: { label: "Urgent", className: "bg-red-50 text-red-700 border-red-200" },
  // Account
  churned: { label: "Churned", className: "bg-red-50 text-red-700 border-red-200" },
  prospect: { label: "Prospect", className: "bg-blue-50 text-blue-700 border-blue-200" },
  healthy: { label: "Healthy", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  at_risk: { label: "At Risk", className: "bg-amber-50 text-amber-700 border-amber-200" },
  churning: { label: "Churning", className: "bg-red-50 text-red-700 border-red-200" },
  // Tier
  enterprise: { label: "Enterprise", className: "bg-zinc-900 text-zinc-100 border-zinc-800" },
  "mid-market": { label: "Mid-Market", className: "bg-zinc-100 text-zinc-700 border-zinc-200" },
  smb: { label: "SMB", className: "bg-zinc-50 text-zinc-500 border-zinc-200" },
  // Pilot
  proposed: { label: "Proposed", className: "bg-blue-50 text-blue-700 border-blue-200" },
  approved: { label: "Approved", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  failed: { label: "Failed", className: "bg-red-50 text-red-700 border-red-200" },
  // Contact type
  primary: { label: "Primary", className: "bg-blue-50 text-blue-700 border-blue-200" },
  billing: { label: "Billing", className: "bg-amber-50 text-amber-700 border-amber-200" },
  technical: { label: "Technical", className: "bg-purple-50 text-purple-700 border-purple-200" },
  executive: { label: "Executive", className: "bg-zinc-900 text-zinc-100 border-zinc-800" },
}

interface StatusBadgeProps {
  status: StatusVariant
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: "bg-zinc-100 text-zinc-600 border-zinc-200" }
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border whitespace-nowrap",
      config.className,
      className
    )}>
      {config.label}
    </span>
  )
}
