import { motion } from "framer-motion"
import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Plus, Eye, Pencil, Trash2 } from "lucide-react"
import { DataTable, SelectColumn } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import type { Contact } from "@/lib/types"
import { useContacts, useCreateContact, useUpdateContact, useDeleteContact } from "@/hooks/use-contacts"

export function ContactsPage() {
  const { data: contacts = [], isLoading, error } = useContacts()
  const createContact = useCreateContact()
  const updateContact = useUpdateContact()
  const deleteContact = useDeleteContact()
  const [detail, setDetail] = React.useState<Contact | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<Contact | null>(null)
  const [dialog, setDialog] = React.useState<{ open: boolean; mode?: "create" | "edit"; contact?: Contact }>({ open: false })
  const [form, setForm] = React.useState({ name: "", email: "", phone: "", title: "", accountId: "", accountName: "", type: "primary" as Contact["type"] })

  function resetForm() { setForm({ name: "", email: "", phone: "", title: "", accountId: "", accountName: "", type: "primary" }) }
  function openEdit(contact: Contact) {
    setForm({ name: contact.name, email: contact.email, phone: contact.phone, title: contact.title, accountId: contact.accountId, accountName: contact.accountName, type: contact.type })
    setDialog({ open: true, mode: "edit", contact })
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!dialog.open) return
    if (dialog.mode === "create") {
      createContact.mutate(form, { onSuccess: () => setDialog({ open: false }) })
    } else {
      updateContact.mutate({ id: dialog.contact!.id, data: form }, { onSuccess: () => setDialog({ open: false }) })
    }
  }

  const columns: ColumnDef<Contact>[] = [
    SelectColumn<Contact>(),
    { accessorKey: "name", header: "Contact", cell: ({ row }) => (<div className="flex items-center gap-2.5"><div className="size-7 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center shrink-0">{row.original.name.split(" ").map(n => n[0]).join("")}</div><div><p className="font-medium text-foreground">{row.original.name}</p><p className="text-[10px] text-muted-foreground">{row.original.email}</p></div></div>) },
    { accessorKey: "title", header: "Title", cell: ({ row }) => <span className="text-muted-foreground">{row.original.title}</span> },
    { accessorKey: "accountName", header: "Account", cell: ({ row }) => (<div className="flex items-center gap-1.5"><div className="size-5 rounded bg-muted text-foreground text-[9px] font-bold flex items-center justify-center">{row.original.accountName.slice(0, 2).toUpperCase()}</div><span>{row.original.accountName}</span></div>) },
    { accessorKey: "type", header: "Type", cell: ({ row }) => <StatusBadge status={row.original.type} /> },
    { accessorKey: "phone", header: "Phone", cell: ({ row }) => <span className="text-muted-foreground">{row.original.phone}</span> },
    { accessorKey: "lastContact", header: "Last Contact", cell: ({ row }) => <span className="text-muted-foreground">{row.original.lastContact}</span> },
    { id: "actions", size: 40, cell: ({ row }) => (<div onClick={e => e.stopPropagation()}><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-7"><MoreHorizontal className="size-3.5" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => setDetail(row.original)}><Eye className="size-3.5 mr-2" />View Contact</DropdownMenuItem><DropdownMenuItem onClick={() => openEdit(row.original)}><Pencil className="size-3.5 mr-2" />Edit</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(row.original)}><Trash2 className="size-3.5 mr-2" />Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>) },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]">
      <PageHeader title="Contacts" description="All contacts across accounts" actions={<Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => { resetForm(); setDialog({ open: true, mode: "create" }) }}><Plus className="size-3.5" /> Add Contact</Button>} />
      <div className="rounded-xl border border-border bg-card p-5">
        {isLoading ? (<div className="flex items-center justify-center py-12 text-muted-foreground text-sm">Loading contacts...</div>
        ) : error ? (<div className="flex items-center justify-center py-12 text-destructive text-sm">Failed to load contacts. Please try again.</div>
        ) : (<DataTable columns={columns} data={contacts} searchKey="name" searchPlaceholder="Search contacts..." onRowClick={row => setDetail(row)} />)}
      </div>

      <Dialog open={dialog.open} onOpenChange={o => { if (!o) setDialog({ open: false }) }}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmit}>
            <DialogHeader><DialogTitle>{dialog.mode === "create" ? "Add Contact" : "Edit Contact"}</DialogTitle><DialogDescription>{dialog.mode === "create" ? "Create a new contact" : "Update contact details"}</DialogDescription></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
                <div className="grid gap-2"><Label>Title</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
                <div className="grid gap-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Account Name</Label><Input value={form.accountName} onChange={e => setForm(p => ({ ...p, accountName: e.target.value }))} /></div>
                <div className="grid gap-2"><Label>Type</Label><Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v as Contact["type"] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="primary">Primary</SelectItem><SelectItem value="billing">Billing</SelectItem><SelectItem value="technical">Technical</SelectItem><SelectItem value="executive">Executive</SelectItem></SelectContent></Select></div>
              </div>
            </div>
            <DialogFooter><Button type="submit" disabled={createContact.isPending || updateContact.isPending}>{dialog.mode === "create" ? "Create" : "Save"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={o => { if (!o) setDeleteTarget(null) }} title="Delete Contact" description={`Are you sure you want to delete "${deleteTarget?.name}"?`} onConfirm={() => deleteTarget && deleteContact.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })} loading={deleteContact.isPending} />

      <Dialog open={!!detail} onOpenChange={o => { if (!o) setDetail(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{detail?.name}</DialogTitle><DialogDescription>Contact details</DialogDescription></DialogHeader>
          {detail && (<div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-muted-foreground">Email</span><p className="font-medium">{detail.email}</p></div>
              <div><span className="text-muted-foreground">Phone</span><p className="font-medium">{detail.phone}</p></div>
              <div><span className="text-muted-foreground">Title</span><p className="font-medium">{detail.title}</p></div>
              <div><span className="text-muted-foreground">Account</span><p className="font-medium">{detail.accountName}</p></div>
              <div><span className="text-muted-foreground">Type</span><p><StatusBadge status={detail.type} /></p></div>
              <div><span className="text-muted-foreground">Last Contact</span><p className="font-medium">{detail.lastContact}</p></div>
            </div>
            <div className="pt-2 border-t"><span className="text-muted-foreground">Created</span><p className="font-medium">{new Date(detail.createdAt).toLocaleDateString()}</p></div>
          </div>)}
          <DialogFooter><Button variant="outline" onClick={() => setDetail(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
