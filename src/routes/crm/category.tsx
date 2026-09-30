"use client";

import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { DataTableAdvanced } from "@/components/admin/table/data-table-advanced";
import { createCategoryColumns } from "@/components/crm/category/columns";
import { CategoryFormSheet } from "@/components/admin/category/category-sheet";

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
  const columns = React.useMemo(
    () =>
      createCategoryColumns({
        onUpdate: handleUpdate,
        onDelete: handleDelete
      }),
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
