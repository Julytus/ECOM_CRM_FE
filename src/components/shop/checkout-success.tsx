import { CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatVnd } from "@/lib/format";
import type { components } from "@/lib/api/schema.gen";

type CheckoutResponse = components["schemas"]["CheckoutResponse"];

interface CheckoutSuccessProps {
  result: CheckoutResponse;
  paymentConfirmed: boolean;
}

export function CheckoutSuccess({ result, paymentConfirmed }: CheckoutSuccessProps) {
  const isPayos = result.paymentMethod === "PAYOS";
  const qrCode = result.qrCode
    ? result.qrCode.startsWith("data:")
      ? result.qrCode
      : `data:image/png;base64,${result.qrCode}`
    : undefined;

  return (
    <section className="mx-auto max-w-2xl rounded-2xl border bg-card p-8 text-center shadow-sm md:p-12">
      <CheckCircle2 className="text-primary mx-auto mb-4 size-14" />
      <h1 className="text-2xl font-bold">{paymentConfirmed ? "Thanh toán thành công" : "Đặt hàng thành công"}</h1>
      <p className="text-muted-foreground mt-2">
        {isPayos
          ? paymentConfirmed
            ? "Chúng tôi đã nhận được xác nhận thanh toán cho đơn hàng của bạn."
            : "Quét mã QR hoặc mở trang thanh toán để hoàn tất đơn hàng."
          : "Vui lòng thanh toán khi nhận hàng."}
      </p>

      <dl className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-4 rounded-xl bg-muted/50 p-5 text-left text-sm">
        <dt className="text-muted-foreground">Mã đơn hàng</dt>
        <dd className="text-right font-semibold">{result.orderCode || "—"}</dd>
        <dt className="text-muted-foreground">Mã hóa đơn</dt>
        <dd className="text-right font-semibold">{result.invoiceCode || "—"}</dd>
        <dt className="text-muted-foreground">Tổng thanh toán</dt>
        <dd className="text-primary text-right font-bold">
          {result.finalAmount === undefined ? "—" : formatVnd(result.finalAmount)}
        </dd>
        {!isPayos && <dt className="col-span-2 text-center font-semibold">Thanh toán khi nhận hàng</dt>}
      </dl>

      {isPayos && !paymentConfirmed && qrCode && (
        <img src={qrCode} alt="Mã QR thanh toán PayOS" className="mx-auto mt-8 size-56 rounded-lg border p-2" />
      )}
      {isPayos && !paymentConfirmed && result.checkoutUrl && (
        <Button asChild className="mt-6">
          <a href={result.checkoutUrl} target="_blank" rel="noreferrer">
            Mở trang thanh toán <ExternalLink className="ml-2 size-4" />
          </a>
        </Button>
      )}
      <Button asChild variant="outline" className="mt-6 block w-full">
        <a href="/">Tiếp tục mua sắm</a>
      </Button>
    </section>
  );
}
