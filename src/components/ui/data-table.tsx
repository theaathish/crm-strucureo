import * as React from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
} from "@tanstack/react-table"
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  toolbar?: React.ReactNode
  pageSize?: number
  className?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  toolbar,
  pageSize = 20,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  })

  const selectedCount = Object.keys(rowSelection).length

  return (
    <div className={cn("space-y-3", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          {searchKey && (
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                onChange={e => table.getColumn(searchKey)?.setFilterValue(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          )}
          {toolbar}
        </div>
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs text-muted-foreground"
            >
              {selectedCount} selected
            </motion.span>
          )}
          <span className="text-xs text-muted-foreground">
            {table.getFilteredRowModel().rows.length} records
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className="bg-muted/30 hover:bg-muted/30">
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    className="h-9 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    {header.isPlaceholder ? null : (
                      header.column.getCanSort() ? (
                        <button
                          className="flex items-center gap-1 hover:text-foreground transition-colors"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getIsSorted() === "asc" ? (
                            <ChevronUp className="size-3" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ChevronDown className="size-3" />
                          ) : (
                            <ChevronsUpDown className="size-3 opacity-40" />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row, i) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "border-b border-border transition-colors hover:bg-muted/30",
                      row.getIsSelected() && "bg-muted/50"
                    )}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className="py-2.5 text-xs">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-sm text-muted-foreground">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </p>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function SelectColumn<TData>(): ColumnDef<TData> {
  return {
    id: "select",
    size: 40,
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={v => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={v => row.toggleSelected(!!v)}
        aria-label="Select row"
        onClick={e => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }
}
