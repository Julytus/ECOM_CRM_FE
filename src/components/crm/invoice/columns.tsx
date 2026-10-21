import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreVertical, RotateCcw, Wallet, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { InvoiceStatusBadge } from "@/components/crm/invoice/invoice-status-badge";
import { formatVnd } from "@/lib/format";
import type { components } from "@/lib/api/schema.gen";

type Invoice = components["schemas"]["Invoice"];
type TableInvoice = Invoice & { id: number };
export type InvoiceAction = "confirm" | "cancel" | "refund";

export function createInvoiceColumns({
  canUpdate,
  canDelete,
  onView,
  onAction
}: {
  canUpdate: boolean;
  canDelete: boolean;
  onView: (invoice: Invoice) => void;
  onAction: (invoice: Invoice, action: InvoiceAction) => void;
}): ColumnDef<TableInvoice>[] {
  return [
    {
      accessorKey: "invoiceCode",
      header: "Mã hóa đơn / Đơn hàng",
      cell: ({ row }) => (
        <div>
          <div className="font-semibold">{row.original.invoiceCode || `#${row.original.id}`}</div>
          <div className="text-muted-foreground text-xs">
            {row.original.orderCode ||
              (row.original.orderId ? `Đơn #${row.original.orderId}` : "POS")}
          </div>
        </div>
      )
    },
    {
      accessorKey: "customerName",
      header: "Khách hàng",
      cell: ({ row }) => row.original.customerName || row.original.buyerName || "—"
    },
    {
      accessorKey: "buyerPhone",
      header: "Điện thoại",
      cell: ({ row }) => row.original.buyerPhone || "—"
    },
    {
      accessorKey: "amount",
      header: "Tổng tiền",
      cell: ({ row }) => <span className="font-medium">{formatVnd(row.original.amount ?? 0)}</span>
    },
    {
      accessorKey: "paid",
      header: "Đã thu",
      cell: ({ row }) => formatVnd(row.original.paid ?? 0)
    },
    {
      accessorKey: "paymentMethod",
      header: "Thanh toán",
      cell: ({ row }) => row.original.paymentMethod || "—"
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => <InvoiceStatusBadge status={row.original.status} />
    },
    {
      accessorKey: "createdTime",
      header: "Ngày tạo",
      cell: ({ row }) =>
        row.original.createdTime ? new Date(row.original.createdTime).toLocaleString("vi-VN") : "—"
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const invoice = row.original;
        const actions: { label: string; icon: typeof Wallet; action: InvoiceAction }[] = [];
        if (invoice.status === 3 && canUpdate) {
          actions.push({ label: "Xác nhận thu", icon: Wallet, action: "confirm" });
        }
        if (invoice.status === 3 && canDelete) {
          actions.push({ label: "Hủy hóa đơn", icon: XCircle, action: "cancel" });
        }
        if (invoice.status === 1 && canUpdate) {
          actions.push({ label: "Hoàn tiền", icon: RotateCcw, action: "refund" });
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Thao tác hóa đơn">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(invoice)}>
                <Eye className="mr-2 size-4" /> Xem chi tiết
              </DropdownMenuItem>
              {actions.map(({ label, icon: Icon, action }) => (
                <DropdownMenuItem key={action} onClick={() => onAction(invoice, action)}>
                  <Icon className="mr-2 size-4" /> {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];
}
