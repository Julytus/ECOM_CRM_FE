"use client";

import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CrmPermissionGuard } from "@/components/crm/crm-permission-guard";
import { useInfiniteQuery, useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { DataTableAdvanced } from "@/components/crm/table/data-table-advanced";
import { createOrderColumns } from "@/components/crm/order/columns";
import { OrderFormDialog } from "@/components/crm/order/order-form-dialog";
import { DeleteOrderDialog } from "@/components/crm/order/delete-order-dialog";
import { OrderDetailSheet } from "@/components/crm/order/order-sheet";
import type { OrderRow } from "@/components/crm/order/columns";

import {
  createInfiniteOrdersQueryOptions,
  advanceOrderMutationOptions,
  orderByIdQueryOptions,
  updateOrderMutationOptions,
  deleteOrderMutationOptions,
  batchDeleteOrdersMutationOptions
} from "@/lib/tanstack/options/order";
import type { OrderDTO } from "@/lib/types/order";

export const Route = createFileRoute("/crm/order")({
  component: () => (
    <CrmPermissionGuard code="ORDER">
      <AdminOrders />
    </CrmPermissionGuard>
  )
});

function AdminOrders() {
  const queryClient = useQueryClient();
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
  const orderDetailQueries = useQueries({
    queries: orders.map((order) => ({
      ...orderByIdQueryOptions(order.id),
      enabled: order.id > 0
    }))
  });
  const ordersWithDetails = orders.map((order, index) => ({
    ...order,
    ...orderDetailQueries[index]?.data
  })) as OrderRow[];
  const total = React.useMemo(() => queryData?.pages[0]?.total ?? 0, [queryData]);

  // Mutations
  const upsertMutation = useMutation(updateOrderMutationOptions());
  const deleteMutation = useMutation(deleteOrderMutationOptions());
  const batchDeleteMutation = useMutation(batchDeleteOrdersMutationOptions());
  const advanceMutation = useMutation(advanceOrderMutationOptions());

  const handleAdvance = (order: OrderRow) => {
    const nextStatus =
      order.status === "NEW"
        ? "CONFIRMED"
        : order.status === "CONFIRMED"
          ? "SHIPPING"
          : order.status === "SHIPPING"
            ? "COMPLETED"
            : undefined;
    if (!nextStatus) return;

    advanceMutation.mutate(
      { id: order.id, to: nextStatus },
      {
        onSuccess: async () => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["orders"] }),
            queryClient.invalidateQueries({ queryKey: ["order", order.id] }),
            queryClient.invalidateQueries({ queryKey: ["invoices"] }),
            queryClient.invalidateQueries({ queryKey: ["invoice"] }),
            queryClient.invalidateQueries({ queryKey: ["revenue-report"] }),
            queryClient.invalidateQueries({ queryKey: ["revenue-summary"] }),
            queryClient.invalidateQueries({ queryKey: ["revenue-series"] }),
            queryClient.invalidateQueries({ queryKey: ["revenue-payment-method"] }),
            queryClient.invalidateQueries({ queryKey: ["revenue-top-products"] }),
            queryClient.invalidateQueries({ queryKey: ["dashboard", "revenue"] })
          ]);
          toast.success("Đã cập nhật trạng thái đơn hàng.");
        },
      }
    );
  };

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
        onShowDeleteConfirm: handleShowDeleteConfirm,
        onViewDetails: handleViewDetails
      }),
    [handleUpdate, handleDelete, handleShowDeleteConfirm, handleViewDetails]
  );

  return (
    <>
      <DataTableAdvanced
        data={ordersWithDetails}
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
        onAdvance={handleAdvance}
        isAdvancing={advanceMutation.isPending}
      />
    </>
  );
}
