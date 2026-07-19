import * as React from "react"
import { motion } from "framer-motion"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Plus, Shield, Loader2 } from "lucide-react"
import { DataTable, SelectColumn } from "@/components/ui/data-table"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { User } from "@/lib/types"
import { useUsers } from "@/hooks/use-users"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

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
  { accessorKey: "joinedAt", header: "Joined", cell: ({ row }) => {
    const d = new Date(row.original.joinedAt)
    return <span className="text-muted-foreground">{d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
  }},
  { accessorKey: "lastActive", header: "Last Active", cell: ({ row }) => {
    const d = new Date(row.original.lastActive)
    return <span className="text-muted-foreground">{d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
  }},
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
  const queryClient = useQueryClient()
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [formError, setFormError] = React.useState("")
  const [form, setForm] = React.useState({ name: "", email: "", password: "", role: "growth", department: "" })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return
    setSaving(true)
    setFormError("")

    const { error } = await api.createUser(form)
    if (error) {
      setFormError(error)
      setSaving(false)
      return
    }
    queryClient.invalidateQueries({ queryKey: ["users"] })
    setOpen(false)
    setForm({ name: "", email: "", password: "", role: "growth", department: "" })
    setSaving(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]">
      <PageHeader
        title="Users"
        description="Manage team members and access permissions"
        actions={
          <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setOpen(true)}>
            <Plus className="size-3.5" /> Add User
          </Button>
        }
      />
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="size-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Role-based access control is enabled. Users can only access features within their permission scope.</p>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-destructive">Failed to load users. Please try again later.</p>
          </div>
        ) : (
          <DataTable columns={columns} data={users} searchKey="name" searchPlaceholder="Search users..." />
        )}
      </div>

      {/* Add User Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium text-foreground block mb-1.5">Full Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="john@strucureo.com"
                  className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
                >
                  <option value="owner">Owner</option>
                  <option value="growth">Growth</option>
                  <option value="rnd">R&D</option>
                  <option value="product">Product</option>
                  <option value="ai">AI</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Department</label>
                <input
                  value={form.department}
                  onChange={e => setForm({ ...form, department: e.target.value })}
                  placeholder="Sales, Engineering..."
                  className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
                />
              </div>
            </div>
            {formError && (
              <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg p-2.5">{formError}</p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" className="h-8 text-xs gap-1.5" disabled={saving || !form.name || !form.email || !form.password}>
                {saving && <Loader2 className="size-3.5 animate-spin" />}
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
