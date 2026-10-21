import axiosInstance from "@/lib/axios/instance";
import type { components } from "@/lib/api/schema.gen";

type InvoiceListResponse = components["schemas"]["ApiResponsePageInvoice"];
type InvoiceDetailResponse = components["schemas"]["ApiResponseInvoiceResponse"];
type IntegerResponse = components["schemas"]["ApiResponseInteger"];

export type PaymentMethod = "COD" | "PAYOS" | "CASH" | "TRANSFER";
export type InvoiceSortBy = "id" | "createdTime" | "fee";

export type InvoiceListParams = {
  keyword?: string;
  customerId?: number;
  status?: number[];
  paymentMethod?: PaymentMethod;
  fromDate?: string;
  toDate?: string;
  orderCode?: string;
  sortBy?: InvoiceSortBy;
  sortDir?: "asc" | "desc";
  page?: number;
  offset?: number;
  limit?: number;
  total?: number;
};

export const getInvoices = async (params: InvoiceListParams) => {
  const res = await axiosInstance.get<InvoiceListResponse>("/invoice/list", {
    params,
    paramsSerializer: { indexes: null }
  });
  return res.data.result;
};

export const getInvoiceDetail = async (id: number) => {
  const res = await axiosInstance.get<InvoiceDetailResponse>("/invoice/getDetail", {
    params: { id }
  });
  return res.data.result;
};

export const confirmInvoicePayment = async (invoiceId: number) => {
  const res = await axiosInstance.post<IntegerResponse>("/invoice/confirmPayment", null, {
    params: { invoiceId }
  });
  return res.data.result;
};

export const cancelInvoice = async (id: number) => {
  const res = await axiosInstance.post<IntegerResponse>(`/invoice/cancel/${id}`);
  return res.data.result;
};

export type RefundInvoiceParams = { id: number; reason?: string };

export const refundInvoice = async ({ id, reason }: RefundInvoiceParams) => {
  const res = await axiosInstance.post<IntegerResponse>(`/invoice/refund/${id}`, null, {
    params: { reason }
  });
  return res.data.result;
};
