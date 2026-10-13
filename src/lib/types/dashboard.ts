import type { ApiResponse, Prettify } from "@/lib/types/common";

/* ===========================
   Revenue by Time Period
=========================== */

export type GroupBy = "DAY" | "WEEK" | "MONTH";

export interface RevenueDatapoint {
  period: string;
  totalOrders: number;
  revenue: number;
}

export interface RevenueApiRequest {
  fromDate: string;
  toDate: string;
  groupBy?: GroupBy;
}

export type RevenueApiResponse = Prettify<ApiResponse<RevenueDatapoint[]>>;

/* ===========================
   Order Status Distribution
=========================== */

export interface OrderStatusDatapoint {
  status: string;
  totalOrders: number;
  percentage: number;
}

export interface OrderStatusApiRequest {
  fromDate: string;
  toDate: string;
}

export type OrderStatusApiResponse = Prettify<ApiResponse<OrderStatusDatapoint[]>>;

/* ===========================
   Top Products
=========================== */

export type SortByProduct = "QUANTITY" | "REVENUE";

export interface TopProductsDatapoint {
  productId: number;
  productName: string;
  totalQuantity: number;
  revenue: number;
}

export interface TopProductsApiRequest {
  fromDate: string;
  toDate: string;
  limit?: number;
  sortBy?: SortByProduct;
}

export type TopProductsApiResponse = Prettify<ApiResponse<TopProductsDatapoint[]>>;

/* ===========================
   AOV by Time Period
=========================== */

export interface AovDatapoint {
  period: string;
  totalOrders: number;
  averageOrderValue: number;
}

export interface AovApiRequest {
  fromDate: string;
  toDate: string;
  groupBy?: GroupBy;
}

export type AovApiResponse = Prettify<ApiResponse<AovDatapoint[]>>;

/* ===========================
   Inventory & Low Stock Alerts
=========================== */

export interface InventoryItem {
  variantId: number;
  productId: number;
  productName: string;
  sku: string;
  stock: number;
  price: number;
}

export interface InventoryResponse {
  threshold: number;
  totalVariants: number;
  lowStockVariants: number;
  outOfStockVariants: number;
  items: InventoryItem[];
}

export interface InventoryApiRequest {
  threshold?: number;
  limit?: number;
}

export type InventoryApiResponse = Prettify<ApiResponse<InventoryResponse>>;
