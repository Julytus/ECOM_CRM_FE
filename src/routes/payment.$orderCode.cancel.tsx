import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PaymentWaiting } from "@/components/shop/checkout/payment-waiting";
import { PaymentResult } from "@/components/shop/checkout/payment-result";
import { paymentStatusQueryOptions } from "@/lib/tanstack/options/payment";
import { ErrorResponseWarper } from "@/lib/types/common";
import type { components } from "@/lib/api/schema.gen";

type CheckoutResponse = components["schemas"]["CheckoutResponse"];
const PAYMENT_WINDOW_MS = 30 * 60 * 1_000;

export const Route = createFileRoute("/payment/$orderCode/cancel")({
  component: PaymentCancelPage
});

function PaymentCancelPage() {
  const { orderCode } = Route.useParams();
  const [startedAt, setStartedAt] = React.useState(() => Date.now());
  const [invoiceStatus, setInvoiceStatus] = React.useState<number | undefined>();
  const [expired, setExpired] = React.useState(false);
  const [payment, setPayment] = React.useState<CheckoutResponse>({
    orderCode,
    paymentMethod: "PAYOS"
  });
  const queryClient = useQueryClient();
  const query = useQuery({
    ...paymentStatusQueryOptions(orderCode, { startedAt }),
    refetchInterval: false
  });

  React.useEffect(() => {
    if (query.data?.invoiceStatus !== undefined) setInvoiceStatus(query.data.invoiceStatus);
    const invoiceId = query.data?.invoiceId;
    if (invoiceId !== undefined) setPayment((current) => ({ ...current, invoiceId }));
  }, [query.data?.invoiceId, query.data?.invoiceStatus]);
  React.useEffect(() => {
    if (query.error) toast.error(ErrorResponseWarper(query.error));
  }, [query.error]);

  if (query.isPending)
    return (
      <main className="text-muted-foreground container mx-auto flex min-h-[70vh] items-center justify-center px-4">
        Đang xác minh thanh toán…
      </main>
    );
  if (query.isError)
    return (
      <main className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4">
        <p>Không thể xác minh trạng thái thanh toán.</p>
        <Button asChild variant="outline">
          <Link to="/">Về cửa hàng</Link>
        </Button>
      </main>
    );

  if (
    (invoiceStatus !== undefined && invoiceStatus !== 3) ||
    expired ||
    Date.now() - startedAt >= PAYMENT_WINDOW_MS
  ) {
    return (
      <main className="container mx-auto px-4 py-12">
        <PaymentResult
          result={payment}
          orderCode={orderCode}
          invoiceStatus={invoiceStatus !== undefined && invoiceStatus !== 3 ? invoiceStatus : 2}
          onRetry={(result) => {
            const nextStartedAt = Date.now();
            setPayment(result);
            setStartedAt(nextStartedAt);
            setInvoiceStatus(3);
            setExpired(false);
            queryClient.setQueryData(["payment-status", orderCode], {
              ...query.data,
              invoiceStatus: 3
            });
          }}
        />
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <PaymentWaiting
        result={payment}
        startedAt={startedAt}
        onStatusChange={setInvoiceStatus}
        onExpired={() => setExpired(true)}
      />
    </main>
  );
}
