import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { getPaymentStatus, retryPayment } from "@/lib/api/payment";

const PAYMENT_STATUS_POLL_INTERVAL = 3_000;
const PAYMENT_STATUS_MAX_POLL_TIME = 30 * 60 * 1_000;

export type PaymentStatusQueryOptions = {
  enabled?: boolean;
  startedAt?: number;
};

export const paymentStatusQueryOptions = (
  orderCode: string,
  { enabled = true, startedAt = Date.now() }: PaymentStatusQueryOptions = {}
) =>
  queryOptions({
    queryKey: ["payment-status", orderCode],
    queryFn: () => getPaymentStatus(orderCode),
    enabled: enabled && orderCode.length > 0,
    refetchInterval: (query) => {
      if (
        query.state.data?.invoiceStatus !== 3 ||
        Date.now() - startedAt >= PAYMENT_STATUS_MAX_POLL_TIME
      ) {
        return false;
      }

      return PAYMENT_STATUS_POLL_INTERVAL;
    },
    refetchIntervalInBackground: false
  });

export const retryPaymentMutationOptions = () =>
  mutationOptions({ mutationFn: (invoiceId: number) => retryPayment(invoiceId) });
