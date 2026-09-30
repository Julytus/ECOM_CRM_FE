"use client";

import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { MoreVertical } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { DataTableAdvanced } from "@/components/admin/table/data-table-advanced";

import {
  createInfiniteProductDetailsQueryOptions,
  deleteProductsMutationOptions
} from "@/lib/tanstack/options/product";
import { productSheetOpenAtom, selectedProductIdAtom } from "@/components/admin/product/atoms";
import { ProductSheet } from "@/components/admin/product/product-sheet";
import type { ProductDetailsDTO } from "@/lib/types/product";

export const Route = createFileRoute("/crm/product")({
  component: AdminProducts
});

function AdminProducts() {
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10
  });

  const [productId, setProductId] = useAtom(selectedProductIdAtom);
  const [open, setOpen] = useAtom(productSheetOpenAtom);

  // Query
  const {
    data: queryData,
    refetch,
    isFetching
  } = useInfiniteQuery(
    createInfiniteProductDetailsQueryOptions({
      opts: {
        paging: {
          limit: pagination.pageSize,
          page: pagination.pageIndex + 1
        }
      }
    })
  );

  const products = React.useMemo(() => queryData?.pages.flatMap((p) => p.items) ?? [], [queryData]);
  const total = React.useMemo(() => queryData?.pages[0]?.total ?? 0, [queryData]);

  // Mutations
  const deleteManyMutation = useMutation({
    ...deleteProductsMutationOptions(),
    onSuccess: () => {
      toast.success("Xóa thành công");
      refetch();
    },
    onError: () => {
      toast.error("Có lỗi xảy ra");
    }
  });

  const handleEdit = (id: number) => {
    setProductId(id);
    setOpen(true);
  };

  const handleDeleteSelected = (ids: number[]) => {
    if (confirm(`Bạn có chắc muốn xóa ${ids.length} sản phẩm đã chọn?`)) {
      deleteManyMutation.mutate(ids);
    }
  };

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPagination({ pageIndex, pageSize });
  };

  const handleAdd = () => {
    setProductId(null);
    setOpen(true);
  };

  // Define columns
  const columns = React.useMemo<ColumnDef<ProductDetailsDTO>[]>(
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
        enableHiding: false
      },
      {
        accessorKey: "image",
        header: "Ảnh",
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            {row.original.thumbnail || row.original.image ? (
              <img
                src={row.original.thumbnail || row.original.image || ""}
                alt={row.original.name}
                className="h-10 w-10 rounded object-cover"
              />
            ) : (
              <div className="bg-muted h-10 w-10 rounded" />
            )}
          </div>
        ),
        enableHiding: false
      },
      {
        accessorKey: "name",
        header: "Tên sản phẩm",
        cell: ({ row }) => (
          <Button
            variant="link"
            className="text-foreground w-fit px-0 text-left"
            onClick={() => handleEdit(row.original.id)}
          >
            {row.original.name}
          </Button>
        ),
        enableHiding: false
      },
      {
        accessorKey: "categoryName",
        header: "Danh mục",
        cell: ({ row }) => (
          <div className="text-muted-foreground">{row.original.categoryName || "—"}</div>
        )
      },
      {
        accessorKey: "minPrice",
        header: "Giá",
        cell: ({ row }) => {
          const { minPrice, maxPrice } = row.original;
          if (minPrice === maxPrice) {
            return <div className="font-medium">{minPrice.toLocaleString()}₫</div>;
          }
          return (
            <div className="font-medium">
              {minPrice.toLocaleString()}₫ - {maxPrice.toLocaleString()}₫
            </div>
          );
        }
      },
      {
        accessorKey: "active",
        header: "Trạng thái",
        cell: ({ row }) => (
          <Badge variant={row.original.active === 1 ? "default" : "secondary"}>
            {row.original.active === 1 ? "Hoạt động" : "Tắt"}
          </Badge>
        )
      },
      {
        accessorKey: "avgRating",
        header: "Đánh giá",
        cell: ({ row }) => (
          <div className="text-muted-foreground">
            {row.original.avgRating ? `${row.original.avgRating.toFixed(1)}⭐` : "—"}
          </div>
        )
      },
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
          <Badge variant="outline" className="font-mono">
            {row.original.id}
          </Badge>
        )
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-muted-foreground data-[state=open]:bg-muted flex size-8"
                size="icon"
              >
                <MoreVertical className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => handleEdit(row.original.id)}>
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem>Sao chép</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDeleteSelected([row.original.id])}
              >
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    ],
    [handleEdit, handleDeleteSelected]
  );

  return (
    <>
      <DataTableAdvanced
        data={products}
        columns={columns}
        total={total}
        pageSize={pagination.pageSize}
        pageIndex={pagination.pageIndex}
        onPaginationChange={handlePaginationChange}
        isLoading={isFetching}
        onRefresh={refetch}
        onAdd={handleAdd}
        onDeleteSelected={handleDeleteSelected}
        addLabel="Tạo sản phẩm"
        deleteLabel="Xóa đã chọn"
        title="Quản lý sản phẩm"
        description="Quản lý, tạo mới, chỉnh sửa sản phẩm"
      />
      <ProductSheet />
    </>
  );
}
