import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";

import { DataTableAdvanced } from "@/components/crm/table/data-table-advanced";
import { createInvoiceColumns, type InvoiceAction } from "@/components/crm/invoice/columns";
import { InvoiceActionDialogs } from "@/components/crm/invoice/invoice-action-dialogs";
import { InvoiceDetailSheet } from "@/components/crm/invoice/invoice-detail-sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  cancelInvoice,
  confirmInvoicePayment,
  refundInvoice,
  type InvoiceListParams
} from "@/lib/api/invoice";
import type { components } from "@/lib/api/schema.gen";
import { useResourceAction } from "@/lib/hooks/use-resource-action";
import { invoicesQueryOptions } from "@/lib/tanstack/options/invoice";

type Invoice = components["schemas"]["Invoice"];
type ActionError = AxiosError<{ message?: string }>;

export const Route = createFileRoute("/crm/invoice")({ component: InvoicePage });

const DEFAULT_FILTERS: InvoiceListParams = {
  page: 1,
  limit: 10,
  sortBy: "createdTime",
  sortDir: "desc"
};

function getErrorMessage(error: unknown, fallback: string) {
  const message = (error as ActionError)?.response?.data?.message;
  return message || fallback;
}

function InvoicePage() {
  const queryClient = useQueryClient();
  const canResourceAction = useResourceAction();
  const canUpdate = canResourceAction("INVOICE", "UPDATE");
  const canDelete = canResourceAction("INVOICE", "DELETE");
  const [filters, setFilters] = React.useState<InvoiceListParams>(DEFAULT_FILTERS);
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null);
  const [action, setAction] = React.useState<InvoiceAction | null>(null);
  const [detailInvoiceId, setDetailInvoiceId] = React.useState<number | null>(null);

  const listQuery = useQuery(invoicesQueryOptions(filters));
  const actionMutation = useMutation({
    mutationFn: async (input: { invoice: Invoice; action: InvoiceAction; reason?: string }) => {
      const id = input.invoice.id;
      if (id === undefined) throw new Error("Không tìm thấy mã hóa đơn.");
      if (input.action === "confirm") return confirmInvoicePayment(id);
      if (input.action === "cancel") return cancelInvoice(id);
      return refundInvoice({ id, reason: input.reason });
    },
    onSuccess: async (_, input) => {
      setAction(null);
      setSelectedInvoice(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["invoices"] }),
        queryClient.invalidateQueries({ queryKey: ["invoice", input.invoice.id] })
      ]);
      toast.success("Đã cập nhật hóa đơn.");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Không thể cập nhật hóa đơn."))
  });

  React.useEffect(() => {
    if (listQuery.error)
      toast.error(getErrorMessage(listQuery.error, "Không thể tải danh sách hóa đơn."));
  }, [listQuery.error]);

  const page = listQuery.data;
  const invoices = React.useMemo(
    () =>
      (page?.items ?? []).map((invoice, index) => ({ ...invoice, id: invoice.id ?? -(index + 1) })),
    [page?.items]
  );
  const columns = React.useMemo(
    () =>
      createInvoiceColumns({
        canUpdate,
        canDelete,
        onView: (invoice) => setDetailInvoiceId(invoice.id ?? null),
        onAction: (invoice, nextAction) => {
          setSelectedInvoice(invoice);
          setAction(nextAction);
        }
      }),
    [canDelete, canUpdate]
  );

  const updateFilter = (patch: Partial<InvoiceListParams>) => {
    setPagination((current) => ({ ...current, pageIndex: 0 }));
    setFilters((current) => ({ ...current, ...patch, page: 1 }));
  };

  const setPage = (pageIndex: number, pageSize: number) => {
    setPagination({ pageIndex, pageSize });
    setFilters((current) => ({ ...current, page: pageIndex + 1, limit: pageSize }));
  };

  return (
    <div className="container mx-auto space-y-5 p-6">
      <section>
        <h1 className="text-3xl font-bold tracking-tight">Quản lý hóa đơn</h1>
        <p className="text-muted-foreground text-sm">Lọc, xem chi tiết và xử lý hóa đơn.</p>
      </section>

      <section className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="invoice-keyword">Từ khóa</Label>
          <Input
            id="invoice-keyword"
            value={filters.keyword ?? ""}
            onChange={(event) => updateFilter({ keyword: event.target.value || undefined })}
            placeholder="Mã, tên, số điện thoại"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoice-status">Trạng thái</Label>
          <select
            id="invoice-status"
            multiple
            value={(filters.status ?? []).map(String)}
            onChange={(event) =>
              updateFilter({
                status: Array.from(event.currentTarget.selectedOptions, (option) =>
                  Number(option.value)
                )
              })
            }
            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
            aria-label="Trạng thái hóa đơn"
          >
            <option value="0">Nháp</option>
            <option value="1">Hoàn tất</option>
            <option value="2">Đã hủy</option>
            <option value="3">Chưa thanh toán</option>
            <option value="4">Hoàn tiền</option>
          </select>
          <p className="text-muted-foreground text-xs">Giữ Ctrl/Cmd để chọn nhiều trạng thái.</p>
        </div>
        <div className="space-y-2">
          <Label>Phương thức thanh toán</Label>
          <Select
            value={filters.paymentMethod ?? "all"}
            onValueChange={(value) =>
              updateFilter({
                paymentMethod:
                  value === "all" ? undefined : (value as InvoiceListParams["paymentMethod"])
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="COD">COD</SelectItem>
              <SelectItem value="PAYOS">PayOS</SelectItem>
              <SelectItem value="CASH">Tiền mặt</SelectItem>
              <SelectItem value="TRANSFER">Chuyển khoản</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoice-order-code">Mã đơn hàng</Label>
          <Input
            id="invoice-order-code"
            value={filters.orderCode ?? ""}
            onChange={(event) => updateFilter({ orderCode: event.target.value || undefined })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoice-from-date">Từ ngày</Label>
          <Input
            id="invoice-from-date"
            type="date"
            value={filters.fromDate ?? ""}
            onChange={(event) => updateFilter({ fromDate: event.target.value || undefined })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoice-to-date">Đến ngày</Label>
          <Input
            id="invoice-to-date"
            type="date"
            value={filters.toDate ?? ""}
            onChange={(event) => updateFilter({ toDate: event.target.value || undefined })}
          />
        </div>
        <div className="space-y-2">
          <Label>Sắp xếp theo</Label>
          <Select
            value={filters.sortBy ?? "createdTime"}
            onValueChange={(value) =>
              updateFilter({ sortBy: value as InvoiceListParams["sortBy"] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdTime">Ngày tạo</SelectItem>
              <SelectItem value="id">Mã hóa đơn</SelectItem>
              <SelectItem value="fee">Phí</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Thứ tự</Label>
          <Select
            value={filters.sortDir ?? "desc"}
            onValueChange={(value) => updateFilter({ sortDir: value as "asc" | "desc" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Mới nhất</SelectItem>
              <SelectItem value="asc">Cũ nhất</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <DataTableAdvanced
        data={invoices}
        columns={columns}
        total={page?.total ?? 0}
        pageSize={pagination.pageSize}
        pageIndex={pagination.pageIndex}
        onPaginationChange={setPage}
        isLoading={listQuery.isFetching}
        onRefresh={() => void listQuery.refetch()}
        title="Hóa đơn"
        description="Danh sách hóa đơn theo bộ lọc đã chọn."
      />

      <InvoiceActionDialogs
        invoice={selectedInvoice}
        action={action}
        open={action !== null}
        isPending={actionMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setAction(null);
            setSelectedInvoice(null);
          }
        }}
        onConfirm={(invoice, selectedAction, reason) =>
          actionMutation.mutate({ invoice, action: selectedAction, reason })
        }
      />
      <InvoiceDetailSheet
        invoiceId={detailInvoiceId}
        open={detailInvoiceId !== null}
        onOpenChange={(open) => {
          if (!open) setDetailInvoiceId(null);
        }}
      />
    </div>
  );
}
