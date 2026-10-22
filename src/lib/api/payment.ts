import axiosInstance from "@/lib/axios/instance";
import type { components } from "@/lib/api/schema.gen";

type PaymentStatusResponse = components["schemas"]["ApiResponsePaymentStatusResponse"];
// [ASSUMED] OpenAPI confirms a string map, but the runtime response keys are not verified.
type RetryPaymentResponse = components["schemas"]["ApiResponseMapStringString"];

export const INVOICE_STATUS = {
  PAID: 1,
  CANCELLED: 2,
  PENDING: 3,
  REFUNDED: 4
} as const;

export type InvoiceStatus = (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS];

export const getPaymentStatus = async (orderCode: string) => {
  const res = await axiosInstance.get<PaymentStatusResponse>("/payment/status", {
    params: { orderCode }
  });
  return res.data.result;
};

export const retryPayment = async (invoiceId: number) => {
  const res = await axiosInstance.post<RetryPaymentResponse>("/payment/retry", null, {
    params: { invoiceId }
  });
  return res.data.result;
};
