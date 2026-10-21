import axiosInstance from "@/lib/axios/instance";
import type { ApiResponse } from "@/lib/types/common";
import type {
  AssignResourcesRequest,
  ModuleDTO,
  ModuleListApiRequest,
  ModuleListApiResponse,
  ResourceIdsRequest
} from "@/lib/types/module";
import type { ResourceDTO, ResourceWireDTO } from "@/lib/types/resource";
import { parseActions } from "@/lib/axios/resource";

export const getModules = async (params: ModuleListApiRequest) => {
  const res = await axiosInstance.get<ModuleListApiResponse>("/module/list", {
    params: {
      keyword: params.keyword,
      active: params.active,
      page: params.paging?.page,
      limit: params.paging?.limit
    }
  });
  return res.data.result;
};

export const upsertModule = async (payload: Partial<ModuleDTO>) => {
  const res = await axiosInstance.post<ApiResponse<ModuleDTO>>("/module/update", payload);
  return res.data.result;
};

export const deleteModule = async (id: number) => {
  const res = await axiosInstance.delete<ApiResponse<number>>(`/module/delete/${id}`);
  return res.data.result;
};

export const updateModuleStatus = async (id: number, active: number) => {
  const res = await axiosInstance.post<ApiResponse<number>>("/module/update-status", null, {
    params: { id, active }
  });
  return res.data.result;
};

export const assignResources = async (payload: AssignResourcesRequest) => {
  const res = await axiosInstance.post<ApiResponse<number>>("/module/assign-resources", payload);
  return res.data.result;
};

export const unassignResources = async (payload: ResourceIdsRequest) => {
  const res = await axiosInstance.post<ApiResponse<number>>(
    "/module/unassign-resources",
    payload
  );
  return res.data.result;
};

export const getModuleResources = async (moduleId: number): Promise<ResourceDTO[]> => {
  const res = await axiosInstance.get<ApiResponse<ResourceWireDTO[]>>("/module/resources", {
    params: { moduleId }
  });
  return (res.data.result ?? []).map((resource) => ({
    ...resource,
    actions: parseActions(resource.actions)
  }));
};
