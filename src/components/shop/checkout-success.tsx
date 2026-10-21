import { Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatVnd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { components } from "@/lib/api/schema.gen";

type CheckoutResponse = components["schemas"]["CheckoutResponse"];

interface CheckoutSuccessProps {
  result: CheckoutResponse;
  paymentConfirmed: boolean;
}

export function CheckoutSuccess({ result, paymentConfirmed }: CheckoutSuccessProps) {
  const isPayos = result.paymentMethod === "PAYOS";
  const awaitingPayment = isPayos && !paymentConfirmed;
  const qrCode = result.qrCode
    ? result.qrCode.startsWith("data:")
      ? result.qrCode
      : `data:image/png;base64,${result.qrCode}`
    : undefined;

  const StatusIcon = awaitingPayment ? Clock : CheckCircle2;

  return (
    <section
      aria-labelledby="checkout-success-title"
      className="bg-card text-card-foreground border-border mx-auto max-w-2xl rounded-2xl border p-6 text-center shadow-sm sm:p-8 md:p-12"
    >
      <span
        aria-hidden="true"
        className={cn(
          "mx-auto mb-5 flex size-16 items-center justify-center rounded-full",
          awaitingPayment ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
        )}
      >
        <StatusIcon className="size-8" />
      </span>
      {/* role=status so the PayOS socket confirmation is announced when the title flips. */}
      <div role="status" aria-live="polite">
        <h1
          id="checkout-success-title"
          className="font-display text-foreground text-3xl font-semibold text-balance"
        >
          {paymentConfirmed ? "Thanh toán thành công" : "Đặt hàng thành công"}
        </h1>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md leading-relaxed">
          {isPayos
            ? paymentConfirmed
              ? "Chúng tôi đã nhận được xác nhận thanh toán cho đơn hàng của bạn."
              : "Quét mã QR hoặc mở trang thanh toán để hoàn tất đơn hàng."
            : "Vui lòng thanh toán khi nhận hàng."}
        </p>
      </div>

      <dl className="bg-muted/50 border-border mx-auto mt-8 grid max-w-md grid-cols-2 gap-x-4 gap-y-3 rounded-xl border p-5 text-left text-sm">
        <dt className="text-muted-foreground">Mã đơn hàng</dt>
        <dd className="text-right font-semibold tabular-nums">{result.orderCode || "—"}</dd>
        <dt className="text-muted-foreground">Mã hóa đơn</dt>
        <dd className="text-right font-semibold tabular-nums">{result.invoiceCode || "—"}</dd>
        <dt className="text-muted-foreground">Tổng thanh toán</dt>
        <dd className="text-foreground text-right font-bold tabular-nums">
          {result.finalAmount === undefined ? "—" : formatVnd(result.finalAmount)}
        </dd>
        <dt className="text-muted-foreground">Phương thức</dt>
        <dd className="text-right font-semibold">
          {isPayos ? "Thanh toán trực tuyến (PayOS)" : "Thanh toán khi nhận hàng"}
        </dd>
      </dl>

      {awaitingPayment && qrCode && (
        // QR stays on a white tile in both themes so scanners keep full contrast.
        <img
          src={qrCode}
          alt="Mã QR thanh toán PayOS"
          className="border-border mx-auto mt-8 size-56 rounded-xl border bg-white p-3"
        />
      )}
      <div className="mx-auto mt-8 flex max-w-md flex-col gap-3">
        {awaitingPayment && result.checkoutUrl && (
          <Button asChild size="lg" className="h-11 w-full rounded-full">
            <a href={result.checkoutUrl} target="_blank" rel="noreferrer">
              Mở trang thanh toán <ExternalLink aria-hidden="true" className="size-4" />
              <span className="sr-only">(mở trong tab mới)</span>
            </a>
          </Button>
        )}
        <Button asChild variant="outline" size="lg" className="h-11 w-full rounded-full">
          <Link to="/">Tiếp tục mua sắm</Link>
        </Button>
      </div>
    </section>
  );
}
