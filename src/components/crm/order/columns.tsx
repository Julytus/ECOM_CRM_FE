"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreVertical, Eye } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import type { OrderDTO, OrderStatus } from "@/lib/types/order";
import { formatVnd } from "@/lib/format";
import type { components } from "@/lib/api/schema.gen";

export type OrderRow = OrderDTO & Pick<components["schemas"]["OrderResponse"], "invoiceId" | "invoiceCode" | "updatedAt">;

const getStatusStyles = (status?: OrderStatus) => {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "NEW":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "CANCELLED":
      return "bg-stone-100 text-stone-500 border-stone-200";
    case "SHIPPING":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "CONFIRMED":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "REFUNDED":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-stone-50 text-stone-600 border-stone-200";
  }
};

const statusLabels: Record<OrderStatus, string> = {
  NEW: "Mới",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
  REFUNDED: "Hoàn tiền"
};

export const createOrderColumns = ({
  onDelete,
  onShowDeleteConfirm,
  onViewDetails,
}: {
  onDelete: (id: number) => void;
  onShowDeleteConfirm: (id: number, code?: string) => void;
  onViewDetails: (order: OrderRow) => void;
}): ColumnDef<OrderDTO>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: "code",
    header: "Mã đơn hàng",
    cell: ({ row }) => {
      const createdAt = row.original.createdAt
        ? new Date(row.original.createdAt).toLocaleString("vi-VN")
        : "—";
      const note = row.original.note || "(Không có ghi chú)";

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col truncate cursor-help">
                <span className="text-foreground max-w-[150px] truncate font-bold tracking-tight">
                  {row.original.code || `#${row.original.id}`}
                </span>
                <span className="text-muted-foreground line-clamp-1 text-[11px] font-medium tracking-wider uppercase">
                  ID: {row.original.id}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-semibold">Ghi chú:</p>
                  <p className="text-xs">{note}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold">Ngày tạo:</p>
                  <p className="text-xs">{createdAt}</p>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    enableHiding: false
  },
  {
    accessorKey: "address",
    header: "Khách hàng",
    cell: ({ row }) => {
      const address = row.original.address || "";
      const [customerName] = address.split(" | ");
      return (
        <div className="text-muted-foreground max-w-md truncate">
          {customerName || "—"}
        </div>
      );
    }
  },
  {
    accessorKey: "finalAmount",
    header: "Tổng tiền",
    cell: ({ row }) => (
      <div className="font-semibold text-foreground">
        {formatVnd(row.original.finalAmount)}
      </div>
    )
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={`rounded-full font-bold ${getStatusStyles(row.original.status)}`}
      >
        {statusLabels[row.original.status as OrderStatus] || row.original.status}
      </Badge>
    )
  },
  {
    id: "invoiceCode",
    header: "Mã hóa đơn",
    cell: ({ row }) => {
      const order = row.original as OrderRow;
      return order.invoiceId ? (
        <a
          className="font-medium text-primary underline-offset-4 hover:underline"
          href={`/crm/invoice?invoiceId=${order.invoiceId}`}
        >
          {order.invoiceCode || `#${order.invoiceId}`}
        </a>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    }
  },
  {
    accessorKey: "paymentMethod",
    header: "Phương thức thanh toán",
    cell: ({ row }) => {
      const method = row.original.paymentMethod;
      const methodLabels: Record<string, string> = {
        COD: "Thanh toán khi nhận hàng",
        BANK_TRANSFER: "Chuyển khoản ngân hàng",
        CREDIT_CARD: "Thẻ tín dụng",
        E_WALLET: "Ví điện tử"
      };
      const methodLabel = method ? methodLabels[method] || method : "—";

      return (
        <div className="text-sm text-foreground">
          {methodLabel}
        </div>
      );
    }
  },
  {
    accessorKey: "paymentStatus",
    header: "Trạng thái thanh toán",
    cell: ({ row }) => {
      const paymentStatus = row.original.paymentStatus;
      const paymentStatusStyles: Record<string, string> = {
        PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
        UNPAID: "bg-amber-50 text-amber-700 border-amber-200",
        PARTIAL: "bg-blue-50 text-blue-700 border-blue-200",
        REFUNDED: "bg-red-50 text-red-700 border-red-200"
      };
      const statusStyles = paymentStatus
        ? paymentStatusStyles[paymentStatus] || "bg-stone-50 text-stone-600 border-stone-200"
        : "bg-stone-50 text-stone-600 border-stone-200";

      const paymentStatusLabels: Record<string, string> = {
        PAID: "Đã thanh toán",
        UNPAID: "Chưa thanh toán",
        PARTIAL: "Thanh toán một phần",
        REFUNDED: "Đã hoàn tiền"
      };
      const statusLabel = paymentStatus
        ? paymentStatusLabels[paymentStatus] || paymentStatus
        : "—";

      return (
        <Badge
          variant="outline"
          className={`rounded-full font-bold ${statusStyles}`}
        >
          {statusLabel}
        </Badge>
      );
    }
  },
  {
    accessorKey: "createdAt",
    header: "Ngày tạo",
    cell: ({ row }) => (
      <div className="text-muted-foreground text-sm">
        {row.original.createdAt
          ? new Date(row.original.createdAt).toLocaleDateString("vi-VN")
          : "—"}
      </div>
    )
  },
  {
    accessorKey: "updatedAt",
    header: "Cập nhật lúc",
    cell: ({ row }) => {
      const updatedAt = (row.original as OrderRow).updatedAt;
      return (
        <div className="text-muted-foreground text-sm">
          {updatedAt ? new Date(updatedAt).toLocaleString("vi-VN") : "—"}
        </div>
      );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="text-muted-foreground data-[state=open]:bg-muted flex size-8"
              size="icon"
            >
              <MoreVertical className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onViewDetails?.(order as OrderRow)}>
              <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
