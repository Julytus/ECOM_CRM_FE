"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreVertical, Trash2, Edit } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
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
  onEdit,
  onShowDeleteConfirm
}: {
  onDelete: (id: number) => void;
  onEdit: (order: OrderDTO) => void;
  onShowDeleteConfirm: (id: number, code?: string) => void;
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
      return (
        <div className="flex flex-col truncate">
          <span className="text-foreground max-w-[150px] truncate font-bold tracking-tight">
            {row.original.code || `#${row.original.id}`}
          </span>
          <span className="text-muted-foreground line-clamp-1 text-[11px] font-medium tracking-wider uppercase">
            ID: {row.original.id}
          </span>
        </div>
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
    cell: ({ row }) => (
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
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => onEdit(row.original)}>
            <Edit className="mr-2 size-4" />
            Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => onShowDeleteConfirm(row.original.id, row.original.code)}
          >
            <Trash2 className="mr-2 size-4" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
];
