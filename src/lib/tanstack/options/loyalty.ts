import { queryOptions, type InfiniteData, type UseInfiniteQueryOptions } from "@tanstack/react-query";

import { getMyLoyalty, getMyLoyaltyTransactions } from "@/lib/api/loyalty";
import type { components } from "@/lib/api/schema.gen";

type LoyaltyTransactionsPage = components["schemas"]["PageLoyaltyTransaction"];

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
