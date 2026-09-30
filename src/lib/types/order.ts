import type { ApiResponse } from "@/lib/types/common";
import type { PagingDTO } from "@/lib/types/paging";

export type PaymentMethod = "COD" | "PAYOS";

export type OrderStatus = "NEW" | "CONFIRMED" | "SHIPPING" | "COMPLETED" | "CANCELLED" | "REFUNDED";

export type OrderSortField =
  | "code"
  | "userFullName"
  | "userEmail"
  | "totalPrice"
  | "status"
  | "createdAt";

export interface OrderFilterRequest {
  orderStatus?: OrderStatus;
  // sortBy?: OrderSortField;
  // sortDir?: "asc" | "desc";
  userId?: number;
  paging?: PagingDTO;
}

export interface OrderItemDTO {
  id: number;
  orderId: number | null;
  productId: number;
  productName: string;
  productVariantId: number;
  sku: string;
  productVariantImage: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface OrderDTO {
  id: number;
  code?: string;
  userId?: number;
  totalAmount: number;
  discountAmount?: number;
  finalAmount: number;
  status?: OrderStatus;
  paymentStatus?: "PAID" | "UNPAID";
  paymentMethod?: string;
  note?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
  items: OrderItemDTO[];
}

export interface CreateOrderRequest {
  paymentReturnUrl?: string;
  totalAmount: number;
  discountAmount?: number;
  finalAmount: number;
  paymentMethod?: PaymentMethod;
  note?: string;
  address?: string;
  items: OrderItemDTO[];
}

export type CreateOrderResponse = ApiResponse<string>;

export interface OrderListResponseDTO {
  total: number;
  page: number;
  items: OrderDTO[];
}

export type ListOrdersResponse = ApiResponse<OrderListResponseDTO>;

export interface PaymentRequest {
  orderId: number;
  amount: number;
}

export interface PaymentResponse {
  code: number;
  message: string;
  success: boolean;
  paymentUrl?: string;
}

export interface StripeCreatePaymentRequest {
  orderId: number;
  amount: number;
  returnUrl: string;
}

export interface StripeResponse {
  sessionId: string;
  sessionUrl: string;
}

export interface StripeApiResponse {
  code: number;
  message: string;
  result: StripeResponse;
}

export interface CashPaymentRequest {
  orderId: number;
  amount: number;
  paymentMethod: PaymentMethod;
}

export interface CashPaymentResponse {
  id: number;
  orderId: number;
  amount: number;
  paymentMethod: string;
}

export interface CashApiResponse {
  code: number;
  message: string;
  result: CashPaymentResponse;
}
