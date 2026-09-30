import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  useReactTable,
  type SortingState,
  type PaginationState,
  type ColumnFiltersState
} from "@tanstack/react-table";

import { DataTable } from "@/components/admin/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCcw, Loader2, Search, Plus } from "lucide-react";

import {
  createInfiniteCategoriesQueryOptions,
  upsertCategoryMutationOptions,
  deleteCategoryMutationOptions
} from "@/lib/tanstack/options/category";
import { createCategoryColumns } from "@/components/admin/category/columns";
import { CategoryFormSheet } from "@/components/admin/category/category-sheet";
import type { CategoryDTO } from "@/lib/types/category";

export const Route = createFileRoute("/admin/category")({
  component: AdminCategories
});

function AdminCategories() {
  // Table State
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  });

  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryDTO | null>(null);
  const [openForm, setOpenForm] = useState(false);

  // Query
  const { data, refetch, isFetching, isFetchingNextPage } = useInfiniteQuery(
    createInfiniteCategoriesQueryOptions({
      opts: {
        keyword: keyword || undefined,
        paging: {
          limit: pagination.pageSize,
          page: pagination.pageIndex + 1
        }
      }
    })
  );

  const categories = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);
  const total = useMemo(() => data?.pages[0]?.total ?? 0, [data]);

  // Mutations
  const upsertMutation = useMutation({ ...upsertCategoryMutationOptions() });
  const deleteMutation = useMutation({ ...deleteCategoryMutationOptions() });

  const columns = useMemo(
    () =>
      createCategoryColumns({
        onEdit: (category) => {
          setSelectedCategory(category);
          setOpenForm(true);
        },
        onDelete: (id) => deleteMutation.mutate(id)
      }),
    []
  );

  const table = useReactTable({
    data: categories,
    columns,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.ceil(total / pagination.pageSize),
    state: { pagination, sorting, columnFilters },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <div className="container mx-auto space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý danh mục</h1>
          <p className="text-muted-foreground text-sm">
            Tạo, chỉnh sửa và sắp xếp các danh mục sản phẩm.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setSelectedCategory(null);
            setOpenForm(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm danh mục
        </Button>
      </div>

      <DataTable
        table={table}
        filterable={false}
        toolbarLeft={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="text-muted-foreground absolute mt-2.5 ml-2 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm danh mục..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="h-8 w-[250px] pl-8"
              />
            </div>
          </div>
        }
        toolbarRight={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCcw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Làm mới
            </Button>
          </div>
        }
      />

      <CategoryFormSheet
        open={openForm}
        category={selectedCategory}
        onOpenChange={setOpenForm}
        onSubmit={(values) =>
          upsertMutation.mutate(values, { onSuccess: () => setOpenForm(false) })
        }
      />

      {isFetching && !isFetchingNextPage && (
        <div className="bg-background fixed right-4 bottom-4 z-50 flex items-center rounded-md border p-2 text-xs shadow-lg">
          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          Đang tải dữ liệu...
        </div>
      )}
    </div>
  );
}
