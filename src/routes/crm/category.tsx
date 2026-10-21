"use client";

import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { DataTableAdvanced } from "@/components/admin/table/data-table-advanced";
import { createCategoryColumns } from "@/components/crm/category/columns";
import { CategoryFormDialog } from "@/components/admin/category/category-dialog";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";

import {
  createInfiniteCategoriesQueryOptions,
  upsertCategoryMutationOptions,
  deleteCategoryMutationOptions
} from "@/lib/tanstack/options/category";
import type { CategoryDTO } from "@/lib/types/category";

export const Route = createFileRoute("/crm/category")({
  component: AdminCategories
});

function AdminCategories() {
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10
  });
  const [filters, setFilters] = React.useState<Record<string, string>>({ keyword: "" });

  const [selectedCategory, setSelectedCategory] = React.useState<CategoryDTO | null>(null);
  const [openForm, setOpenForm] = React.useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = React.useState<number | null>(null);
  const [deleteCategoryName, setDeleteCategoryName] = React.useState<string | undefined>();

  // Query
  const {
    data: queryData,
    refetch,
    isFetching
  } = useInfiniteQuery(
    createInfiniteCategoriesQueryOptions({
      opts: {
        keyword: filters.keyword.trim() || undefined,
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
  const upsertMutation = useMutation({ ...upsertCategoryMutationOptions() });
  const deleteMutation = useMutation({ ...deleteCategoryMutationOptions() });

  const handleUpdate = (values: Partial<CategoryDTO>) => {
    upsertMutation.mutate(values as any, {
      onSuccess: () => {
        setOpenForm(false);
        refetch();
        toast.success("Cập nhật danh mục thành công");
      }
    });
  };

  const handleEdit = (category: CategoryDTO) => {
    setSelectedCategory(category);
    setOpenForm(true);
  };

  const handleShowDeleteConfirm = (id: number, name?: string) => {
    setDeleteCategoryId(id);
    setDeleteCategoryName(name);
    setDeleteDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        refetch();
        toast.success("Xóa danh mục thành công");
      },
      onError: () => {
        toast.error("Xóa danh mục thất bại");
      }
    });
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
  const columns = React.useMemo(
    () =>
      createCategoryColumns({
        onDelete: handleDelete,
        onEdit: handleEdit,
        onShowDeleteConfirm: handleShowDeleteConfirm
      }),
    [handleEdit, handleDelete, handleShowDeleteConfirm]
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
        filter={{
          fields: [{ key: "keyword", label: "Từ khóa", placeholder: "Tìm danh mục..." }],
          values: filters,
          onChange: (values) => {
            setFilters(values);
            setPagination((current) => ({ ...current, pageIndex: 0 }));
          }
        }}
      />
      <CategoryFormDialog
        open={openForm}
        category={selectedCategory}
        onOpenChange={setOpenForm}
        onSubmit={(values) =>
          upsertMutation.mutate(values, { onSuccess: () => setOpenForm(false) })
        }
      />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        itemId={deleteCategoryId}
        itemName={deleteCategoryName}
        itemType="danh mục"
        onConfirm={handleDelete}
        onOpenChange={setDeleteDialogOpen}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
