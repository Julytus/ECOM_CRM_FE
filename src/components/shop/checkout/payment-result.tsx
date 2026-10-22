import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { CheckCircle2, Clock, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatVnd } from "@/lib/format";
import { retryPaymentMutationOptions } from "@/lib/tanstack/options/payment";
import type { components } from "@/lib/api/schema.gen";

type CheckoutResponse = components["schemas"]["CheckoutResponse"];
interface PaymentResultProps {
  result?: CheckoutResponse;
  orderCode: string;
  invoiceStatus: number;
  onRetry?: (result: CheckoutResponse) => void;
  isCod?: boolean;
}

export function PaymentResult({
  result,
  orderCode,
  invoiceStatus,
  onRetry,
  isCod = false
}: PaymentResultProps) {
  const queryClient = useQueryClient();
  const retryMutation = useMutation(retryPaymentMutationOptions());
  const success = isCod || invoiceStatus === 1;
  const refunded = invoiceStatus === 4;
  const title = isCod
    ? "Đặt hàng thành công"
    : success
      ? "Thanh toán thành công"
      : refunded
        ? "Đơn hàng đã được hoàn tiền"
        : "Thanh toán đã hết hạn hoặc bị hủy";
  const Icon = success ? CheckCircle2 : Clock;

  React.useEffect(() => {
    if (!success && invoiceStatus !== 2) return;
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: ["my-orders"] }),
      queryClient.invalidateQueries({ queryKey: ["cart-items"] })
    ]);
  }, [invoiceStatus, queryClient, success]);

  const retry = () => {
    if (!result?.invoiceId) return;
    retryMutation.mutate(result.invoiceId, {
      onSuccess: (retryResult) => {
        if (!retryResult) {
          toast.error("Không nhận được thông tin thanh toán mới.");
          return;
        }
        onRetry?.({
          ...result,
          checkoutUrl: retryResult.checkoutUrl ?? "",
          qrCode: retryResult.qrCode ?? ""
        });
      },
      onError: (error) => {
        const message = (error as AxiosError<{ message?: string }>).response?.data?.message;
        toast.error(
          message || (error instanceof Error ? error.message : "Không thể thanh toán lại.")
        );
      }
    });
  };

  const qrCode = result?.qrCode
    ? result.qrCode.startsWith("data:")
      ? result.qrCode
      : `data:image/png;base64,${result.qrCode}`
    : undefined;

  return (
    <section
      aria-labelledby="payment-result-title"
      className="bg-card text-card-foreground border-border mx-auto max-w-2xl rounded-2xl border p-6 text-center shadow-sm sm:p-8 md:p-12"
    >
      <span
        aria-hidden="true"
        className={`mx-auto mb-5 flex size-16 items-center justify-center rounded-full ${success ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}
      >
        <Icon className="size-8" />
      </span>
      <h1 id="payment-result-title" className="font-display text-foreground text-3xl font-semibold">
        {title}
      </h1>
      <p className="text-muted-foreground mx-auto mt-2 max-w-md leading-relaxed">
        {isCod
          ? "Vui lòng thanh toán khi nhận hàng."
          : success
            ? "Chúng tôi đã nhận được xác nhận thanh toán cho đơn hàng của bạn."
            : refunded
              ? "Khoản thanh toán đã được hoàn lại."
              : "Giao dịch chưa hoàn tất. Bạn có thể tạo một mã thanh toán mới."}
      </p>
      <dl className="bg-muted/50 border-border mx-auto mt-8 grid max-w-md grid-cols-2 gap-x-4 gap-y-3 rounded-xl border p-5 text-left text-sm">
        <dt className="text-muted-foreground">Mã đơn hàng</dt>
        <dd className="text-right font-semibold tabular-nums">
          {result?.orderCode || orderCode || "—"}
        </dd>
        {result?.invoiceCode && (
          <>
            <dt className="text-muted-foreground">Mã hóa đơn</dt>
            <dd className="text-right font-semibold tabular-nums">{result.invoiceCode}</dd>
          </>
        )}
        <dt className="text-muted-foreground">Tổng thanh toán</dt>
        <dd className="text-right font-bold tabular-nums">
          {result?.finalAmount === undefined ? "—" : formatVnd(result.finalAmount)}
        </dd>
        {success && !isCod && (
          <>
            <dt className="text-muted-foreground">Trạng thái</dt>
            <dd className="text-success text-right font-semibold">Đã thanh toán</dd>
          </>
        )}
        {result?.paymentMethod && (
          <>
            <dt className="text-muted-foreground">Phương thức</dt>
            <dd className="text-right font-semibold">
              {result.paymentMethod === "PAYOS"
                ? "Thanh toán trực tuyến (PayOS)"
                : "Thanh toán khi nhận hàng"}
            </dd>
          </>
        )}
      </dl>
      {!success && qrCode && (
        <img
          src={qrCode}
          alt="Mã QR thanh toán PayOS"
          className="border-border mx-auto mt-8 size-56 rounded-xl border bg-white p-3"
        />
      )}
      <div className="mx-auto mt-8 flex max-w-md flex-col gap-3">
        {!success && invoiceStatus === 2 && result?.invoiceId && (
          <Button
            size="lg"
            className="h-11 w-full rounded-full"
            onClick={retry}
            disabled={retryMutation.isPending}
          >
            {retryMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}Thanh toán
            lại
          </Button>
        )}
        {!success && result?.checkoutUrl && (
          <a
            className="text-primary inline-flex items-center justify-center gap-2 text-sm underline"
            href={result.checkoutUrl}
            target="_blank"
            rel="noreferrer"
          >
            Mở trang thanh toán <ExternalLink className="size-4" />
          </a>
        )}
        <Button asChild variant="outline" size="lg" className="h-11 w-full rounded-full">
          <a href="/">Tiếp tục mua sắm</a>
        </Button>
      </div>
    </section>
  );
}
