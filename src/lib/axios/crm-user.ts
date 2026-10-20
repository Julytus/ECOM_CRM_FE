import axiosInstance from "@/lib/axios/instance";
import type {
  CrmUserDTO,
  CrmUserDetailsApiResponse,
  CrmUserListApiRequest,
  CrmUserListApiResponse
} from "@/lib/types/crm-user";
import type { ApiResponse } from "@/lib/types/common";

export const getCrmUsers = async (params: CrmUserListApiRequest) => {
  const res = await axiosInstance.get<CrmUserListApiResponse>("/user/list", {
    params: {
      lstUserId: params.lstUserId,
      keyword: params.keyword,
      excludeUserId: params.excludeUserId,
      page: params.paging?.page,
      limit: params.paging?.limit
    }
  });
  return res.data.result;
};

export const getCrmUserById = async (id: number) => {
  const res = await axiosInstance.get<CrmUserDetailsApiResponse>("/user/getById", {
    params: { id }
  });
  return res.data.result;
};

// Khác `upsertCategory` (trả `string`): `UserController.upsertUser` trả về cả entity.
export const upsertCrmUser = async (payload: Partial<CrmUserDTO>) => {
  const res = await axiosInstance.post<ApiResponse<CrmUserDTO>>("/user/update", payload);
  return res.data.result;
};

// `/user/delete` nhận `id` qua QUERY param, không phải path param như `/categoryItem/delete/{id}`.
export const deleteCrmUser = async (id: number) => {
  const res = await axiosInstance.delete<ApiResponse<number>>("/user/delete", {
    params: { id }
  });
  return res.data.result;
};
