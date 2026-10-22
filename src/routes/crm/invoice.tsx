import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CrmPermissionGuard } from "@/components/crm/crm-permission-guard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import type { AxiosError } from "axios";
import { Check } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useResourceAction } from "@/lib/hooks/use-resource-action";
import { invoicesQueryOptions } from "@/lib/tanstack/options/invoice";

type Invoice = components["schemas"]["Invoice"];
type TableInvoice = Invoice & { id: number };
type ActionError = AxiosError<{ message?: string }>;

export const Route = createFileRoute("/crm/invoice")({
  component: () => (
    <CrmPermissionGuard code="INVOICE">
      <InvoicePage />
    </CrmPermissionGuard>
  )
});

const INVOICE_STATUS_OPTIONS = [
  { value: 0, label: "Nháp" },
  { value: 1, label: "Hoàn tất" },
  { value: 2, label: "Đã hủy" },
  { value: 3, label: "Chưa thanh toán" },
  { value: 4, label: "Hoàn tiền" }
] as const;

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
  const [detailInvoiceId, setDetailInvoiceId] = React.useState<number | null>(() => {
    const invoiceId = Number(new URLSearchParams(window.location.search).get("invoiceId"));
    return Number.isInteger(invoiceId) && invoiceId > 0 ? invoiceId : null;
  });

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
      [...createInvoiceColumns({
        canUpdate,
        canDelete,
        onView: (invoice) => setDetailInvoiceId(invoice.id ?? null),
        onAction: (invoice, nextAction) => {
          setSelectedInvoice(invoice);
          setAction(nextAction);
        }
      }),
      ...([
        {
          accessorKey: "updatedTime",
          header: "Cập nhật lúc",
          cell: ({ row }) =>
            row.original.updatedTime
              ? new Date(row.original.updatedTime).toLocaleString("vi-VN")
              : "—"
        },
        {
          accessorKey: "receiptDate",
          header: "Ngày thu tiền",
          cell: ({ row }) =>
            row.original.receiptDate
              ? new Date(row.original.receiptDate).toLocaleString("vi-VN")
              : "—"
        }
      ] satisfies ColumnDef<TableInvoice>[])
      ],
    [canDelete, canUpdate]
  );

  const updateFilter = (patch: Partial<InvoiceListParams>) => {
    setPagination((current) => ({ ...current, pageIndex: 0 }));
    setFilters((current) => ({ ...current, ...patch, page: 1 }));
  };

  const selectedStatuses = filters.status ?? [];
  const toggleStatus = (value: number) => {
    const next = selectedStatuses.includes(value)
      ? selectedStatuses.filter((v) => v !== value)
      : [...selectedStatuses, value];
    updateFilter({ status: next.length > 0 ? next : undefined });
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
        <div className="space-y-2 sm:col-span-2">
          <div className="flex items-center justify-between">
            <Label>Trạng thái</Label>
            {selectedStatuses.length > 0 && (
              <button
                type="button"
                onClick={() => updateFilter({ status: undefined })}
                className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline"
              >
                Bỏ chọn ({selectedStatuses.length})
              </button>
            )}
          </div>
          <div role="group" aria-label="Trạng thái hóa đơn" className="flex flex-wrap gap-2">
            {INVOICE_STATUS_OPTIONS.map(({ value, label }) => {
              const active = selectedStatuses.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleStatus(value)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {active && <Check className="size-3.5" />}
                  {label}
                </button>
              );
            })}
          </div>
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
