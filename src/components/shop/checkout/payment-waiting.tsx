import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { ErrorResponseWarper } from "@/lib/types/common";
import { Button } from "@/components/ui/button";
import { paymentStatusQueryOptions } from "@/lib/tanstack/options/payment";
import type { components } from "@/lib/api/schema.gen";

type CheckoutResponse = components["schemas"]["CheckoutResponse"];
const PAYMENT_WINDOW_MS = 30 * 60 * 1_000;

interface PaymentWaitingProps {
  result: CheckoutResponse;
  startedAt: number;
  refreshSignal?: number;
  onStatusChange: (status: number | undefined) => void;
  onExpired: () => void;
}

export function PaymentWaiting({
  result,
  startedAt,
  refreshSignal = 0,
  onStatusChange,
  onExpired
}: PaymentWaitingProps) {
  const orderCode = result.orderCode ?? "";
  const queryClient = useQueryClient();
  const query = useQuery(paymentStatusQueryOptions(orderCode, { startedAt }));
  const [remainingMs, setRemainingMs] = React.useState(() =>
    Math.max(0, startedAt + PAYMENT_WINDOW_MS - Date.now())
  );

  React.useEffect(() => {
    if (refreshSignal === 0) return;
    void queryClient.refetchQueries({ queryKey: ["payment-status", orderCode], exact: true });
  }, [orderCode, queryClient, refreshSignal]);

  React.useEffect(() => {
    onStatusChange(query.data?.invoiceStatus);
  }, [onStatusChange, query.data?.invoiceStatus]);

  React.useEffect(() => {
    if (query.error) toast.error(ErrorResponseWarper(query.error));
  }, [query.error]);

  React.useEffect(() => {
    const updateCountdown = () => {
      const nextRemainingMs = Math.max(0, startedAt + PAYMENT_WINDOW_MS - Date.now());
      setRemainingMs(nextRemainingMs);
      if (nextRemainingMs === 0) onExpired();
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1_000);
    return () => window.clearInterval(intervalId);
  }, [onExpired, startedAt]);

  const minutes = Math.floor(remainingMs / 60_000);
  const seconds = Math.floor((remainingMs % 60_000) / 1_000);
  const qrCode = result.qrCode
    ? result.qrCode.startsWith("data:")
      ? result.qrCode
      : `data:image/png;base64,${result.qrCode}`
    : undefined;

  return (
    <section
      aria-labelledby="payment-waiting-title"
      className="bg-card text-card-foreground border-border mx-auto max-w-2xl rounded-2xl border p-6 text-center shadow-sm sm:p-8 md:p-12"
    >
      <span
        aria-hidden="true"
        className="bg-warning/10 text-warning mx-auto mb-5 flex size-16 items-center justify-center rounded-full"
      >
        <Clock className="size-8" />
      </span>
      <h1
        id="payment-waiting-title"
        className="font-display text-foreground text-3xl font-semibold"
      >
        Đang chờ thanh toán
      </h1>
      <p className="text-muted-foreground mx-auto mt-2 max-w-md leading-relaxed">
        Quét mã QR hoặc mở trang thanh toán để hoàn tất đơn hàng.
      </p>
      <p role="timer" aria-label="Thời gian còn lại" className="mt-5 font-semibold tabular-nums">
        Hết hạn sau {minutes}:{String(seconds).padStart(2, "0")}
      </p>
      {qrCode && (
        <img
          src={qrCode}
          alt="Mã QR thanh toán PayOS"
          className="border-border mx-auto mt-6 size-56 rounded-xl border bg-white p-3"
        />
      )}
      <div className="mx-auto mt-6 flex max-w-md flex-col gap-3">
        {result.checkoutUrl && (
          <Button asChild size="lg" className="h-11 w-full rounded-full">
            <a href={result.checkoutUrl} target="_blank" rel="noreferrer">
              Mở trang thanh toán <ExternalLink aria-hidden="true" className="size-4" />
              <span className="sr-only">(mở trong tab mới)</span>
            </a>
          </Button>
        )}
        <p className="text-muted-foreground text-sm" aria-live="polite">
          Trạng thái được cập nhật tự động.
        </p>
      </div>
    </section>
  );
}
