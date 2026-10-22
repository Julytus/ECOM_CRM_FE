import {
  mutationOptions,
  queryOptions,
  type InfiniteData,
  type UseInfiniteQueryOptions,
  type UseMutationOptions
} from "@tanstack/react-query";
import {
  createOrder,
  createStripePayment,
  createCashPayment,
  updateOrder,
  getOrders,
  getOrderById,
  deleteOrder,
  batchDeleteOrders
} from "@/lib/axios/order";
import {
  advanceOrder,
  cancelMyOrder,
  getMyOrderDetail,
  getMyOrders,
  type AdvanceOrderParams,
  type MyOrdersParams
} from "@/lib/api/order";
import type { components } from "@/lib/api/schema.gen";
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  StripeCreatePaymentRequest,
  StripeApiResponse,
  CashPaymentRequest,
  CashApiResponse,
  OrderDTO,
  OrderListResponseDTO,
  OrderFilterRequest
} from "@/lib/types/order";

export type OrdersPage = OrderListResponseDTO;
type MyOrdersPage = components["schemas"]["PageOrderResponse"];

const DEFAULT_LIMIT = 10;
const ORDER_LIFECYCLE_INVALIDATIONS = [
  ["orders"],
  ["order"],
  ["my-orders"],
  ["my-order"],
  ["invoices"],
  ["invoice"],
  ["revenue-report"],
  ["revenue-summary"],
  ["revenue-series"],
  ["revenue-payment-method"],
  ["revenue-top-products"],
  ["dashboard", "revenue"]
];

export const orderByIdQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["order", id],
    queryFn: () => getOrderById(id),
    enabled: typeof id === "number" && id > 0
  });

export const myOrdersInfiniteQueryOptions = (
  params: MyOrdersParams = {}
): UseInfiniteQueryOptions<
  MyOrdersPage,
  Error,
  InfiniteData<MyOrdersPage>,
  unknown[],
  number
> => {
  const limit = params.limit ?? DEFAULT_LIMIT;

  return {
    queryKey: ["my-orders", { ...params, limit }],
    queryFn: async ({ pageParam }) => {
      const result = await getMyOrders({ ...params, page: pageParam, limit });
      if (!result) throw new Error("Không nhận được danh sách đơn hàng");
      return result;
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.total === undefined) return undefined;
      const nextPage = (lastPage.page ?? lastPageParam) + 1;
      return nextPage <= Math.ceil(lastPage.total / limit) ? nextPage : undefined;
    },
    initialPageParam: params.page ?? 1,
    refetchOnWindowFocus: false
  };
};

export const myOrderDetailQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["my-order", id],
    queryFn: () => getMyOrderDetail(id),
    enabled: id > 0
  });

export const cancelMyOrderMutationOptions = () =>
  mutationOptions({
    mutationFn: (id: number) => cancelMyOrder(id),
    meta: { invalidatesQuery: ORDER_LIFECYCLE_INVALIDATIONS }
  });

export const advanceOrderMutationOptions = () =>
  mutationOptions({
    mutationFn: (params: AdvanceOrderParams) => advanceOrder(params),
    meta: { invalidatesQuery: ORDER_LIFECYCLE_INVALIDATIONS }
  });

export const createOrderMutationOptions = (): UseMutationOptions<
  CreateOrderResponse,
  Error,
  CreateOrderRequest
> => {
  return {
    mutationFn: createOrder
  };
};

export const createStripePaymentMutationOptions = (): UseMutationOptions<
  StripeApiResponse,
  Error,
  StripeCreatePaymentRequest
> => {
  return {
    mutationFn: createStripePayment
  };
};

export const createCashPaymentMutationOptions = (): UseMutationOptions<
  CashApiResponse,
  Error,
  CashPaymentRequest
> => {
  return {
    mutationFn: createCashPayment
  };
};

export const createInfiniteOrdersQueryOptions = ({
  opts
}: {
  opts?: OrderFilterRequest;
}): UseInfiniteQueryOptions<
  OrdersPage,
  Error,
  InfiniteData<OrdersPage>,
  unknown[],
  number | undefined
> => {
  return {
    queryKey: [
      "orders",
      {
        ...opts
      }
    ],

    queryFn: ({ pageParam }) => {
      const paging = pageParam
        ? { page: pageParam, limit: opts?.paging?.limit ?? DEFAULT_LIMIT }
        : opts?.paging;

      return getOrders({
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

export const updateOrderMutationOptions = (): UseMutationOptions<OrderDTO, Error, OrderDTO> => {
  return {
    mutationFn: updateOrder,
    meta: {
      successMessage: "Cập nhật đơn hàng thành công",
      errorMessage: "Cập nhật đơn hàng thất bại",
      invalidatesQuery: [["orders"], ["order"]]
    }
  };
};

export const deleteOrderMutationOptions = (): UseMutationOptions<number, Error, number> => {
  return {
    mutationFn: deleteOrder,
    meta: {
      successMessage: "Xóa đơn hàng thành công",
      errorMessage: "Xóa đơn hàng thất bại",
      invalidatesQuery: [["orders"]]
    }
  };
};

export const batchDeleteOrdersMutationOptions = (): UseMutationOptions<
  number,
  Error,
  number[]
> => {
  return {
    mutationFn: batchDeleteOrders,
    meta: {
      successMessage: "Xóa đơn hàng thành công",
      errorMessage: "Xóa đơn hàng thất bại",
      invalidatesQuery: [["orders"]]
    }
  };
};
