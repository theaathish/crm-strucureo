import * as React from "react"
import { motion } from "framer-motion"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Plus, Eye, Pencil, Trash2, Shield, Loader2 } from "lucide-react"
import { DataTable, SelectColumn } from "@/components/ui/data-table"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import type { User, UserRole } from "@/lib/types"
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "@/hooks/use-users"

const ROLE_CONFIG: Record<string, { label: string; className: string }> = {
  owner: { label: "Owner", className: "bg-zinc-900 text-zinc-100 border-zinc-800" },
  growth: { label: "Growth", className: "bg-blue-50 text-blue-700 border-blue-200" },
  rnd: { label: "R&D", className: "bg-purple-50 text-purple-700 border-purple-200" },
  product: { label: "Product", className: "bg-amber-50 text-amber-700 border-amber-200" },
  ai: { label: "AI", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
}

function RoleBadge({ role }: { role: string }) {
  const config = ROLE_CONFIG[role] ?? { label: role, className: "bg-muted text-muted-foreground border-border" }
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${config.className}`}>{config.label}</span>
}

export function UsersPage() {
  const { data: users = [], isLoading, error } = useUsers()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()
  const [detail, setDetail] = React.useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<User | null>(null)
  const [dialog, setDialog] = React.useState<{ open: boolean; mode?: "create" | "edit"; user?: User }>({ open: false })
  const [form, setForm] = React.useState({ name: "", email: "", password: "", role: "growth" as UserRole, department: "" })

  function resetForm() { setForm({ name: "", email: "", password: "", role: "growth" as UserRole, department: "" }) }
  function openEdit(user: User) {
    setForm({ name: user.name, email: user.email, password: "", role: user.role, department: user.department })
    setDialog({ open: true, mode: "edit", user })
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!dialog.open) return
    if (dialog.mode === "create") {
      if (!form.password) return
      createUser.mutate(form, { onSuccess: () => { setDialog({ open: false }); resetForm() } })
    } else {
      const data = form.password ? form : { name: form.name, email: form.email, role: form.role, department: form.department }
      updateUser.mutate({ id: dialog.user!.id, data }, { onSuccess: () => { setDialog({ open: false }); resetForm() } })
    }
  }

  const columns: ColumnDef<User>[] = [
    SelectColumn<User>(),
    { accessorKey: "name", header: "User", cell: ({ row }) => (<div className="flex items-center gap-2.5"><div className="size-7 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center shrink-0">{row.original.name.split(" ").map(n => n[0]).join("")}</div><div><p className="font-medium text-foreground">{row.original.name}</p><p className="text-[10px] text-muted-foreground">{row.original.email}</p></div></div>) },
    { accessorKey: "role", header: "Role", cell: ({ row }) => <RoleBadge role={row.original.role} /> },
    { accessorKey: "department", header: "Department", cell: ({ row }) => <span className="text-muted-foreground">{row.original.department}</span> },
    { accessorKey: "joinedAt", header: "Joined", cell: ({ row }) => { const d = new Date(row.original.joinedAt); return <span className="text-muted-foreground">{d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span> }},
    { accessorKey: "lastActive", header: "Last Active", cell: ({ row }) => { const d = new Date(row.original.lastActive); return <span className="text-muted-foreground">{d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span> }},
    { id: "actions", size: 40, cell: ({ row }) => (<div onClick={e => e.stopPropagation()}><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-7"><MoreHorizontal className="size-3.5" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => setDetail(row.original)}><Eye className="size-3.5 mr-2" />View User</DropdownMenuItem><DropdownMenuItem onClick={() => openEdit(row.original)}><Pencil className="size-3.5 mr-2" />Edit</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(row.original)}><Trash2 className="size-3.5 mr-2" />Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>) },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]">
      <PageHeader title="Users" description="Manage team members and access permissions" actions={<Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => { resetForm(); setDialog({ open: true, mode: "create" }) }}><Plus className="size-3.5" /> Add User</Button>} />
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4"><Shield className="size-4 text-muted-foreground" /><p className="text-sm text-muted-foreground">Role-based access control is enabled. Users can only access features within their permission scope.</p></div>
        {isLoading ? (<div className="flex items-center justify-center py-12"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
        ) : error ? (<div className="flex items-center justify-center py-12"><p className="text-sm text-destructive">Failed to load users. Please try again later.</p></div>
        ) : (<DataTable columns={columns} data={users} searchKey="name" searchPlaceholder="Search users..." onRowClick={row => setDetail(row)} />)}
      </div>

      <Dialog open={dialog.open} onOpenChange={o => { if (!o) { resetForm(); setDialog({ open: false }) }}}>
        <DialogContent>
          <DialogHeader><DialogTitle>{dialog.mode === "create" ? "Add User" : "Edit User"}</DialogTitle><DialogDescription>{dialog.mode === "create" ? "Create a new team member" : "Update user details"}</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><Label>Full Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="John Doe" required /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="john@strucureo.com" required /></div>
              <div><Label>{dialog.mode === "create" ? "Password" : "New Password (optional)"}</Label><Input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder={dialog.mode === "create" ? "Min 6 characters" : "Leave blank to keep current"} required={dialog.mode === "create"} /></div>
              <div><Label>Role</Label><Select value={form.role} onValueChange={v => setForm(p => ({ ...p, role: v as UserRole }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="owner">Owner</SelectItem><SelectItem value="growth">Growth</SelectItem><SelectItem value="rnd">R&amp;D</SelectItem><SelectItem value="product">Product</SelectItem><SelectItem value="ai">AI</SelectItem></SelectContent></Select></div>
              <div><Label>Department</Label><Input value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} placeholder="Sales, Engineering..." /></div>
            </div>
            {createUser.isError && <p className="text-xs text-destructive">{(createUser.error as Error).message || "Failed to create user"}</p>}
            <DialogFooter><Button type="submit" disabled={createUser.isPending || updateUser.isPending || !form.name || !form.email || (dialog.mode === "create" && !form.password)}>{dialog.mode === "create" ? "Create" : "Save"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={o => { if (!o) setDeleteTarget(null) }} title="Delete User" description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`} onConfirm={() => deleteTarget && deleteUser.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })} loading={deleteUser.isPending} />

      <Dialog open={!!detail} onOpenChange={o => { if (!o) setDetail(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{detail?.name}</DialogTitle><DialogDescription>User details</DialogDescription></DialogHeader>
          {detail && (<div className="space-y-3 text-sm"><div className="grid grid-cols-2 gap-3">
            <div><span className="text-muted-foreground">Email</span><p className="font-medium">{detail.email}</p></div>
            <div><span className="text-muted-foreground">Role</span><p><RoleBadge role={detail.role} /></p></div>
            <div><span className="text-muted-foreground">Department</span><p className="font-medium">{detail.department}</p></div>
            <div><span className="text-muted-foreground">Joined</span><p className="font-medium">{new Date(detail.joinedAt).toLocaleDateString()}</p></div>
            <div><span className="text-muted-foreground">Last Active</span><p className="font-medium">{new Date(detail.lastActive).toLocaleDateString()}</p></div>
          </div></div>)}
          <DialogFooter><Button variant="outline" onClick={() => setDetail(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
