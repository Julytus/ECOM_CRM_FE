"use client";

import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, CreditCard, MapPin, Package, Receipt } from "lucide-react";
import { toast } from "sonner";

import { QueryBoundary } from "@/components/boundary";
import { ImageWithFallback } from "@/components/image/image-with-fallback";
import { CancelOrderDialog } from "@/components/shop/profile/cancel-order-dialog";
import { PaymentResult } from "@/components/shop/checkout/payment-result";
import { PaymentWaiting } from "@/components/shop/checkout/payment-waiting";
import { ReviewSheet } from "@/components/shop/profile/review-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatVnd } from "@/lib/format";
import type { components } from "@/lib/api/schema.gen";
import type { OrderDTO, OrderItemDTO } from "@/lib/types/order";
import { myOrderDetailQueryOptions, updateOrderMutationOptions } from "@/lib/tanstack/options/order";
import { retryPaymentMutationOptions } from "@/lib/tanstack/options/payment";
import { Link } from "@tanstack/react-router";

type Order = components["schemas"]["OrderResponse"];
type CheckoutResponse = components["schemas"]["CheckoutResponse"];

interface OrderDetailSheetProps {
  orderId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailSheet({ orderId, open, onOpenChange }: OrderDetailSheetProps) {
  const [showReview, setShowReview] = React.useState(false);
  const [showCancel, setShowCancel] = React.useState(false);
  const [checkout, setCheckout] = React.useState<CheckoutResponse | null>(null);
  const [paymentStartedAt, setPaymentStartedAt] = React.useState<number | null>(null);
  const [invoiceStatus, setInvoiceStatus] = React.useState<number | undefined>();
  const [paymentExpired, setPaymentExpired] = React.useState(false);

  const { data, status, error, refetch } = useQuery({
    ...myOrderDetailQueryOptions(orderId ?? 0),
    enabled: open && !!orderId
  });
  const retryMutation = useMutation(retryPaymentMutationOptions());
  const updateStatusMutation = useMutation(updateOrderMutationOptions());

  React.useEffect(() => {
    setCheckout(null);
    setPaymentStartedAt(null);
    setInvoiceStatus(undefined);
    setPaymentExpired(false);
  }, [orderId]);

  const handleRetryPayment = (order: Order) => {
    const invoiceId = order.invoiceId;
    if (invoiceId === undefined) return;
    retryMutation.mutate(invoiceId, {
      onSuccess: (result) => {
        if (!result) {
          toast.error("Không nhận được thông tin thanh toán mới.");
          return;
        }
        setCheckout({
          orderId: order.id,
          orderCode: order.code,
          invoiceId,
          invoiceCode: order.invoiceCode,
          finalAmount: order.finalAmount,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          checkoutUrl: result.checkoutUrl ?? "",
          qrCode: result.qrCode ?? ""
        });
        setPaymentStartedAt(Date.now());
        setInvoiceStatus(3);
        setPaymentExpired(false);
      }
    });
  };

  const handleReviewComplete = () => {
    if (orderId === null) return;
    updateStatusMutation.mutate(
      { id: orderId, status: "COMPLETED", paymentStatus: data?.paymentStatus } as unknown as OrderDTO,
      { onSuccess: () => setShowReview(false) }
    );
  };

  const waitingForPayment = checkout && paymentStartedAt !== null && invoiceStatus === 3 && !paymentExpired;
  const showPaymentResult = checkout && (paymentExpired || (invoiceStatus !== undefined && invoiceStatus !== 3));

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="flex h-screen w-full flex-col p-0 sm:max-w-md md:max-w-lg">
          <SheetHeader className="shrink-0 border-b p-6">
            <SheetTitle className="flex items-center gap-2 text-xl font-bold">
              <Receipt className="h-5 w-5 text-stone-900" />
              {waitingForPayment || showPaymentResult ? "Thanh toán đơn hàng" : "Chi tiết đơn hàng"}
            </SheetTitle>
            {data?.code && <code className="mt-2 w-fit rounded bg-stone-100 px-2 py-1 font-mono text-xs text-stone-600">#{data.code}</code>}
          </SheetHeader>

          {waitingForPayment && checkout ? (
            <div className="flex-1 overflow-y-auto p-5">
              <PaymentWaiting
                result={checkout}
                startedAt={paymentStartedAt!}
                onStatusChange={setInvoiceStatus}
                onExpired={() => setPaymentExpired(true)}
              />
            </div>
          ) : showPaymentResult && checkout ? (
            <div className="flex-1 overflow-y-auto p-5">
              <PaymentResult
                result={checkout}
                orderCode={checkout.orderCode ?? ""}
                invoiceStatus={invoiceStatus === 1 || invoiceStatus === 4 ? invoiceStatus : 2}
                onRetry={(result) => {
                  setCheckout(result);
                  setPaymentStartedAt(Date.now());
                  setInvoiceStatus(3);
                  setPaymentExpired(false);
                }}
              />
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto">
                <QueryBoundary data={data} status={status} error={error} onRetry={() => refetch()}>
                  {(order) => <OrderDetailContent order={order} />}
                </QueryBoundary>
              </div>
              <div className="border-t bg-white p-6">
                <div className="flex flex-col gap-3">
                  {data?.status === "NEW" && data.paymentStatus === "UNPAID" && (
                    <Button variant="outline" className="h-12 w-full rounded-full border-red-100 text-red-500 hover:bg-red-50" onClick={() => setShowCancel(true)}>
                      <AlertCircle className="mr-2 h-4 w-4" /> Hủy đơn hàng
                    </Button>
                  )}
                  {data?.paymentMethod === "PAYOS" && data.paymentStatus === "UNPAID" && data.invoiceId !== undefined && (
                    <Button className="h-12 w-full rounded-full" onClick={() => handleRetryPayment(data)} disabled={retryMutation.isPending}>
                      <CreditCard className="mr-2 h-4 w-4" /> Thanh toán lại
                    </Button>
                  )}
                  {data?.status === "SHIPPING" && (
                    <Button className="h-12 w-full rounded-full bg-emerald-600 font-bold text-white hover:bg-emerald-700" onClick={() => setShowReview(true)} disabled={updateStatusMutation.isPending}>
                      <CheckCircle className="mr-2 h-4 w-4" /> Đã nhận được hàng
                    </Button>
                  )}
                  <Button variant="ghost" className="h-12 w-full rounded-full text-stone-400" onClick={() => onOpenChange(false)}>Đóng</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      {data?.items && (
        <ReviewSheet
          items={toReviewItems(data.items)}
          open={showReview}
          onOpenChange={setShowReview}
          onReviewSubmitted={handleReviewComplete}
          orderId={data.id ?? orderId ?? 0}
        />
      )}
      <CancelOrderDialog
        open={showCancel}
        orderId={orderId}
        orderCode={data?.code}
        onOpenChange={setShowCancel}
      />
    </>
  );
}

function OrderDetailContent({ order }: { order: Order }) {
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-2 gap-3">
        <InfoCard label="Trạng thái đơn hàng"><Badge variant="outline">{order.status ?? "Không rõ"}</Badge></InfoCard>
        <InfoCard label="Thanh toán"><Badge variant="outline">{order.paymentStatus ?? "Không rõ"}</Badge></InfoCard>
        <InfoCard label="Ngày tạo">{formatDate(order.createdAt)}</InfoCard>
        <InfoCard label="Phương thức">{order.paymentMethod ?? "—"}</InfoCard>
      </div>

      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-bold"><MapPin className="h-4 w-4" /> Người nhận</h3>
        <div className="rounded-xl border p-4 text-sm">
          <p className="font-semibold">{order.receiverName ?? order.buyerName ?? "—"}</p>
          <p className="text-muted-foreground">{order.receiverPhone ?? order.buyerPhone ?? "—"}</p>
          <p className="mt-1">{order.address ?? "—"}</p>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-bold"><Package className="h-4 w-4" /> Sản phẩm ({order.items?.length ?? 0})</h3>
        <div className="divide-y overflow-hidden rounded-xl border bg-white">
          {order.items?.map((item, index) => (
            <Link key={item.id ?? `${item.productId}-${index}`} to="/product/$id" params={{ id: String(item.productId ?? "") }} className="flex gap-4 p-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-stone-50">
                <ImageWithFallback src={item.productVariantImage} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col justify-center">
                <p className="text-sm font-bold text-stone-900">{item.productName}</p>
                <p className="text-xs text-stone-400">{item.quantity} x {formatVnd(item.price ?? 0)}</p>
                <p className="mt-1 text-sm font-black text-stone-900">{formatVnd(item.totalPrice ?? 0)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {(order.voucherCode || order.voucherId !== undefined) && (
        <InfoCard label="Voucher">{order.voucherCode ?? `#${order.voucherId}`}</InfoCard>
      )}

      {order.invoice && (
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold"><Receipt className="h-4 w-4" /> Hóa đơn</h3>
          <div className="grid grid-cols-2 gap-3 rounded-xl border p-4 text-sm">
            <div><p className="text-muted-foreground">Mã hóa đơn</p><p className="font-medium">{order.invoice.invoiceCode ?? order.invoiceCode ?? "—"}</p></div>
            <div><p className="text-muted-foreground">Trạng thái</p><p className="font-medium">{order.invoice.status ?? order.invoiceStatus ?? "—"}</p></div>
            <div><p className="text-muted-foreground">Tạo lúc</p><p className="font-medium">{formatDate(order.invoice.createdTime)}</p></div>
            <div><p className="text-muted-foreground">Cập nhật lúc</p><p className="font-medium">{formatDate(order.invoice.updatedTime)}</p></div>
          </div>
        </section>
      )}

      {Boolean(order.payments?.length) && (
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold"><CreditCard className="h-4 w-4" /> Lịch sử thanh toán</h3>
          <div className="divide-y rounded-xl border">
            {order.payments?.map((payment, index) => (
              <div key={payment.id ?? index} className="flex items-start justify-between gap-3 p-4 text-sm">
                <div><p className="font-medium">{payment.paymentProvider ?? payment.paymentType ?? "Thanh toán"} · {payment.status ?? "—"}</p><p className="text-muted-foreground">{formatDate(payment.createdTime)}{payment.updatedTime ? ` · cập nhật ${formatDate(payment.updatedTime)}` : ""}</p></div>
                <span className="font-semibold">{formatVnd(payment.amount ?? 0)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="rounded-2xl bg-stone-900 p-5 text-white">
        <div className="space-y-2 text-sm">
          <SummaryRow label="Tạm tính" value={formatVnd(order.totalAmount ?? 0)} />
          <SummaryRow label="Giảm giá" value={`-${formatVnd(order.discountAmount ?? 0)}`} />
          {order.shippingFee !== undefined && <SummaryRow label="Phí vận chuyển" value={formatVnd(order.shippingFee)} />}
          <Separator className="my-2 bg-white/10" />
          <SummaryRow label="Tổng thanh toán" value={formatVnd(order.finalAmount ?? 0)} strong />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="rounded-xl border bg-stone-50/50 p-4"><p className="mb-2 text-[10px] font-bold tracking-widest text-stone-400 uppercase">{label}</p><div className="text-sm font-medium">{children}</div></div>;
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className={`flex justify-between ${strong ? "items-end font-bold text-white" : "text-stone-300"}`}><span>{label}</span><span className={strong ? "font-serif text-xl" : ""}>{value}</span></div>;
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleString("vi-VN") : "—";
}

function toReviewItems(items: NonNullable<Order["items"]>): OrderItemDTO[] {
  return items.map((item, index) => ({
    id: item.id ?? index,
    orderId: item.orderId ?? null,
    productId: item.productId ?? 0,
    productName: item.productName ?? "Sản phẩm",
    productVariantId: item.productVariantId ?? 0,
    sku: item.sku ?? "",
    productVariantImage: item.productVariantImage ?? "",
    price: item.price ?? 0,
    quantity: item.quantity ?? 0,
    totalPrice: item.totalPrice ?? 0
  }));
}
