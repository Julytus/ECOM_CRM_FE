import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  useReactTable,
  type SortingState,
  type PaginationState,
  type ColumnFiltersState
} from "@tanstack/react-table";

import { DataTable } from "@/components/admin/table/data-table";
import {
  createInfiniteOrdersQueryOptions,
  updateOrderMutationOptions
} from "@/lib/tanstack/options/order";
import { createOrderColumns } from "@/components/admin/order/columns";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { OrderStatus } from "@/lib/types/order";

// 1. Import Shadcn Select components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { OrderDetailSheet } from "@/components/admin/order/order-sheet";

export const Route = createFileRoute("/crm/order")({
  component: CrmOrders
});

function CrmOrders() {
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  });

  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");

  const { data, refetch, isFetching, isFetchingNextPage } = useInfiniteQuery(
    createInfiniteOrdersQueryOptions({
      opts: {
        orderStatus: statusFilter === "ALL" ? undefined : statusFilter,
        paging: {
          limit: pagination.pageSize,
          page: pagination.pageIndex + 1
        }
      }
    })
  );

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const orders = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const total = useMemo(() => data?.pages[0]?.total ?? 0, [data]);

  const updateOrderMutation = useMutation(updateOrderMutationOptions());

  const columns = useMemo(
    () =>
      createOrderColumns({
        onUpdate: (order) => updateOrderMutation.mutate(order),
        onViewDetails: (order) => setSelectedOrderId(order.id)
      }),
    []
  );

  const table = useReactTable({
    data: orders,
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
          <h1 className="text-2xl font-bold tracking-tight">Quản lý đơn hàng</h1>
          <p className="text-muted-foreground text-sm">
            Theo dõi, cập nhật trạng thái và xử lý đơn hàng của hệ thống.
          </p>
        </div>
      </div>

      <DataTable
        table={table}
        filterable={false}
        toolbarLeft={
          /* 2. Enhanced Shadcn Select Implementation */
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as OrderStatus | "ALL")}
          >
            <SelectTrigger className="h-8 w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="NEW">Mới</SelectItem>
              <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
              <SelectItem value="SHIPPING">Đang giao</SelectItem>
              <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
              <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              <SelectItem value="REFUNDED">Hoàn tiền</SelectItem>
            </SelectContent>
          </Select>
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

      <OrderDetailSheet
        orderId={selectedOrderId}
        open={selectedOrderId !== null}
        onOpenChange={(open) => !open && setSelectedOrderId(null)}
      />

      {isFetching && !isFetchingNextPage && (
        <div className="bg-background fixed right-4 bottom-4 flex items-center rounded-md border p-2 text-xs shadow-lg">
          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          Đang cập nhật dữ liệu...
        </div>
      )}
    </div>
  );
}
