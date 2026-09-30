import {
  queryOptions,
  type InfiniteData,
  type UseInfiniteQueryOptions,
  type UseMutationOptions
} from "@tanstack/react-query";

import { getProductReviews, createProductReview } from "@/lib/axios/review";

import type {
  ProductReviewDTO,
  ProductReviewListResponseDTO,
  ProductReviewListApiRequest
} from "@/lib/types/review";

export type ProductReviewsPage = ProductReviewListResponseDTO;

const DEFAULT_LIMIT = 10;

/* ============================
   Infinite Reviews List
============================ */

export const createInfiniteProductReviewsQueryOptions = ({
  opts
}: {
  opts?: ProductReviewListApiRequest;
}): UseInfiniteQueryOptions<
  ProductReviewsPage,
  Error,
  InfiniteData<ProductReviewsPage>,
  unknown[],
  number | undefined
> => {
  return {
    queryKey: [
      "productReviews",
      {
        ...opts
      }
    ],

    queryFn: ({ pageParam }) => {
      const paging = pageParam
        ? { page: pageParam, limit: opts?.paging?.limit ?? DEFAULT_LIMIT }
        : opts?.paging;

      return getProductReviews({
        ...opts,
        paging
      });
    },

    getNextPageParam: (lastPage) => {
      const limit = opts?.paging?.limit ?? DEFAULT_LIMIT;
      const totalPages = Math.ceil(lastPage.total / limit);
      const nextPage = lastPage.page + 1;

      return nextPage <= totalPages ? nextPage : undefined;
    },

    getPreviousPageParam: (firstPage) => {
      if (firstPage.page > 1) {
        return firstPage.page - 1;
      }
      return undefined;
    },

    initialPageParam: opts?.paging?.page ?? 1,
    refetchOnWindowFocus: false
  };
};

/* ============================
   Create Review
============================ */

export const createProductReviewMutationOptions = (): UseMutationOptions<
  string,
  Error,
  Partial<ProductReviewDTO>
> => {
  return {
    mutationFn: createProductReview
  };
};
