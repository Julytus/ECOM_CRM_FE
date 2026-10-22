import {
  mutationOptions,
  queryOptions,
  type InfiniteData,
  type UseInfiniteQueryOptions
} from "@tanstack/react-query";

import {
  getMyLoyalty,
  getMyLoyaltyTransactions,
  getTiers,
  getMyVouchers,
  getRedeemable,
  redeemVoucher,
  saveTier,
  deleteTier,
  getLoyaltyConfig,
  updateLoyaltyConfig
} from "@/lib/api/loyalty";
import type { components } from "@/lib/api/schema.gen";
import type { UseMutationOptions } from "@tanstack/react-query";

type LoyaltyTransactionsPage = components["schemas"]["PageLoyaltyTransaction"];
type MyVouchersPage = components["schemas"]["PageMyVoucherResponse"];

const DEFAULT_LIMIT = 10;

export const myLoyaltyQueryOptions = queryOptions({
  queryKey: ["my-loyalty"],
  queryFn: async () => {
    const result = await getMyLoyalty();
    if (!result) throw new Error("Không nhận được thông tin điểm thưởng.");
    return result;
  },
  retry: false,
  refetchOnWindowFocus: false
});

export const redeemableQueryOptions = queryOptions({
  queryKey: ["redeemable"],
  queryFn: async () => {
    const result = await getRedeemable();
    if (!result) throw new Error("Không nhận được danh sách voucher đổi điểm.");
    return result;
  },
  retry: false,
  refetchOnWindowFocus: false
});

export const tiersQueryOptions = queryOptions({
  queryKey: ["loyalty-tiers"],
  queryFn: async () => (await getTiers()) ?? [],
  retry: false,
  refetchOnWindowFocus: false
});

export const loyaltyConfigQueryOptions = queryOptions({
  queryKey: ["loyalty-config"],
  queryFn: async () => {
    const result = await getLoyaltyConfig();
    if (!result) throw new Error("Không nhận được cấu hình tích điểm.");
    return result;
  },
  retry: false,
  refetchOnWindowFocus: false
});

export const saveTierMutationOptions = (): UseMutationOptions<
  components["schemas"]["LoyaltyTier"] | undefined,
  Error,
  components["schemas"]["LoyaltyTierRequest"]
> => ({
  mutationFn: saveTier,
  meta: { invalidatesQuery: [["loyalty-tiers"]] }
});

export const deleteTierMutationOptions = (): UseMutationOptions<number | undefined, Error, number> => ({
  mutationFn: deleteTier,
  meta: { invalidatesQuery: [["loyalty-tiers"]] }
});

export const updateLoyaltyConfigMutationOptions = (): UseMutationOptions<
  components["schemas"]["LoyaltyConfig"] | undefined,
  Error,
  components["schemas"]["LoyaltyConfigRequest"]
> => ({
  mutationFn: updateLoyaltyConfig,
  meta: { invalidatesQuery: [["loyalty-config"]] }
});

export const redeemMutationOptions = () =>
  mutationOptions({
    mutationFn: (voucherId: number) => redeemVoucher(voucherId),
    meta: { invalidatesQuery: [["my-loyalty"], ["redeemable"], ["my-vouchers"]] }
  });

export const myVouchersInfiniteQueryOptions = (
  status: string,
  params: { limit?: number; enabled?: boolean } = {}
): UseInfiniteQueryOptions<MyVouchersPage, Error, InfiniteData<MyVouchersPage>, unknown[], number> => {
  const limit = params.limit ?? DEFAULT_LIMIT;

  return {
    queryKey: ["my-vouchers", { status, limit }],
    queryFn: async ({ pageParam }) => {
      const result = await getMyVouchers({ status, page: pageParam, limit });
      if (!result) throw new Error("Không nhận được danh sách voucher của bạn.");
      return result;
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.total === undefined) return undefined;
      const nextPage = (lastPage.page ?? lastPageParam) + 1;
      return nextPage <= Math.ceil(lastPage.total / limit) ? nextPage : undefined;
    },
    initialPageParam: 1,
    enabled: params.enabled ?? true,
    retry: false,
    refetchOnWindowFocus: false
  };
};

export const myLoyaltyTransactionsInfiniteQueryOptions = (
  params: { limit?: number; enabled?: boolean } = {}
): UseInfiniteQueryOptions<
  LoyaltyTransactionsPage,
  Error,
  InfiniteData<LoyaltyTransactionsPage>,
  unknown[],
  number
> => {
  const limit = params.limit ?? DEFAULT_LIMIT;

  return {
    queryKey: ["my-loyalty-transactions", { limit }],
    queryFn: async ({ pageParam }) => {
      const result = await getMyLoyaltyTransactions({ page: pageParam, limit });
      if (!result) throw new Error("Không nhận được lịch sử điểm thưởng.");
      return result;
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.total === undefined) return undefined;
      const nextPage = (lastPage.page ?? lastPageParam) + 1;
      return nextPage <= Math.ceil(lastPage.total / limit) ? nextPage : undefined;
    },
    initialPageParam: 1,
    enabled: params.enabled ?? true,
    retry: false,
    refetchOnWindowFocus: false
  };
};
