import { type ColumnDef } from "@tanstack/react-table";
import { MoreVertical } from "lucide-react";

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
import type { components } from "@/lib/api/schema.gen";

export type VoucherRow = components["schemas"]["Voucher"] & { id: number };

const dateFormatter = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" });
const numberFormatter = new Intl.NumberFormat("vi-VN");

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

export function createVoucherColumns({
  canUpdate,
  canDelete,
  onEdit,
  onShowDeleteConfirm
}: {
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (voucher: VoucherRow) => void;
  onShowDeleteConfirm: (voucher: VoucherRow) => void;
}): ColumnDef<VoucherRow>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            aria-label="Chọn tất cả voucher"
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            aria-label={`Chọn voucher ${row.original.code ?? row.original.id}`}
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false
    },
    { accessorKey: "code", header: "Mã voucher" },
    {
      accessorKey: "name",
      header: "Tên voucher",
      cell: ({ row }) => <span className="font-medium">{row.original.name || "—"}</span>
    },
    {
      id: "discount",
      header: "Ưu đãi",
      cell: ({ row }) => {
        const { discountType, discountValue } = row.original;
        const value = numberFormatter.format(discountValue ?? 0);
        if (discountType === 1) return `Giảm số tiền · ${value} ₫`;
        if (discountType === 2) return `Giảm theo % · ${value}%`;
        return `— · ${value}`;
      }
    },
    {
      id: "validity",
      header: "Thời gian hiệu lực",
      cell: ({ row }) => <span className="whitespace-nowrap">{formatDate(row.original.startDate)} – {formatDate(row.original.endDate)}</span>
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => (
        <Badge variant={row.original.status === 1 ? "default" : "secondary"}>
          {row.original.status === 1 ? "Hoạt động" : row.original.status === 0 ? "Ngừng hoạt động" : row.original.status ?? "—"}
        </Badge>
      )
    },
    {
      id: "usage",
      header: "Đã dùng / Tổng lượt",
      cell: ({ row }) => `${numberFormatter.format(row.original.usageQuantity ?? 0)} / ${row.original.totalQuantity == null ? "∞" : numberFormatter.format(row.original.totalQuantity)}`
    },
    {
      id: "points",
      header: "Điểm đổi",
      cell: ({ row }) => row.original.pointsCost == null ? "—" : numberFormatter.format(row.original.pointsCost)
    },
    {
      id: "redeemStock",
      header: "Đã đổi / Tồn đổi",
      cell: ({ row }) => row.original.pointsCost == null ? "—" : `${numberFormatter.format(row.original.redeemedCount ?? 0)} / ${row.original.redeemStock == null ? "∞" : numberFormatter.format(row.original.redeemStock)}`
    },
    ...(canUpdate || canDelete
      ? [{
          id: "actions",
          cell: ({ row }) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={`Thao tác voucher ${row.original.code ?? row.original.id}`}>
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canUpdate && <DropdownMenuItem onClick={() => onEdit(row.original)}>Chỉnh sửa</DropdownMenuItem>}
                {canUpdate && canDelete && <DropdownMenuSeparator />}
                {canDelete && <DropdownMenuItem className="text-destructive" onClick={() => onShowDeleteConfirm(row.original)}>Xóa</DropdownMenuItem>}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        } satisfies ColumnDef<VoucherRow>]
      : [])
  ];
}
