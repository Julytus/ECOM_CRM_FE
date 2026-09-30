import { type Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows.length;
  const totalRows = table.getFilteredRowModel().rows.length;

  return (
    <div className="flex flex-col items-center justify-between gap-4 px-2 py-1 sm:flex-row">
      {/* Selection Status */}
      <div className="text-muted-foreground/60 flex-1 text-[11px] font-bold tracking-widest uppercase">
        {selectedRows > 0 ? (
          <span className="text-primary animate-in fade-in slide-in-from-left-2 duration-300">
            Đã chọn {selectedRows} / {totalRows} dòng
          </span>
        ) : (
          <span>Tổng số {totalRows} bản ghi</span>
        )}
      </div>

      <div className="flex flex-col items-center gap-6 sm:flex-row lg:gap-8">
        {/* Rows per page selector */}
        <div className="flex items-center space-x-3">
          <p className="text-muted-foreground text-xs font-semibold tracking-tight">
            Số hàng mỗi trang
          </p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="border-muted-foreground/20 bg-background focus:ring-primary/20 h-9 w-[80px] rounded-full shadow-sm">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent
              side="top"
              className="shadow-foreground/5 rounded-2xl border-none shadow-xl"
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`} className="mx-1 rounded-xl">
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page counter */}
        <div className="text-foreground bg-muted/40 flex min-w-[100px] items-center justify-center rounded-full px-4 py-2 text-xs font-bold tracking-tight">
          Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center space-x-1.5">
          <Button
            variant="outline"
            className="border-muted-foreground/20 hover:bg-primary hover:text-primary-foreground hidden h-9 w-9 rounded-full p-0 transition-all lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Trang đầu</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="border-muted-foreground/20 hover:bg-primary hover:text-primary-foreground h-9 w-9 rounded-full p-0 transition-all"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Trang trước</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="border-muted-foreground/20 hover:bg-primary hover:text-primary-foreground h-9 w-9 rounded-full p-0 transition-all"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Trang sau</span>
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="border-muted-foreground/20 hover:bg-primary hover:text-primary-foreground hidden h-9 w-9 rounded-full p-0 transition-all lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Trang cuối</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
