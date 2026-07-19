import { motion } from "framer-motion"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Plus, Shield } from "lucide-react"
import { DataTable, SelectColumn } from "@/components/ui/data-table"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { User } from "@/lib/types"
import { useUsers } from "@/hooks/use-users"

const ROLE_CONFIG: Record<string, { label: string; className: string }> = {
  owner: { label: "Owner", className: "bg-zinc-900 text-zinc-100 border-zinc-800" },
  growth: { label: "Growth", className: "bg-blue-50 text-blue-700 border-blue-200" },
  rnd: { label: "R&D", className: "bg-purple-50 text-purple-700 border-purple-200" },
  product: { label: "Product", className: "bg-amber-50 text-amber-700 border-amber-200" },
  ai: { label: "AI", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
}

function RoleBadge({ role }: { role: string }) {
  const config = ROLE_CONFIG[role] ?? { label: role, className: "bg-muted text-muted-foreground border-border" }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  )
}

const columns: ColumnDef<User>[] = [
  SelectColumn<User>(),
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <div className="size-7 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center shrink-0">
          {row.original.name.split(" ").map(n => n[0]).join("")}
        </div>
        <div>
          <p className="font-medium text-foreground">{row.original.name}</p>
          <p className="text-[10px] text-muted-foreground">{row.original.email}</p>
        </div>
      </div>
    ),
  },
  { accessorKey: "role", header: "Role", cell: ({ row }) => <RoleBadge role={row.original.role} /> },
  { accessorKey: "department", header: "Department", cell: ({ row }) => <span className="text-muted-foreground">{row.original.department}</span> },
  { accessorKey: "joinedAt", header: "Joined", cell: ({ row }) => <span className="text-muted-foreground">{row.original.joinedAt}</span> },
  { accessorKey: "lastActive", header: "Last Active", cell: ({ row }) => <span className="text-muted-foreground">{row.original.lastActive}</span> },
  {
    id: "actions", size: 40,
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-7"><MoreHorizontal className="size-3.5" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Edit User</DropdownMenuItem>
          <DropdownMenuItem>Change Role</DropdownMenuItem>
          <DropdownMenuItem variant="destructive">Deactivate</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export function UsersPage() {
  const { data: users = [], isLoading, error } = useUsers()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]">
      <PageHeader
        title="Users"
        description="Manage team members and access permissions"
        actions={<Button size="sm" className="h-8 gap-1.5 text-xs"><Plus className="size-3.5" /> Invite User</Button>}
      />
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="size-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Role-based access control is enabled. Users can only access features within their permission scope.</p>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="size-6 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-destructive">Failed to load users. Please try again later.</p>
          </div>
        ) : (
          <DataTable columns={columns} data={users} searchKey="name" searchPlaceholder="Search users..." />
        )}
      </div>
    </motion.div>
  )
}
