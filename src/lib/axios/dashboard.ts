import axiosInstance from "@/lib/axios/instance";
import type {
  RevenueApiRequest,
  RevenueApiResponse,
  OrderStatusApiRequest,
  OrderStatusApiResponse,
  TopProductsApiRequest,
  TopProductsApiResponse,
  AovApiRequest,
  AovApiResponse,
  InventoryApiRequest,
  InventoryApiResponse
} from "@/lib/types/dashboard";

/* ---------- Revenue by Time Period ---------- */

export const getRevenueData = async (params: RevenueApiRequest) => {
  const res = await axiosInstance.get<RevenueApiResponse>("/dashboard/revenue", { params });
  return res.data.result;
};

/* ---------- Order Status Distribution ---------- */

export const getOrderStatusData = async (params: OrderStatusApiRequest) => {
  const res = await axiosInstance.get<OrderStatusApiResponse>("/dashboard/order-status", {
    params
  });
  return res.data.result;
};

/* ---------- Top Products ---------- */

export const getTopProductsData = async (params: TopProductsApiRequest) => {
  const res = await axiosInstance.get<TopProductsApiResponse>("/dashboard/top-products", {
    params
  });
  return res.data.result;
};

/* ---------- AOV by Time Period ---------- */

export const getAovData = async (params: AovApiRequest) => {
  const res = await axiosInstance.get<AovApiResponse>("/dashboard/aov", { params });
  return res.data.result;
};

/* ---------- Inventory & Low Stock Alerts ---------- */

export const getInventoryData = async (params: InventoryApiRequest) => {
  const res = await axiosInstance.get<InventoryApiResponse>("/dashboard/inventory", { params });
  return res.data.result;
};
