"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  MapPin,
  Truck,
  CheckCircle2,
  Printer,
  User,
  Phone
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { orderByIdQueryOptions } from "@/lib/tanstack/options/order";
import { QueryBoundary } from "@/components/boundary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatVnd } from "@/lib/format";
import type { OrderStatus } from "@/lib/types/order";
import { ImageWithFallback } from "@/components/image/image-with-fallback";
import type { OrderRow } from "@/components/crm/order/columns";

interface OrderDetailSheetProps {
  orderId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdvance: (order: OrderRow) => void;
  isAdvancing: boolean;
}

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
    default:
      return "bg-stone-50 text-stone-600 border-stone-200";
  }
};

export function OrderDetailSheet({ orderId, open, onOpenChange, onAdvance, isAdvancing }: OrderDetailSheetProps) {
  const { data, status, error, refetch } = useQuery({
    ...orderByIdQueryOptions(orderId ?? 0),
    enabled: open && !!orderId
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          "w-full gap-0 border-l border-stone-200 p-0 sm:max-w-2xl",
          "flex flex-col bg-stone-50/95 backdrop-blur-xl"
        )}
      >
        {/* Header Section */}
        <div className="relative border-b border-stone-200 bg-white/50 px-8 py-10 shadow-sm">
          <div className="space-y-1">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-6 items-center justify-center rounded-full bg-stone-900 px-3 text-[10px] font-bold tracking-[0.2em] text-white uppercase">
                Hồ sơ vận đơn
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-stone-400 hover:text-stone-900"
              >
                <Printer className="h-4 w-4" />
              </Button>
            </div>

            <SheetHeader className="space-y-0 text-left">
              <SheetTitle className="font-serif text-4xl font-normal tracking-tight text-stone-900">
                #{data?.code || "Order Log"}
              </SheetTitle>
              <SheetDescription className="pt-2 font-medium text-stone-500">
                Phân tích dữ liệu và quản lý luồng vận hành đơn hàng.
              </SheetDescription>
            </SheetHeader>
          </div>
          <div className="absolute bottom-0 left-0 h-[2px] w-24 bg-stone-900" />
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto px-8 py-10">
          <QueryBoundary data={data} status={status} error={error} onRetry={() => refetch()}>
            {(order) => {
              const orderRow = order as OrderRow;
              // Parsing Name and Phone from address string
              const [customerName, customerPhone, ...addressParts] = (order.address || "").split(
                " | "
              );
              const fullAddress = addressParts.join(" | ");

              return (
                <div className="animate-in fade-in slide-in-from-bottom-4 space-y-10 duration-700">
                  {/* 1. Status & Date Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                      <p className="mb-1 text-[10px] font-bold tracking-widest text-stone-400 uppercase">
                        Tiến độ
                      </p>
                      <Badge
                        variant="outline"
                        className={cn("rounded-full font-bold", getStatusStyles(order.status))}
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <div className="rounded-2xl border border-stone-200 bg-white p-5 text-right shadow-sm">
                      <p className="mb-1 text-[10px] font-bold tracking-widest text-stone-400 uppercase">
                        Ngày ghi nhận
                      </p>
                      <p className="font-serif text-lg text-stone-900">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString("vi-VN")
                          : "---"}
                      </p>
                    </div>
                  </div>

                  {/* 2. Customer Registry Card */}
                  <div className="space-y-4">
                    <h4 className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-stone-400 uppercase">
                      <User className="h-3 w-3" /> Thông tin khách hàng
                    </h4>
                    <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="border-b border-stone-100 p-6 md:border-r md:border-b-0">
                          <p className="mb-1 text-[10px] font-bold tracking-tighter text-stone-400 uppercase">
                            Họ và tên
                          </p>
                          <p className="font-serif text-xl text-stone-900">
                            {customerName || "N/A"}
                          </p>
                        </div>
                        <div className="p-6">
                          <p className="mb-1 text-[10px] font-bold tracking-tighter text-stone-400 uppercase">
                            Liên lạc
                          </p>
                          <p className="flex items-center gap-2 font-mono text-sm text-stone-600">
                            <Phone className="h-3 w-3" /> {customerPhone || "Chưa cập nhật"}
                          </p>
                        </div>
                      </div>
                      <div className="border-t border-stone-100 bg-stone-50 p-6">
                        <p className="mb-2 text-[10px] font-bold tracking-tighter text-stone-400 uppercase">
                          Địa chỉ giao hàng
                        </p>
                        <div className="flex gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                          <p className="text-sm leading-relaxed text-stone-600 italic">
                            {fullAddress || "Thông tin địa chỉ đang trống"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Items List */}
                  <div className="space-y-4">
                    <h4 className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-stone-400 uppercase">
                      <Package className="h-3 w-3" /> Chi tiết kiện hàng ({order.items?.length})
                    </h4>
                    <div className="space-y-3">
                      {order.items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 rounded-2xl border border-stone-100 bg-white/50 p-4 transition-all hover:bg-white hover:shadow-sm"
                        >
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-stone-100">
                            <ImageWithFallback
                              src={item.productVariantImage}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-stone-900">
                              {item.productName}
                            </p>
                            <p className="font-mono text-[10px] tracking-tighter text-stone-400 uppercase">
                              {item.sku}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-medium text-stone-400">
                              {item.quantity} x {formatVnd(item.price)}
                            </p>
                            <p className="text-sm font-bold text-stone-900">
                              {formatVnd(item.totalPrice)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Financial Block */}
                  <div className="rounded-[2.5rem] bg-stone-900 p-10 text-white shadow-xl">
                    <div className="space-y-4">
                      <div className="flex justify-between text-xs font-medium text-stone-500">
                        <span>Tổng giá trị sản phẩm</span>
                        <span>{formatVnd(order.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-medium text-stone-500">
                        <span>Chiết khấu (Coupon/Member)</span>
                        <span className="text-red-400">
                          -{formatVnd(order.discountAmount || 0)}
                        </span>
                      </div>
                      <div className="h-[1px] w-full bg-white/10" />
                      <div className="flex items-end justify-between pt-2">
                        <div>
                          <p className="text-[10px] font-bold tracking-widest text-stone-500 uppercase">
                            Thanh toán cuối cùng
                          </p>
                          <p className="mt-1 text-xs text-stone-400 italic">
                            {order.paymentMethod} • {order.paymentStatus}
                          </p>
                        </div>
                        <p className="font-serif text-4xl tracking-tighter text-white">
                          {formatVnd(order.finalAmount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {orderRow.invoiceId && (
                    <a
                      href={`/crm/invoice?invoiceId=${orderRow.invoiceId}`}
                      className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Hóa đơn {orderRow.invoiceCode || `#${orderRow.invoiceId}`}
                    </a>
                  )}
                </div>
              );
            }}
          </QueryBoundary>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-stone-100 bg-white/30 px-8 py-8">
          <div className="grid grid-cols-2 gap-3">
            {data?.status === "NEW" && (
              <Button
                onClick={() => data && onAdvance(data as OrderRow)}
                disabled={isAdvancing}
                className="col-span-2 rounded-full bg-stone-900 py-7 font-bold tracking-widest text-white uppercase shadow-lg transition-transform hover:scale-[1.01] active:scale-95"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" /> Xác nhận đơn
              </Button>
            )}

            {data?.status === "CONFIRMED" && (
              <Button
                onClick={() => data && onAdvance(data as OrderRow)}
                disabled={isAdvancing}
                className="col-span-2 rounded-full bg-stone-900 py-7 font-bold tracking-widest text-white uppercase shadow-lg transition-transform hover:scale-[1.01] active:scale-95"
              >
                <Truck className="mr-2 h-4 w-4" /> Giao hàng
              </Button>
            )}

            {data?.status === "SHIPPING" && (
              <Button
                onClick={() => data && onAdvance(data as OrderRow)}
                disabled={isAdvancing}
                className="col-span-2 rounded-full bg-emerald-600 py-7 font-bold tracking-widest text-white uppercase shadow-lg transition-transform hover:scale-[1.01]"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" /> Hoàn tất đơn hàng
              </Button>
            )}

            {data?.status === "COMPLETED" && data.paymentMethod === "COD" && (
              <p className="col-span-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                Hoàn tất sẽ ghi nhận đã thu tiền.
              </p>
            )}

            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-full border-stone-200 py-6 font-medium text-stone-500"
            >
              Đóng
            </Button>

          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
