import axiosInstance from "@/lib/axios/instance";
import type { ApiResponse } from "@/lib/types/common";
import type {
  ResourceDTO,
  ResourceListApiRequest,
  ResourceListResponseDTO,
  ResourceListWireResponseDTO,
  ResourceWireDTO
} from "@/lib/types/resource";

/**
 * Backend lưu `actions` dạng JSON-array-string (vd `'["VIEW", "ADD"]'`).
 * Parse tại boundary và validate: dữ liệu lỗi/null không được làm crash cả trang
 * quản lý — trả `[]` (tương đương "không có quyền") an toàn hơn là throw.
 * Export để `lib/axios/permission.ts` dùng lại, tránh lặp logic parse.
 */
export const parseActions = (raw: string | null | undefined): string[] => {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((action): action is string => typeof action === "string");
  } catch {
    return [];
  }
};

const toResourceDTO = (item: ResourceWireDTO): ResourceDTO => ({
  ...item,
  actions: parseActions(item.actions)
});

export const getResources = async (
  params: ResourceListApiRequest
): Promise<ResourceListResponseDTO> => {
  const res = await axiosInstance.get<ApiResponse<ResourceListWireResponseDTO>>("/resource/list", {
    params: {
      keyword: params.keyword,
      active: params.active,
      moduleId: params.moduleId,
      unassigned: params.unassigned,
      page: params.paging?.page,
      limit: params.paging?.limit
    }
  });

  const result = res.data.result;
  return {
    total: result.total,
    page: result.page,
    items: (result.items ?? []).map(toResourceDTO)
  };
};

export const upsertResource = async (payload: Partial<ResourceDTO>): Promise<ResourceDTO> => {
  const res = await axiosInstance.post<ApiResponse<ResourceWireDTO>>("/resource/update", {
    ...payload,
    actions: JSON.stringify(payload.actions ?? [])
  });
  return toResourceDTO(res.data.result);
};

export const deleteResource = async (id: number) => {
  const res = await axiosInstance.delete<ApiResponse<number>>(`/resource/delete/${id}`);
  return res.data.result;
};

// `id` + `active` đi qua query param, không có body.
export const updateResourceStatus = async (id: number, active: number) => {
  const res = await axiosInstance.post<ApiResponse<number>>("/resource/update-status", null, {
    params: { id, active }
  });
  return res.data.result;
};
