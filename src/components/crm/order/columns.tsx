"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreVertical, Trash2, Eye, CheckCircle2, Truck, RotateCcw, XCircle, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  onUpdate
}: {
  onDelete: (id: number) => void;
  onShowDeleteConfirm: (id: number, code?: string) => void;
  onViewDetails: (order: OrderDTO) => void;
  onUpdate: (order: OrderDTO) => void;
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
    accessorKey: "paymentMethod",
    header: "Phương thức thanh toán",
    cell: ({ row }) => {
      const method = row.original.paymentMethod;
      const methodLabel = {
        COD: "Thanh toán khi nhận hàng",
        BANK_TRANSFER: "Chuyển khoản ngân hàng",
        CREDIT_CARD: "Thẻ tín dụng",
        E_WALLET: "Ví điện tử"
      }[method] || method;

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
      const statusStyles = {
        PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
        UNPAID: "bg-amber-50 text-amber-700 border-amber-200",
        PARTIAL: "bg-blue-50 text-blue-700 border-blue-200",
        REFUNDED: "bg-red-50 text-red-700 border-red-200"
      }[paymentStatus] || "bg-stone-50 text-stone-600 border-stone-200";

      const statusLabel = {
        PAID: "Đã thanh toán",
        UNPAID: "Chưa thanh toán",
        PARTIAL: "Thanh toán một phần",
        REFUNDED: "Đã hoàn tiền"
      }[paymentStatus] || paymentStatus;

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
    id: "actions",
    cell: ({ row }) => {
      const order = row.original;
      const currentStatus = order.status;

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
            <DropdownMenuItem onClick={() => onViewDetails?.(order)}>
              <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            {/* NEW -> CONFIRMED */}
            {currentStatus === "NEW" && (
              <DropdownMenuItem onClick={() => onUpdate({ ...order, status: "CONFIRMED" })}>
                <CheckCircle2 className="mr-2 h-4 w-4 text-blue-600" /> Xác nhận đơn
              </DropdownMenuItem>
            )}

            {/* CONFIRMED -> SHIPPING */}
            {currentStatus === "CONFIRMED" && (
              <DropdownMenuItem onClick={() => onUpdate({ ...order, status: "SHIPPING" })}>
                <Truck className="mr-2 h-4 w-4 text-orange-600" /> Giao hàng
              </DropdownMenuItem>
            )}

            {/* SHIPPING -> COMPLETED */}
            {currentStatus === "SHIPPING" && (
              <DropdownMenuItem
                onClick={() =>
                  onUpdate({
                    ...order,
                    status: "COMPLETED",
                    paymentStatus: "PAID"
                  })
                }
              >
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" /> Hoàn thành
              </DropdownMenuItem>
            )}

            {/* Any active status -> COMPLETED */}
            {(currentStatus === "NEW" || currentStatus === "CONFIRMED") && (
              <DropdownMenuItem
                onClick={() =>
                  onUpdate({
                    ...order,
                    status: "COMPLETED",
                    paymentStatus: "PAID"
                  })
                }
              >
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" /> Hoàn thành ngay
              </DropdownMenuItem>
            )}

            {/* COMPLETED -> REFUNDED */}
            {currentStatus === "COMPLETED" && (
              <DropdownMenuItem onClick={() => onUpdate({ ...order, status: "REFUNDED" })}>
                <RotateCcw className="mr-2 h-4 w-4 text-purple-600" /> Hoàn tiền
              </DropdownMenuItem>
            )}

            {/* Any non-final status -> CANCELLED */}
            {currentStatus !== "COMPLETED" &&
              currentStatus !== "CANCELLED" &&
              currentStatus !== "REFUNDED" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onUpdate({ ...order, status: "CANCELLED" })}
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Hủy đơn
                  </DropdownMenuItem>
                </>
              )}

            {/* CANCELLED -> NEW (reopen) */}
            {currentStatus === "CANCELLED" && (
              <DropdownMenuItem onClick={() => onUpdate({ ...order, status: "NEW" })}>
                <Clock className="mr-2 h-4 w-4 text-gray-600" /> Mở lại đơn
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
