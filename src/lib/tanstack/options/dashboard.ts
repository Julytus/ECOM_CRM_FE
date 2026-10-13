import {
  getRevenueData,
  getOrderStatusData,
  getTopProductsData,
  getAovData,
  getInventoryData
} from "@/lib/axios/dashboard";

import type {
  RevenueDatapoint,
  OrderStatusDatapoint,
  TopProductsDatapoint,
  AovDatapoint,
  InventoryResponse,
  RevenueApiRequest,
  OrderStatusApiRequest,
  TopProductsApiRequest,
  AovApiRequest,
  InventoryApiRequest
} from "@/lib/types/dashboard";

import type {
  UseQueryOptions
} from "@tanstack/react-query";

/* ===========================
   Revenue Query
=========================== */

export const createRevenueQueryOptions = (
  params: RevenueApiRequest
): UseQueryOptions<
  RevenueDatapoint[],
  Error,
  RevenueDatapoint[],
  ["dashboard", "revenue", RevenueApiRequest]
> => ({
  queryKey: ["dashboard", "revenue", params],
  queryFn: () => getRevenueData(params),
  refetchOnWindowFocus: false
});

/* ===========================
   Order Status Query
=========================== */

export const createOrderStatusQueryOptions = (
  params: OrderStatusApiRequest
): UseQueryOptions<
  OrderStatusDatapoint[],
  Error,
  OrderStatusDatapoint[],
  ["dashboard", "order-status", OrderStatusApiRequest]
> => ({
  queryKey: ["dashboard", "order-status", params],
  queryFn: () => getOrderStatusData(params),
  refetchOnWindowFocus: false
});

/* ===========================
   Top Products Query
=========================== */

export const createTopProductsQueryOptions = (
  params: TopProductsApiRequest
): UseQueryOptions<
  TopProductsDatapoint[],
  Error,
  TopProductsDatapoint[],
  ["dashboard", "top-products", TopProductsApiRequest]
> => ({
  queryKey: ["dashboard", "top-products", params],
  queryFn: () => getTopProductsData(params),
  refetchOnWindowFocus: false
});

/* ===========================
   AOV Query
=========================== */

export const createAovQueryOptions = (
  params: AovApiRequest
): UseQueryOptions<
  AovDatapoint[],
  Error,
  AovDatapoint[],
  ["dashboard", "aov", AovApiRequest]
> => ({
  queryKey: ["dashboard", "aov", params],
  queryFn: () => getAovData(params),
  refetchOnWindowFocus: false
});

/* ===========================
   Inventory Query
=========================== */

export const createInventoryQueryOptions = (
  params: InventoryApiRequest
): UseQueryOptions<
  InventoryResponse,
  Error,
  InventoryResponse,
  ["dashboard", "inventory", InventoryApiRequest]
> => ({
  queryKey: ["dashboard", "inventory", params],
  queryFn: () => getInventoryData(params),
  refetchOnWindowFocus: false
});
