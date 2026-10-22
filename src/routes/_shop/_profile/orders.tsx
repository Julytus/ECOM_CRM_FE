"use client";

import { useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Clock, CreditCard, Package } from "lucide-react";

import { QueryBoundary } from "@/components/boundary";
import { OrderDetailSheet } from "@/components/shop/profile/order-details-sheet";
import { ProfileNavigation } from "@/components/shop/profile/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PageWrapper } from "@/components/layout/page-warper";
import { meQueryOptions } from "@/lib/tanstack/options/auth";
import { myOrdersInfiniteQueryOptions } from "@/lib/tanstack/options/order";
import type { components } from "@/lib/api/schema.gen";
import { cn } from "@/lib/utils";

type Order = components["schemas"]["OrderResponse"];
type OrderStatus = NonNullable<Order["status"]>;

export const Route = createFileRoute("/_shop/_profile/orders")({ component: OrdersPage });

function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const { data: me, status: meStatus, error: meError, refetch: refetchMe } = useQuery(meQueryOptions);
  const {
    data,
    status: ordersStatus,
    error: ordersError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchOrders
  } = useInfiniteQuery(
    myOrdersInfiniteQueryOptions({
      limit: 5,
      ...(statusFilter !== "ALL" ? { orderStatus: statusFilter } : {})
    })
  );
  const orders = data?.pages.flatMap((page) => page.items ?? []) ?? [];

  return (
    <PageWrapper
      title="Đơn hàng của tôi"
      image="/page-title/page-title-5.jpg"
      breadcrumbItems={[
        { label: "Trang chủ", href: "/" },
        { label: "Tài khoản", href: "/profile" },
        { label: "Đơn hàng" }
      ]}
    >
      <div className="container mx-auto px-4 py-12 md:py-20">
        <QueryBoundary data={me} status={meStatus} error={meError} onRetry={() => refetchMe()}>
          {(user) => (
            <div className="flex flex-col gap-8 md:flex-row md:gap-12">
              <ProfileNavigation user={user ?? undefined} />
              <main className="flex-1">
                <div className="bg-card rounded-xl border p-6 shadow-sm md:p-10">
                  <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <h4 className="text-2xl font-bold tracking-tight uppercase">Lịch sử đơn hàng</h4>
                      <p className="text-muted-foreground text-sm">
                        Theo dõi và quản lý các đơn hàng bạn đã đặt.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium whitespace-nowrap">Lọc:</span>
                      <Select
                        value={statusFilter}
                        onValueChange={(value) => setStatusFilter(value as OrderStatus | "ALL")}
                      >
                        <SelectTrigger className="w-[160px] rounded-full">
                          <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">Tất cả</SelectItem>
                          <SelectItem value="NEW">Chờ xử lý</SelectItem>
                          <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                          <SelectItem value="SHIPPING">Đang giao</SelectItem>
                          <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                          <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                          <SelectItem value="REFUNDED">Đã hoàn tiền</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </header>
                  <Separator className="mb-8" />
                  <QueryBoundary
                    data={orders}
                    status={ordersStatus}
                    error={ordersError}
                    onRetry={() => refetchOrders()}
                    emptyFallback={
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-muted-foreground mb-4">Bạn chưa có đơn hàng nào.</p>
                        <Button variant="outline" onClick={() => setStatusFilter("ALL")}>
                          Xem tất cả đơn hàng
                        </Button>
                      </div>
                    }
                    hasNextPage={hasNextPage}
                    fetchNextPage={fetchNextPage}
                    renderLoadMore={(fetchNext) => (
                      <Button
                        variant="ghost"
                        onClick={() => fetchNext()}
                        disabled={isFetchingNextPage}
                        className="mt-4 w-full"
                      >
                        {isFetchingNextPage ? "Đang tải..." : "Xem thêm đơn hàng"}
                      </Button>
                    )}
                  >
                    {(items) => (
                      <div className="grid gap-4">
                        {items.map((order) => (
                          <OrderListItem
                            key={order.id}
                            order={order}
                            onClick={() => order.id !== undefined && setSelectedOrderId(order.id)}
                          />
                        ))}
                      </div>
                    )}
                  </QueryBoundary>
                </div>
              </main>
            </div>
          )}
        </QueryBoundary>
      </div>
      <OrderDetailSheet
        orderId={selectedOrderId}
        open={selectedOrderId !== null}
        onOpenChange={(open) => !open && setSelectedOrderId(null)}
      />
    </PageWrapper>
  );
}

const getOrderStatusStyle = (status?: string) => {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "NEW":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "CANCELLED":
    case "REFUNDED":
      return "bg-red-100 text-red-700 border-red-200";
    case "SHIPPING":
      return "bg-amber-100 text-amber-700 border-amber-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const getPaymentStatusStyle = (status?: string) => {
  switch (status) {
    case "PAID":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "UNPAID":
      return "bg-amber-100 text-amber-700 border-amber-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

function OrderListItem({ order, onClick }: { order: Order; onClick: () => void }) {
  const orderStatusStyle = getOrderStatusStyle(order.status);
  const paymentStatusStyle = getPaymentStatusStyle(order.paymentStatus);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Đơn hàng ${order.code ?? order.id}`}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className="group bg-card hover:border-primary/40 relative flex cursor-pointer flex-col gap-4 rounded-xl border p-4 transition-all hover:shadow-md md:flex-row md:items-center md:justify-between md:p-6"
    >
      <div className="flex items-center gap-4">
        <div className={cn("hidden h-12 w-12 items-center justify-center rounded-full border sm:flex", orderStatusStyle)}>
          <Package size={20} />
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-bold tracking-tight">#{order.code ?? order.id}</span>
            <Badge variant="outline" className={cn("rounded-full border px-2 py-0 text-[10px] font-bold uppercase", orderStatusStyle)}>
              {order.status ?? "Không rõ"}
            </Badge>
          </div>
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Clock size={12} />
            <span>Ngày tạo: {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "—"}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-between border-t pt-4 md:justify-end md:gap-12 md:border-none md:pt-0">
        <div className="space-y-1 md:text-right">
          <p className="text-muted-foreground flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase md:justify-end">
            <CreditCard size={10} /> Thanh toán
          </p>
          <Badge variant="outline" className={cn("font-bold", paymentStatusStyle)}>
            {order.paymentStatus ?? "Không rõ"}
          </Badge>
        </div>
        <div className="space-y-1 text-right">
          <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">Tổng tiền</p>
          <p className="text-primary text-lg font-black tracking-tight">
            {(order.finalAmount ?? 0).toLocaleString("vi-VN")}
            <span className="text-muted-foreground ml-1 text-sm font-normal">₫</span>
          </p>
        </div>
        <div className="hidden md:block">
          <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full transition-transform group-hover:translate-x-1">
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>
      <div className="md:hidden">
        <Button variant="outline" className="w-full rounded-lg">Xem chi tiết đơn hàng</Button>
      </div>
    </div>
  );
}
