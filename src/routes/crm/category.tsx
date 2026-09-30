"use client"

import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LayoutGrid,
  Loader2,
  MoreVertical,
  Plus,
  RefreshCcw,
} from "lucide-react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { toast } from "sonner"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

import {
  createInfiniteCategoriesQueryOptions,
  upsertCategoryMutationOptions,
  deleteCategoryMutationOptions,
} from "@/lib/tanstack/options/category"
import type { CategoryDTO } from "@/lib/types/category"

export const Route = createFileRoute("/crm/category")({
  component: AdminCategories,
})

// Category detail drawer
function CategoryDetailDrawer({
  item,
  onUpdate,
}: {
  item: CategoryDTO
  onUpdate: (values: Partial<CategoryDTO>) => void
}) {
  const isMobile = useIsMobile()
  const [name, setName] = React.useState(item.name)
  const [description, setDescription] = React.useState(item.description || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate({ id: item.id, name, description })
  }

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="w-fit px-0 text-left text-foreground">
          {item.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Chi tiết danh mục</DrawerTitle>
          <DrawerDescription>
            Xem và chỉnh sửa thông tin danh mục
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="name">Tên danh mục</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên danh mục"
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả"
                rows={4}
              />
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button onClick={handleSubmit}>Lưu thay đổi</Button>
          <DrawerClose asChild>
            <Button variant="outline">Đóng</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}


function AdminCategories() {
  const queryClient = useQueryClient()
  const [data, setData] = React.useState<CategoryDTO[]>([])
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  // Query
  const { data: queryData, refetch, isFetching } = useInfiniteQuery(
    createInfiniteCategoriesQueryOptions({
      opts: {
        paging: {
          limit: pagination.pageSize,
          page: pagination.pageIndex + 1,
        },
      },
    })
  )

  // Update local data when query data changes
  React.useEffect(() => {
    if (queryData?.pages) {
      const categories = queryData.pages.flatMap((p) => p.items)
      setData(categories)
    }
  }, [queryData])

  const total = React.useMemo(() => queryData?.pages[0]?.total ?? 0, [queryData])

  // Mutations
  const upsertMutation = useMutation({
    ...upsertCategoryMutationOptions(),
    onSuccess: () => {
      toast.success("Cập nhật thành công")
      refetch()
    },
    onError: () => {
      toast.error("Có lỗi xảy ra")
    },
  })

  const deleteMutation = useMutation({
    ...deleteCategoryMutationOptions(),
    onSuccess: () => {
      toast.success("Xóa thành công")
      refetch()
    },
    onError: () => {
      toast.error("Có lỗi xảy ra")
    },
  })

  const handleUpdate = (values: Partial<CategoryDTO>) => {
    upsertMutation.mutate(values as any)
  }

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc muốn xóa danh mục này?")) {
      deleteMutation.mutate(id)
    }
  }

  // Define columns
  const columns = React.useMemo<ColumnDef<CategoryDTO>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: "Tên danh mục",
        cell: ({ row }) => {
          return <CategoryDetailDrawer item={row.original} onUpdate={handleUpdate} />
        },
        enableHiding: false,
      },
      {
        accessorKey: "description",
        header: "Mô tả",
        cell: ({ row }) => (
          <div className="max-w-md truncate text-muted-foreground">
            {row.original.description || "—"}
          </div>
        ),
      },
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
          <Badge variant="outline" className="font-mono">
            {row.original.id}
          </Badge>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                size="icon"
              >
                <MoreVertical className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
              <DropdownMenuItem>Sao chép</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(row.original.id)}
              >
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [handleUpdate, handleDelete]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / pagination.pageSize),
  })

  return (
    <div className="container mx-auto flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý danh mục</h1>
          <p className="text-sm text-muted-foreground">
            Tạo, chỉnh sửa và sắp xếp các danh mục sản phẩm
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCcw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
            <span className="hidden lg:inline">Làm mới</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <LayoutGrid className="size-4" />
                <span className="hidden lg:inline">Tùy chỉnh cột</span>
                <span className="lg:hidden">Cột</span>
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" && column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm">
            <Plus className="size-4" />
            <span className="hidden lg:inline">Thêm danh mục</span>
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Không có dữ liệu.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-4">
        <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} trên{" "}
          {table.getFilteredRowModel().rows.length} hàng được chọn.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Số hàng mỗi trang
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Trang {table.getState().pagination.pageIndex + 1} trên {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {isFetching && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center rounded-md border bg-background p-2 text-xs shadow-lg">
          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          Đang tải dữ liệu...
        </div>
      )}
    </div>
  )
}
