import axiosInstance from "@/lib/axios/instance";
import type { ApiResponse } from "@/lib/types/common";

async function getApiResult<T>(url: string) {
  const res = await axiosInstance.get<ApiResponse<T>>(url);
  return res.data.result;
}
