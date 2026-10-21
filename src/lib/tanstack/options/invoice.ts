import { mutationOptions, queryOptions } from "@tanstack/react-query";
import {
  cancelInvoice,
  confirmInvoicePayment,
  getInvoiceDetail,
  getInvoices,
  refundInvoice,
  type InvoiceListParams,
  type RefundInvoiceParams
} from "@/lib/api/invoice";

export const invoicesQueryOptions = (params: InvoiceListParams) =>
  queryOptions({
    queryKey: ["invoices", params],
    queryFn: () => getInvoices(params)
  });

export const invoiceDetailQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["invoice", id],
    queryFn: () => getInvoiceDetail(id),
    enabled: id > 0
  });

export const confirmInvoicePaymentMutationOptions = () =>
  mutationOptions({ mutationFn: (invoiceId: number) => confirmInvoicePayment(invoiceId) });

export const cancelInvoiceMutationOptions = () =>
  mutationOptions({ mutationFn: (id: number) => cancelInvoice(id) });

export const refundInvoiceMutationOptions = () =>
  mutationOptions({ mutationFn: (params: RefundInvoiceParams) => refundInvoice(params) });
