import type { ColumnDef } from "@tanstack/react-table";
import type { OrderDTO, OrderStatus } from "@/lib/types/order";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, CheckCircle2, XCircle, Eye, Truck, Clock, RotateCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

const formatCurrency = (value?: number) => {
  if (typeof value !== "number") return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  }).format(value);
};

const statusMap: Record<
  OrderStatus,
  {
    label: string;
    variant: "outline" | "secondary" | "default" | "success" | "destructive" | "warning";
  }
> = {
  NEW: { label: "Mới", variant: "outline" },
  CONFIRMED: { label: "Đã xác nhận", variant: "secondary" },
  SHIPPING: { label: "Đang giao", variant: "warning" },
  COMPLETED: { label: "Hoàn thành", variant: "success" },
  CANCELLED: { label: "Đã hủy", variant: "destructive" },
  REFUNDED: { label: "Hoàn tiền", variant: "default" }
};

export const createOrderColumns = ({
  onUpdate,
  onViewDetails
}: {
  onUpdate: (order: OrderDTO) => void;
  onViewDetails?: (order: OrderDTO) => void;
}): ColumnDef<OrderDTO>[] => [
  {
    accessorKey: "code",
    header: "Mã đơn",
    cell: ({ row }) => <span className="font-mono font-medium">{row.original.code ?? "—"}</span>
  },
  {
    accessorKey: "createdAt",
    header: "Ngày đặt",
    cell: ({ row }) => {
      const value = row.original.createdAt;
      return (
        <div className="text-sm">{value ? format(new Date(value), "dd/MM/yyyy HH:mm") : "—"}</div>
      );
    }
  },
  {
    accessorKey: "address",
    header: "Khách hàng",
    cell: ({ row }) => {
      const address = row.original.address;

      if (!address) {
        return <span className="text-muted-foreground">—</span>;
      }

      const [name, phone] = address.split(" | ");

      return (
        <div className="flex flex-col">
          <span className="font-medium">{name ?? "—"}</span>
          {phone && <span className="text-muted-foreground text-xs">{phone}</span>}
        </div>
      );
    }
  },
  {
    accessorKey: "finalAmount",
    header: "Tổng tiền",
    cell: ({ row }) => (
      <span className="text-primary font-semibold">{formatCurrency(row.original.finalAmount)}</span>
    )
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.original.status;
      if (!status) return <Badge variant="outline">—</Badge>;

      const config = statusMap[status] ?? { label: status, variant: "outline" };
      return <Badge variant={config.variant as any}>{config.label}</Badge>;
    }
  },
  {
    accessorKey: "paymentStatus",
    header: "Thanh toán",
    cell: ({ row }) => {
      const isPaid = row.original.paymentStatus === "PAID";

      return (
        <Badge
          variant={isPaid ? "outline" : "destructive"}
          className={isPaid ? "border-green-500 text-green-600" : ""}
        >
          {isPaid ? "Đã trả" : "Chưa trả"}
        </Badge>
      );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original;
      const currentStatus = order.status;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
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
