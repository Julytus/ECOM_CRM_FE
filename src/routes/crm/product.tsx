"use client";

import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CrmPermissionGuard } from "@/components/crm/crm-permission-guard";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { toast } from "sonner";
import { useMemo, useState } from "react";

import { DataTableAdvanced } from "@/components/crm/table/data-table-advanced";
import { createProductColumns } from "@/components/crm/product/columns";
import { DeleteConfirmDialog } from "@/components/crm/delete-confirm-dialog";

import {
  createInfiniteProductDetailsQueryOptions,
  deleteProductsMutationOptions
} from "@/lib/tanstack/options/product";
import { productSheetOpenAtom, selectedProductIdAtom } from "@/components/crm/product/atoms";
import { ProductDialog } from "@/components/crm/product/product-dialog";

export const Route = createFileRoute("/crm/product")({
  component: () => (
    <CrmPermissionGuard code="PRODUCT">
      <AdminProducts />
    </CrmPermissionGuard>
  )
});

function AdminProducts() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  });
  const [filters, setFilters] = useState<Record<string, string>>({ keyword: "" });

  const [productId, setProductId] = useAtom(selectedProductIdAtom);
  const [open, setOpen] = useAtom(productSheetOpenAtom);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const [deleteProductName, setDeleteProductName] = useState<string | undefined>();

  // Query
  const {
    data: queryData,
    refetch,
    isFetching
  } = useInfiniteQuery(
    createInfiniteProductDetailsQueryOptions({
      opts: {
        keyword: filters.keyword.trim() || undefined,
        paging: {
          limit: pagination.pageSize,
          page: pagination.pageIndex + 1
        }
      }
    })
  );

  const products = useMemo(() => queryData?.pages.flatMap((p) => p.items) ?? [], [queryData]);
  const total = useMemo(() => queryData?.pages[0]?.total ?? 0, [queryData]);

  // Mutations
  const deleteManyMutation = useMutation(deleteProductsMutationOptions());

  const handleEdit = (id: number) => {
    setProductId(id);
    setOpen(true);
  };

  const handleShowDeleteConfirm = (id: number, name?: string) => {
    setDeleteProductId(id);
    setDeleteProductName(name);
    setDeleteDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteManyMutation.mutate([id], {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        refetch();
        toast.success("Xóa sản phẩm thành công");
      },
      onError: () => {
        toast.error("Xóa sản phẩm thất bại");
      }
    });
  };

  const handleDeleteSelected = (ids: number[]) => {
    if (confirm(`Bạn có chắc muốn xóa ${ids.length} sản phẩm đã chọn?`)) {
      deleteManyMutation.mutate(ids, {
        onSuccess: () => {
          refetch();
          toast.success("Xóa thành công");
        },
        onError: () => {
          toast.error("Có lỗi xảy ra");
        }
      });
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
  const columns = useMemo(
    () =>
      createProductColumns({
        onEdit: handleEdit,
        onDelete: handleDeleteSelected,
        onShowDeleteConfirm: handleShowDeleteConfirm
      }),
    [handleEdit, handleDeleteSelected, handleShowDeleteConfirm]
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
        filter={{
          fields: [{ key: "keyword", label: "Từ khóa", placeholder: "Tìm sản phẩm..." }],
          values: filters,
          onChange: (values) => {
            setFilters(values);
            setPagination((current) => ({ ...current, pageIndex: 0 }));
          }
        }}
      />
      <ProductDialog
        onSaved={() => {
          void refetch();
        }}
      />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        itemId={deleteProductId}
        itemName={deleteProductName}
        itemType="sản phẩm"
        onConfirm={handleDelete}
        onOpenChange={setDeleteDialogOpen}
        isLoading={deleteManyMutation.isPending}
      />
    </>
  );
}
