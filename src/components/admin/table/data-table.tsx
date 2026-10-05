import { flexRender, type Table as TanStackTable } from "@tanstack/react-table";
import { DataTableViewOptions } from "@/components/admin/table/column-toggle";
import { DataTablePagination } from "@/components/admin/table/pagination";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react"; // Added for the pill search look

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> {
  table: TanStackTable<TData>;
  filterable?: boolean;
  filterKey?: string;
  filterKeyPlaceholder?: string;
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
}

export function DataTable<TData>({
  table,
  filterable = true,
  filterKey = "name", // Default to "name" to match Product columns
  filterKeyPlaceholder,
  toolbarLeft,
  toolbarRight
}: DataTableProps<TData>) {
  return (
    <div className="flex h-full flex-col space-y-6">
      {/* Premium Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          {filterable && (
            <div className="relative w-full max-w-sm">
              <Search className="text-muted-foreground/60 absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder={filterKeyPlaceholder || `Tìm kiếm...`}
                value={(table.getColumn(filterKey)?.getFilterValue() as string) ?? ""}
                onChange={(e) => table.getColumn(filterKey)?.setFilterValue(e.target.value)}
                className={cn(
                  "border-muted-foreground/20 bg-background h-11 rounded-full pr-4 pl-10",
                  "focus-visible:ring-primary/20 focus-visible:border-primary shadow-sm transition-all"
                )}
              />
            </div>
          )}
          {toolbarLeft}
        </div>

        <div className="flex items-center gap-3">
          {toolbarRight}
          {/* <DataTableViewOptions table={table} /> */}
        </div>
      </div>

      {/* Modern Table Container */}
      <div className="flex-1 overflow-hidden">
        <div className="rounded-2xl border-none">
          {" "}
          {/* Removing the outer border for a cleaner look */}
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="border-none hover:bg-transparent">
                  {hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="bg-muted/40 text-muted-foreground/80 h-12 text-xs font-bold tracking-wider uppercase first:rounded-l-xl last:rounded-r-xl"
                    >
                      {!header.isPlaceholder &&
                        flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-muted/20 hover:bg-muted/10 data-[state=selected]:bg-primary/5 border-b transition-colors last:border-none"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="whitespace-nowrap"
                        style={{
                          width: cell.column.getSize(),
                          minWidth: cell.column.getSize()
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length} className="h-32 text-center">
                    <div className="text-muted-foreground flex flex-col items-center justify-center gap-2">
                      <p className="text-sm font-medium">Không tìm thấy dữ liệu phù hợp.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Bar */}
      <div className="border-muted/20 border-t pt-2">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
