import axiosInstance from "@/lib/axios/instance";
import type { components } from "@/lib/api/schema.gen";

type CustomerListResponse = components["schemas"]["ApiResponsePageCustomer"];

export type CustomersParams = { keyword?: string; page?: number; limit?: number };

export const getCustomers = async (params: CustomersParams) => {
  const res = await axiosInstance.get<CustomerListResponse>("/customer/list", { params });
  return res.data.result;
};
