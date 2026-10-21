import { queryOptions } from "@tanstack/react-query";
import {
  getRevenueByPaymentMethod,
  getRevenueSeries,
  getRevenueSummary,
  getTopProducts,
  type RevenueDateParams,
  type RevenueSeriesParams,
  type TopProductsParams
} from "@/lib/api/report";

export const revenueSummaryQueryOptions = (params: RevenueDateParams) =>
  queryOptions({
    queryKey: ["revenue-report", "summary", params],
    queryFn: () => getRevenueSummary(params)
  });

export const revenueSeriesQueryOptions = (params: RevenueSeriesParams) =>
  queryOptions({
    queryKey: ["revenue-report", "series", params],
    queryFn: () => getRevenueSeries(params)
  });

export const revenueByPaymentMethodQueryOptions = (params: RevenueDateParams) =>
  queryOptions({
    queryKey: ["revenue-report", "by-payment-method", params],
    queryFn: () => getRevenueByPaymentMethod(params)
  });

export const topProductsQueryOptions = (params: TopProductsParams) =>
  queryOptions({
    queryKey: ["revenue-report", "top-products", params],
    queryFn: () => getTopProducts(params)
  });
