"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Receipt,
  Package,
  MapPin,
  CreditCard,
  AlertCircle,
  CheckCircle,
  MessageSquare
} from "lucide-react";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { orderByIdQueryOptions, updateOrderMutationOptions } from "@/lib/tanstack/options/order";
import { QueryBoundary } from "@/components/boundary";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatVnd } from "@/lib/format";
import type { OrderStatus } from "@/lib/types/order";
import { ImageWithFallback } from "@/components/image/image-with-fallback";
import { toast } from "sonner";
import { ReviewSheet } from "@/components/shop/profile/review-sheet";
import { Link } from "@tanstack/react-router";

interface OrderDetailSheetProps {
  orderId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailSheet({ orderId, open, onOpenChange }: OrderDetailSheetProps) {
  const queryClient = useQueryClient();
  const [showReview, setShowReview] = React.useState(false);

  const { data, status, error, refetch } = useQuery({
    ...orderByIdQueryOptions(orderId ?? 0),
    enabled: open && !!orderId
  });

  const updateStatusMutation = useMutation({ ...updateOrderMutationOptions() });

  const handleReceiveOrder = () => {
    // Open review sheet first, without changing order status yet
    setShowReview(true);
  };

  const handleReviewComplete = () => {
    updateStatusMutation.mutate({
      id: orderId,
      status: "COMPLETED",
      paymentStatus: data?.paymentStatus
    } as any);
    setShowReview(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="flex h-screen w-full flex-col p-0 sm:max-w-md md:max-w-lg"
        >
          <SheetHeader className="shrink-0 border-b p-6">
            <SheetTitle className="flex items-center gap-2 text-xl font-bold">
              <Receipt className="h-5 w-5 text-stone-900" />
              Chi tiết đơn hàng
            </SheetTitle>
            {data?.code && (
              <code className="mt-2 w-fit rounded bg-stone-100 px-2 py-1 font-mono text-xs text-stone-600">
                #{data.code}
              </code>
            )}
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <QueryBoundary data={data} status={status} error={error} onRetry={() => refetch()}>
              {(order) => (
                <div className="space-y-8 p-6">
                  {/* Status & Date */}
                  <div className="space-y-4">
                    {/* First Row: Order Status & Date */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl border bg-stone-50/50 p-4">
                        <p className="mb-1 text-[10px] font-bold tracking-widest text-stone-400 uppercase">
                          Trạng thái đơn hàng
                        </p>
                        <Badge
                          variant="outline"
                          className="border-stone-200 bg-white font-bold text-stone-700"
                        >
                          {order.status}
                        </Badge>
                      </div>

                      <div className="rounded-xl border bg-stone-50/50 p-4 text-right">
                        <p className="mb-1 text-[10px] font-bold tracking-widest text-stone-400 uppercase">
                          Ngày đặt
                        </p>
                        <p className="text-sm font-medium text-stone-900">
                          {new Date(order.createdAt ?? 0).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>

                    {/* Second Row: Payment Status & Payment Method */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl border bg-stone-50/50 p-4">
                        <p className="mb-1 text-[10px] font-bold tracking-widest text-stone-400 uppercase">
                          Thanh toán
                        </p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "border-stone-200 bg-white font-bold",
                            order.paymentStatus === "PAID" ? "text-emerald-600" : "text-amber-600"
                          )}
                        >
                          {order.paymentStatus}
                        </Badge>
                      </div>

                      <div className="rounded-xl border bg-stone-50/50 p-4 text-right">
                        <p className="mb-1 text-[10px] font-bold tracking-widest text-stone-400 uppercase">
                          Phương thức
                        </p>
                        <p className="text-sm font-medium text-stone-900">{order.paymentMethod}</p>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-4">
                    <h4 className="flex items-center gap-2 text-xs font-bold tracking-widest text-stone-500 uppercase">
                      <Package className="h-4 w-4" /> Sản phẩm ({order.items?.length})
                    </h4>
                    <div className="divide-y overflow-hidden rounded-xl border bg-white">
                      {order.items?.map((item) => (
                        <Link to="/product/$id" params={{ id: String(item.productId) }}>
                          <div key={item.id} className="flex gap-4 p-4">
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-stone-50">
                              <ImageWithFallback
                                src={item.productVariantImage}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex flex-1 flex-col justify-center">
                              <p className="text-sm font-bold text-stone-900">{item.productName}</p>
                              <p className="text-xs text-stone-400">
                                {item.quantity} x {formatVnd(item.price)}
                              </p>
                              <p className="mt-1 text-sm font-black text-stone-900">
                                {formatVnd(item.totalPrice)}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="rounded-2xl bg-stone-900 p-6 text-white shadow-lg">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-stone-400">
                        <span>Tạm tính</span>
                        <span>{formatVnd(order.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between text-red-400">
                        <span>Giảm giá</span>
                        <span>-{formatVnd(order.discountAmount || 0)}</span>
                      </div>
                      <Separator className="my-2 bg-white/10" />
                      <div className="flex items-end justify-between">
                        <span className="font-bold">Tổng thanh toán</span>
                        <span className="font-serif text-2xl font-medium text-white">
                          {formatVnd(order.finalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </QueryBoundary>
          </div>

          {/* Fixed Action Footer */}
          <div className="border-t bg-white p-6">
            <div className="flex flex-col gap-3">
              {/* PRIMARY ACTION: RECEIVE ORDER - Opens review first */}
              {data?.status === "SHIPPING" && (
                <Button
                  className="h-12 w-full rounded-full bg-emerald-600 font-bold tracking-widest text-white uppercase shadow-md hover:bg-emerald-700"
                  onClick={handleReceiveOrder}
                  disabled={updateStatusMutation.isPending}
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> Đã nhận được hàng
                </Button>
              )}

              {/* SECONDARY ACTION: REVIEW (Only visible if completed and hasn't reviewed yet) */}
              {/* {data?.status === "COMPLETED" && (
                <Button
                  className="h-12 w-full rounded-full bg-stone-900 font-bold tracking-widest text-white uppercase shadow-md hover:bg-stone-800"
                  onClick={() => setShowReview(true)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" /> Đánh giá ngay
                </Button>
              )} */}

              {/* DANGER ACTION: CANCEL */}
              {data?.status === "NEW" && (
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-full border-red-100 text-red-500 hover:bg-red-50"
                  onClick={() =>
                    updateStatusMutation.mutate({
                      id: orderId,
                      status: "CANCELLED",
                      paymentStatus: data.paymentStatus
                    } as any)
                  }
                >
                  <AlertCircle className="mr-2 h-4 w-4" /> Hủy đơn hàng
                </Button>
              )}

              <Button
                variant="ghost"
                className="h-12 w-full rounded-full text-stone-400"
                onClick={() => onOpenChange(false)}
              >
                Đóng
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Review Sheet Overlay - Pass completion handler */}
      {data?.items && (
        <ReviewSheet
          items={data.items}
          open={showReview}
          onOpenChange={setShowReview}
          onReviewSubmitted={handleReviewComplete}
          orderId={data.id}
        />
      )}
    </>
  );
}
