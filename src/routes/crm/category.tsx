"use client";

import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreVertical } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DataTableAdvanced } from "@/components/admin/table/data-table-advanced";

import {
  createInfiniteCategoriesQueryOptions,
  upsertCategoryMutationOptions,
  deleteCategoryMutationOptions
} from "@/lib/tanstack/options/category";
import { CategoryFormSheet } from "@/components/admin/category/category-sheet";
import type { CategoryDTO } from "@/lib/types/category";

export const Route = createFileRoute("/crm/category")({
  component: AdminCategories
});

// Category detail drawer
function CategoryDetailDrawer({
  item,
  onUpdate
}: {
  item: CategoryDTO;
  onUpdate: (values: Partial<CategoryDTO>) => void;
}) {
  const isMobile = useIsMobile();
  const [name, setName] = React.useState(item.name);
  const [description, setDescription] = React.useState(item.description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ id: item.id, name, description });
  };

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Chi tiết danh mục</DrawerTitle>
          <DrawerDescription>Xem và chỉnh sửa thông tin danh mục</DrawerDescription>
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
  );
}

function AdminCategories() {
  const queryClient = useQueryClient();
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10
  });

  const [selectedCategory, setSelectedCategory] = React.useState<CategoryDTO | null>(null);
  const [openForm, setOpenForm] = React.useState(false);

  // Query
  const {
    data: queryData,
    refetch,
    isFetching
  } = useInfiniteQuery(
    createInfiniteCategoriesQueryOptions({
      opts: {
        paging: {
          limit: pagination.pageSize,
          page: pagination.pageIndex + 1
        }
      }
    })
  );

  const categories = React.useMemo(
    () => queryData?.pages.flatMap((p) => p.items) ?? [],
    [queryData]
  );
  const total = React.useMemo(() => queryData?.pages[0]?.total ?? 0, [queryData]);

  // Mutations
  // Mutations
  const upsertMutation = useMutation({ ...upsertCategoryMutationOptions() });
  const deleteMutation = useMutation({ ...deleteCategoryMutationOptions() });

  const handleUpdate = (values: Partial<CategoryDTO>) => {
    upsertMutation.mutate(values as any);
  };

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc muốn xóa danh mục này?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDeleteSelected = (ids: number[]) => {
    if (confirm(`Bạn có chắc muốn xóa ${ids.length} danh mục đã chọn?`)) {
      Promise.all(ids.map((id) => deleteMutation.mutateAsync(id)))
        .then(() => {
          toast.success("Xóa thành công");
          refetch();
        })
        .catch(() => {
          toast.error("Có lỗi xảy ra");
        });
    }
  };

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPagination({ pageIndex, pageSize });
  };

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
        enableHiding: false
      },
      {
        accessorKey: "name",
        header: "Tên danh mục",
        cell: ({ row }) => {
          return <CategoryDetailDrawer item={row.original} onUpdate={handleUpdate} />;
        },
        enableHiding: false
      },
      {
        accessorKey: "description",
        header: "Mô tả",
        cell: ({ row }) => (
          <div className="text-muted-foreground max-w-md truncate">
            {row.original.description || "—"}
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
        )
      }
    ],
    [handleUpdate, handleDelete]
  );

  return (
    <>
      <DataTableAdvanced
        data={categories}
        columns={columns}
        total={total}
        pageSize={pagination.pageSize}
        pageIndex={pagination.pageIndex}
        onPaginationChange={handlePaginationChange}
        isLoading={isFetching}
        onRefresh={refetch}
        onAdd={() => {
          setSelectedCategory(null);
          setOpenForm(true);
        }}
        onDeleteSelected={handleDeleteSelected}
        addLabel="Thêm danh mục"
        deleteLabel="Xóa đã chọn"
        title="Quản lý danh mục"
        description="Tạo, chỉnh sửa và sắp xếp các danh mục sản phẩm"
      />
      <CategoryFormSheet
        open={openForm}
        category={selectedCategory}
        onOpenChange={setOpenForm}
        onSubmit={(values) =>
          upsertMutation.mutate(values, { onSuccess: () => setOpenForm(false) })
        }
      />
    </>
  );
}
