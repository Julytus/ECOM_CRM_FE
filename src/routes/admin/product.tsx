import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type SortingState,
  type PaginationState,
  type ColumnFiltersState
} from "@tanstack/react-table";

import { DataTable } from "@/components/admin/table/data-table";
import {
  createInfiniteProductDetailsQueryOptions,
  deleteProductsMutationOptions
} from "@/lib/tanstack/options/product";
import { productSheetOpenAtom, selectedProductIdAtom } from "@/components/admin/product/atoms";
import { createProductColumns } from "@/components/admin/product/columns";
import { ProductSheet } from "@/components/admin/product/product-sheet";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";

export const Route = createFileRoute("/admin/product")({
  component: AdminProducts
});

function AdminProducts() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  });

  const [, setProductId] = useAtom(selectedProductIdAtom);
  const [, setOpen] = useAtom(productSheetOpenAtom);

  const filterValue = (columnFilters.find((f) => f.id === "filter")?.value as string) ?? "";
  const [debouncedFilter] = useDebounceValue(filterValue, 300);

  const { data, fetchNextPage, isFetching, isFetchingNextPage } = useInfiniteQuery(
    createInfiniteProductDetailsQueryOptions({
      opts: {
        keyword: debouncedFilter,
        paging: { limit: pagination.pageSize, page: pagination.pageIndex + 1 }
      }
    })
  );

  const products = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const total = useMemo(() => data?.pages[0]?.total ?? 0, [data]);

  const deleteManyMutation = useMutation(deleteProductsMutationOptions());

  const columns = useMemo(
    () =>
      createProductColumns({
        onEdit: (id) => {
          setProductId(id);
          setOpen(true);
        }
      }),
    [setProductId, setOpen]
  );

  const table = useReactTable({
    data: products,
    columns,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.ceil(total / pagination.pageSize),
    state: { pagination, sorting, columnFilters },
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <div className="container mx-auto space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý sản phẩm</h1>
          <p className="text-muted-foreground text-sm">Quản lý, tạo mới, chỉnh sửa sản phẩm</p>
        </div>
      </div>
      <DataTable
        table={table}
        filterKey="filter"
        toolbarRight={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={table.getSelectedRowModel().rows.length === 0}
              onClick={() => {
                const ids = table
                  .getSelectedRowModel()
                  .rows.map((row) => row.original.id as number);

                deleteManyMutation.mutate(ids);
              }}
            >
              <Trash className="mr-2 h-4 w-4" />
              Xóa mục đã chọn
            </Button>

            <Button
              size="sm"
              onClick={() => {
                setProductId(null);
                setOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Tạo mới
            </Button>
          </div>
        }
      />
      <ProductSheet />
    </div>
  );
}
