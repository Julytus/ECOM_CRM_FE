import axiosInstance from "@/lib/axios/instance";
import type { components } from "@/lib/api/schema.gen";

type RevenueSummaryResponse = components["schemas"]["ApiResponseRevenueSummary"];
type RevenueSeriesResponse = components["schemas"]["ApiResponseListRevenueBucket"];
type RevenueByPaymentMethodResponse = components["schemas"]["ApiResponseListRevenuePaymentMethod"];
type TopProductsResponse = components["schemas"]["ApiResponseListTopProductStatistic"];

export type RevenueDateParams = { from?: string; to?: string };
export type GroupBy = "day" | "week" | "month";

export type RevenueSeriesParams = RevenueDateParams & { groupBy?: GroupBy };
export type TopProductsParams = RevenueDateParams & { limit?: number };

export const getRevenueSummary = async (params: RevenueDateParams) => {
  const res = await axiosInstance.get<RevenueSummaryResponse>("/report/revenue/summary", {
    params
  });
  return res.data.result;
};

export const getRevenueSeries = async (params: RevenueSeriesParams) => {
  const res = await axiosInstance.get<RevenueSeriesResponse>("/report/revenue/series", {
    params
  });
  return res.data.result;
};

export const getRevenueByPaymentMethod = async (params: RevenueDateParams) => {
  const res = await axiosInstance.get<RevenueByPaymentMethodResponse>(
    "/report/revenue/by-payment-method",
    { params }
  );
  return res.data.result;
};

export const getTopProducts = async (params: TopProductsParams) => {
  const res = await axiosInstance.get<TopProductsResponse>("/report/revenue/top-products", {
    params
  });
  return res.data.result;
};
