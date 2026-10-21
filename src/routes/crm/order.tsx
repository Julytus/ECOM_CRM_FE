"use client";

import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { DataTableAdvanced } from "@/components/admin/table/data-table-advanced";
import { createOrderColumns } from "@/components/crm/order/columns";
import { OrderFormDialog } from "@/components/admin/order/order-form-dialog";
import { DeleteOrderDialog } from "@/components/admin/order/delete-order-dialog";
import { OrderDetailSheet } from "@/components/admin/order/order-sheet";

import {
  createInfiniteOrdersQueryOptions,
  updateOrderMutationOptions,
  deleteOrderMutationOptions,
  batchDeleteOrdersMutationOptions
} from "@/lib/tanstack/options/order";
import type { OrderDTO } from "@/lib/types/order";

export const Route = createFileRoute("/crm/order")({
  component: AdminOrders
});

function AdminOrders() {
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10
  });

  const [selectedOrder, setSelectedOrder] = React.useState<OrderDTO | null>(null);
  const [openForm, setOpenForm] = React.useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteOrderId, setDeleteOrderId] = React.useState<number | null>(null);
  const [deleteOrderCode, setDeleteOrderCode] = React.useState<string | undefined>();

  const [detailSheetOpen, setDetailSheetOpen] = React.useState(false);
  const [detailOrderId, setDetailOrderId] = React.useState<number | null>(null);

  // Query
  const {
    data: queryData,
    refetch,
    isFetching
  } = useInfiniteQuery(
    createInfiniteOrdersQueryOptions({
      opts: {
        paging: {
          limit: pagination.pageSize,
          page: pagination.pageIndex + 1
        }
      }
    })
  );

  const orders = React.useMemo(() => queryData?.pages.flatMap((p) => p.items) ?? [], [queryData]);
  const total = React.useMemo(() => queryData?.pages[0]?.total ?? 0, [queryData]);

  // Mutations
  const upsertMutation = useMutation(updateOrderMutationOptions());
  const deleteMutation = useMutation(deleteOrderMutationOptions());
  const batchDeleteMutation = useMutation(batchDeleteOrdersMutationOptions());

  const handleUpdate = (values: Partial<OrderDTO>) => {
    upsertMutation.mutate(values as any, {
      onSuccess: () => {
        setOpenForm(false);
        refetch();
        toast.success("Cập nhật đơn hàng thành công");
      },
      onError: () => {
        toast.error("Cập nhật đơn hàng thất bại");
      }
    });
  };

  const handleEdit = (order: OrderDTO) => {
    setSelectedOrder(order);
    setOpenForm(true);
  };

  const handleShowDeleteConfirm = (id: number, code?: string) => {
    setDeleteOrderId(id);
    setDeleteOrderCode(code);
    setDeleteDialogOpen(true);
  };

  const handleViewDetails = (order: OrderDTO) => {
    setDetailOrderId(order.id);
    setDetailSheetOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        refetch();
      }
    });
  };

  const handleDeleteSelected = (ids: number[]) => {
    if (!confirm(`Bạn có chắc muốn xóa ${ids.length} đơn hàng đã chọn?`)) return;
    batchDeleteMutation.mutate(ids, {
      onSuccess: () => {
        refetch();
        toast.success("Xóa thành công");
      },
      onError: () => {
        toast.error("Có lỗi xảy ra");
        refetch();
      }
    });
  };

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPagination({ pageIndex, pageSize });
  };

  // Define columns
  const columns = React.useMemo(
    () =>
      createOrderColumns({
        onDelete: handleDelete,
        onUpdate: handleUpdate,
        onShowDeleteConfirm: handleShowDeleteConfirm,
        onViewDetails: handleViewDetails
      }),
    [handleUpdate, handleDelete, handleShowDeleteConfirm, handleViewDetails]
  );

  return (
    <>
      <DataTableAdvanced
        data={orders}
        columns={columns}
        total={total}
        pageSize={pagination.pageSize}
        pageIndex={pagination.pageIndex}
        onPaginationChange={handlePaginationChange}
        isLoading={isFetching}
        onRefresh={refetch}
        onDeleteSelected={handleDeleteSelected}
        deleteLabel="Xóa đã chọn"
        title="Quản lý đơn hàng"
        description="Theo dõi, cập nhật trạng thái và xử lý đơn hàng của hệ thống."
      />
      <OrderFormDialog
        open={openForm}
        order={selectedOrder}
        onOpenChange={setOpenForm}
        onSubmit={handleUpdate}
      />
      <DeleteOrderDialog
        open={deleteDialogOpen}
        orderId={deleteOrderId}
        orderCode={deleteOrderCode}
        onConfirm={handleDelete}
        onOpenChange={setDeleteDialogOpen}
        isLoading={deleteMutation.isPending}
      />
      <OrderDetailSheet
        orderId={detailOrderId}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
      />
    </>
  );
}
