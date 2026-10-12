import axiosInstance from "@/lib/axios/instance";
import type {
  CategoryDTO,
  CategoryListApiRequest,
  CategoryListApiResponse,
  CategoryDetailsApiResponse
} from "@/lib/types/category";
import type { ApiResponse } from "@/lib/types/common";

export const getCategories = async (params: CategoryListApiRequest) => {
  const res = await axiosInstance.get<CategoryListApiResponse>("/categoryItem/list", {
    params: {
      keyword: params.keyword,
      page: params.paging?.page,
      limit: params.paging?.limit
    }
  });
  return res.data.result;
};

export const getCategoryById = async (id: number) => {
  const res = await axiosInstance.get<CategoryDetailsApiResponse>(`/categoryItem/${id}`);
  return res.data.result;
};

export const upsertCategory = async (payload: Partial<CategoryDTO>) => {
  const res = await axiosInstance.post<ApiResponse<string>>("/categoryItem/update", payload);
  return res.data.result;
};

export const deleteCategory = async (id: number) => {
  const res = await axiosInstance.delete<ApiResponse<string>>(`/categoryItem/delete/${id}`);
  return res.data.result;
};
