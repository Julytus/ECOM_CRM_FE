import axiosInstance from "@/lib/axios/instance";
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  StripeCreatePaymentRequest,
  StripeApiResponse,
  CashPaymentRequest,
  CashApiResponse,
  OrderDTO,
  OrderFilterRequest,
  ListOrdersResponse,
  OrderListResponseDTO
} from "@/lib/types/order";
import type { QueryKey } from "@tanstack/react-query";
import type { DeleteResponse } from "../types/common";

export const createOrder = async (request: CreateOrderRequest): Promise<CreateOrderResponse> => {
  const response = await axiosInstance.post<CreateOrderResponse>("/order/create", request);
  return response.data;
};

export const createStripePayment = async (
  request: StripeCreatePaymentRequest
): Promise<StripeApiResponse> => {
  const response = await axiosInstance.post<StripeApiResponse>("/stripe/create-payment", request);
  return response.data;
};

export const createCashPayment = async (request: CashPaymentRequest): Promise<CashApiResponse> => {
  const response = await axiosInstance.post<CashApiResponse>("/payment/create", request);
  return response.data;
};

export interface PageData {
  items: OrderDTO[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetInfiniteOrdersProps {
  opts?: OrderFilterRequest & {
    paging?: {
      page: number;
      limit: number;
    };
  };
}

export const getOrders = async (filters: OrderFilterRequest): Promise<OrderListResponseDTO> => {
  const { data } = await axiosInstance.get<ListOrdersResponse>("/order/list", {
    params: {
      ...filters,
      page: filters.paging?.page,
      limit: filters.paging?.limit
    }
  });

  return data.result;
};

export const updateOrder = async (order: OrderDTO) => {
  const response = await axiosInstance.post<{
    code: number;
    message: string;
    result: OrderDTO;
  }>("/order/update-status", order);
  return response.data.result;
};

export const deleteOrder = async (id: number) => {
  const res = await axiosInstance.delete<DeleteResponse>(`/order/delete/${id}`);
  return res.data.result;
};

export const getOrderById = async (id: number) => {
  const response = await axiosInstance.get<{
    code: number;
    message: string;
    result: OrderDTO;
  }>(`/order/detail/${id}`);
  return response.data.result;
};

export const batchDeleteOrders = async (ids: number[]) => {
  const deletePromises = ids.map((id) => deleteOrder(id));
  await Promise.all(deletePromises);
  return ids.length;
};
