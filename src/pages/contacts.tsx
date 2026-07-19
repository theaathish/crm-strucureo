import { motion } from "framer-motion"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Plus } from "lucide-react"
import { DataTable, SelectColumn } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import type { Contact } from "@/lib/types"
import { useContacts } from "@/hooks/use-contacts"

const columns: ColumnDef<Contact>[] = [
  SelectColumn<Contact>(),
  {
    accessorKey: "name",
    header: "Contact",
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
  { accessorKey: "title", header: "Title", cell: ({ row }) => <span className="text-muted-foreground">{row.original.title}</span> },
  {
    accessorKey: "accountName",
    header: "Account",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <div className="size-5 rounded bg-muted text-foreground text-[9px] font-bold flex items-center justify-center">
          {row.original.accountName.slice(0, 2).toUpperCase()}
        </div>
        <span>{row.original.accountName}</span>
      </div>
    ),
  },
  { accessorKey: "type", header: "Type", cell: ({ row }) => <StatusBadge status={row.original.type} /> },
  { accessorKey: "phone", header: "Phone", cell: ({ row }) => <span className="text-muted-foreground">{row.original.phone}</span> },
  { accessorKey: "lastContact", header: "Last Contact", cell: ({ row }) => <span className="text-muted-foreground">{row.original.lastContact}</span> },
  {
    id: "actions", size: 40,
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-7"><MoreHorizontal className="size-3.5" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View Contact</DropdownMenuItem>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export function ContactsPage() {
  const { data: contacts = [], isLoading, error } = useContacts()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-[1600px]">
      <PageHeader
        title="Contacts"
        description="All contacts across accounts"
        actions={<Button size="sm" className="h-8 gap-1.5 text-xs"><Plus className="size-3.5" /> Add Contact</Button>}
      />
      <div className="rounded-xl border border-border bg-card p-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">Loading contacts...</div>
        ) : error ? (
          <div className="flex items-center justify-center py-12 text-destructive text-sm">
            Failed to load contacts. Please try again.
          </div>
        ) : (
          <DataTable columns={columns} data={contacts} searchKey="name" searchPlaceholder="Search contacts..." />
        )}
      </div>
    </motion.div>
  )
}
