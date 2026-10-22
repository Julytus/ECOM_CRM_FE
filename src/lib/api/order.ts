import axiosInstance from "@/lib/axios/instance";
import type { components } from "@/lib/api/schema.gen";

type MyOrdersResponse = components["schemas"]["ApiResponsePageOrderResponse"];
type MyOrderDetailResponse = components["schemas"]["ApiResponseOrderResponse"];
type StringResponse = components["schemas"]["ApiResponseString"];

export type MyOrdersParams = {
  page?: number;
  limit?: number;
  orderStatus?: string;
};

export const getMyOrders = async (params: MyOrdersParams) => {
  const res = await axiosInstance.get<MyOrdersResponse>("/order/my", { params });
  return res.data.result;
};

export const getMyOrderDetail = async (id: number) => {
  const res = await axiosInstance.get<MyOrderDetailResponse>(`/order/my/${id}`);
  return res.data.result;
};

export const cancelMyOrder = async (id: number) => {
  const res = await axiosInstance.post<StringResponse>(`/order/my/${id}/cancel`);
  return res.data.result;
};

export type AdvanceOrderParams = { id: number; to: string };

export const advanceOrder = async ({ id, to }: AdvanceOrderParams) => {
  const res = await axiosInstance.post<StringResponse>(`/order/${id}/advance`, null, {
    params: { to }
  });
  return res.data.result;
};
