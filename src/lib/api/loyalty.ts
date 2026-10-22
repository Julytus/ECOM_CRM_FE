import axiosInstance from "@/lib/axios/instance";
import type { components } from "@/lib/api/schema.gen";

type LoyaltyAccountResponse = components["schemas"]["ApiResponseLoyaltyAccountResponse"];
type LoyaltyTransactionsResponse = components["schemas"]["ApiResponsePageLoyaltyTransaction"];
type RedeemableVouchersResponse = components["schemas"]["ApiResponseListRedeemableVoucherResponse"];
type LoyaltyTiersResponse = components["schemas"]["ApiResponseListLoyaltyTier"];
type RedeemVoucherResponse = components["schemas"]["ApiResponseInteger"];
type MyVouchersResponse = components["schemas"]["ApiResponsePageMyVoucherResponse"];
type LoyaltyTierRequest = components["schemas"]["LoyaltyTierRequest"];
type LoyaltyConfigResponse = components["schemas"]["ApiResponseLoyaltyConfig"];
type LoyaltyConfigRequest = components["schemas"]["LoyaltyConfigRequest"];
type LoyaltyAccountAdminResponse = components["schemas"]["ApiResponseLoyaltyAccount"];
type LoyaltyAdjustRequest = components["schemas"]["LoyaltyAdjustRequest"];
type CustomerAccountLinkRequest = components["schemas"]["CustomerAccountLinkRequest"];

export type LoyaltyTransactionsParams = { customerId: number; page?: number; limit?: number };

export const getLoyaltyAccount = async (customerId: number) => {
  const res = await axiosInstance.get<LoyaltyAccountAdminResponse>("/loyalty/account", {
    params: { customerId }
  });
  return res.data.result;
};

export const getLoyaltyTransactions = async (params: LoyaltyTransactionsParams) => {
  const res = await axiosInstance.get<LoyaltyTransactionsResponse>("/loyalty/transactions", {
    params
  });
  return res.data.result;
};

export const adjustLoyalty = async (body: LoyaltyAdjustRequest) => {
  const res = await axiosInstance.post<components["schemas"]["ApiResponseBoolean"]>(
    "/loyalty/adjust",
    body
  );
  return res.data.result;
};

export const linkCustomerAccount = async (body: CustomerAccountLinkRequest) => {
  const res = await axiosInstance.post<components["schemas"]["ApiResponseInteger"]>(
    "/customer/linkAccount",
    body
  );
  return res.data.result;
};

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

export const saveTier = async (tier: LoyaltyTierRequest) => {
  const res = await axiosInstance.post<components["schemas"]["ApiResponseLoyaltyTier"]>(
    "/loyalty/tier/save",
    tier
  );
  return res.data.result;
};

export const deleteTier = async (id: number) => {
  const res = await axiosInstance.delete<components["schemas"]["ApiResponseInteger"]>(
    `/loyalty/tier/delete/${id}`
  );
  return res.data.result;
};

export const getLoyaltyConfig = async () => {
  const res = await axiosInstance.get<LoyaltyConfigResponse>("/loyalty/config");
  return res.data.result;
};

export const updateLoyaltyConfig = async (config: LoyaltyConfigRequest) => {
  const res = await axiosInstance.post<LoyaltyConfigResponse>("/loyalty/config/update", config);
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
