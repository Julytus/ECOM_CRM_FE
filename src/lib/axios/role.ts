import axiosInstance from "@/lib/axios/instance";
import type { ApiResponse } from "@/lib/types/common";
import type { RoleDTO, RoleListApiRequest, RoleListApiResponse } from "@/lib/types/role";

export const getRoles = async (params: RoleListApiRequest) => {
  const res = await axiosInstance.get<RoleListApiResponse>("/role/list", {
    params: {
      id: params.id,
      keyword: params.keyword,
      isDefault: params.isDefault,
      isOperator: params.isOperator,
      page: params.paging?.page,
      limit: params.paging?.limit
    }
  });
  return res.data.result;
};

// `RoleController.upsertRole` trả về cả entity (giống user, khác category trả `string`).
export const upsertRole = async (payload: Partial<RoleDTO>) => {
  const res = await axiosInstance.post<ApiResponse<RoleDTO>>("/role/update", payload);
  return res.data.result;
};

export const deleteRole = async (id: number) => {
  const res = await axiosInstance.delete<ApiResponse<number>>(`/role/delete/${id}`);
  return res.data.result;
};
