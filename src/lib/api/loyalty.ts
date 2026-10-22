import axiosInstance from "@/lib/axios/instance";
import type { components } from "@/lib/api/schema.gen";

type LoyaltyAccountResponse = components["schemas"]["ApiResponseLoyaltyAccountResponse"];
type LoyaltyTransactionsResponse = components["schemas"]["ApiResponsePageLoyaltyTransaction"];
type RedeemableVouchersResponse = components["schemas"]["ApiResponseListRedeemableVoucherResponse"];
type LoyaltyTiersResponse = components["schemas"]["ApiResponseListLoyaltyTier"];
type RedeemVoucherResponse = components["schemas"]["ApiResponseInteger"];
type MyVouchersResponse = components["schemas"]["ApiResponsePageMyVoucherResponse"];

export type MyLoyaltyTransactionsParams = {
  page?: number;
  limit?: number;
};

export type MyVouchersParams = {
  status?: string;
  page?: number;
  limit?: number;
};

export const getMyLoyalty = async () => {
  const res = await axiosInstance.get<LoyaltyAccountResponse>("/loyalty/my");
  return res.data.result;
};

export const getMyLoyaltyTransactions = async (params: MyLoyaltyTransactionsParams = {}) => {
  const res = await axiosInstance.get<LoyaltyTransactionsResponse>("/loyalty/my/transactions", {
    params
  });
  return res.data.result;
};

export const getRedeemable = async () => {
  const res = await axiosInstance.get<RedeemableVouchersResponse>("/loyalty/redeemable");
  return res.data.result;
};

export const getTiers = async () => {
  const res = await axiosInstance.get<LoyaltyTiersResponse>("/loyalty/tier/list");
  return res.data.result;
};

export const redeemVoucher = async (voucherId: number) => {
  const res = await axiosInstance.post<RedeemVoucherResponse>("/loyalty/redeem", { voucherId });
  return res.data.result;
};

export const getMyVouchers = async (params: MyVouchersParams = {}) => {
  const res = await axiosInstance.get<MyVouchersResponse>("/loyalty/my/vouchers", { params });
  return res.data.result;
};

/**
 * [ASSUMED] No linked/unlinked accounts were available for a real probe. An unauthenticated
 * GET /loyalty/my probe returned HTTP 401 with an empty body; E2E account credentials are unset.
 * Treat HTTP 404 from this account endpoint as the backend's unlinked-customer signal.
 */
export const isUnlinkedAccountError = (error: unknown) => {
  if (typeof error !== "object" || error === null || !("response" in error)) return false;

  const response = error.response;
  return (
    typeof response === "object" &&
    response !== null &&
    "status" in response &&
    response.status === 404
  );
};
