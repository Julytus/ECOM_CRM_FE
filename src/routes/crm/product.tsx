"use client";

import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { toast } from "sonner";
import { useMemo, useState } from "react";

import { DataTableAdvanced } from "@/components/admin/table/data-table-advanced";
import { createProductColumns } from "@/components/crm/product/columns";

import {
  createInfiniteProductDetailsQueryOptions,
  deleteProductsMutationOptions
} from "@/lib/tanstack/options/product";
import { productSheetOpenAtom, selectedProductIdAtom } from "@/components/admin/product/atoms";
import { ProductSheet } from "@/components/admin/product/product-sheet";

export const Route = createFileRoute("/crm/product")({
  component: AdminProducts
});

function AdminProducts() {
  const [pagination, setPagination] = useState({
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

  const products = useMemo(() => queryData?.pages.flatMap((p) => p.items) ?? [], [queryData]);
  const total = useMemo(() => queryData?.pages[0]?.total ?? 0, [queryData]);

  // Mutations
  const deleteManyMutation = useMutation(deleteProductsMutationOptions());

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
  const columns = useMemo(
    () =>
      createProductColumns({
        onEdit: handleEdit,
        onDelete: handleDeleteSelected
      }),
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
