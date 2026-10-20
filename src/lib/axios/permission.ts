import axiosInstance from "@/lib/axios/instance";
import { parseActions } from "@/lib/axios/resource";
import type { ApiResponse } from "@/lib/types/common";
import type {
  EBPermissionResourceDTO,
  EBPermissionResourceWireDTO,
  PermissionDTO,
  PermissionMutationPayload,
  PermissionWireDTO,
  ResourceInfoDTO,
  ResourceInfoWireDTO
} from "@/lib/types/permission";

const toResourceInfoDTO = (item: ResourceInfoWireDTO): ResourceInfoDTO => ({
  ...item,
  // `actions` top-level = action resource HỖ TRỢ; `permission.actions` = action role ĐANG CÓ.
  actions: parseActions(item.actions),
  permission: {
    roleId: item.permission?.roleId ?? 0,
    actions: parseActions(item.permission?.actions)
  }
});

const toPermissionDTO = (item: PermissionWireDTO): PermissionDTO => ({
  ...item,
  actions: parseActions(item.actions)
});

export const getPermissionInfo = async (
  roleId: number,
  name?: string
): Promise<ResourceInfoDTO[]> => {
  const res = await axiosInstance.get<ApiResponse<ResourceInfoWireDTO[]>>("/permission/info", {
    params: { roleId, name }
  });
  return (res.data.result ?? []).map(toResourceInfoDTO);
};

/**
 * MERGE-ADD phía backend: thêm `actions` vào quyền role đã có trên resource đó,
 * KHÔNG replace toàn bộ. Caller chỉ cần gửi delta.
 */
export const addPermission = async (
  payload: PermissionMutationPayload
): Promise<PermissionDTO> => {
  const res = await axiosInstance.post<ApiResponse<PermissionWireDTO>>("/permission/add", {
    resourceId: payload.resourceId,
    roleId: payload.roleId,
    actions: JSON.stringify(payload.actions)
  });
  return toPermissionDTO(res.data.result);
};

/** MERGE-REMOVE phía backend: bỏ đúng `actions` được gửi, giữ phần còn lại. */
export const removePermission = async (
  payload: PermissionMutationPayload
): Promise<PermissionDTO> => {
  const res = await axiosInstance.post<ApiResponse<PermissionWireDTO>>("/permission/remove", {
    resourceId: payload.resourceId,
    roleId: payload.roleId,
    actions: JSON.stringify(payload.actions)
  });
  return toPermissionDTO(res.data.result);
};

/**
 * Không nhận param: backend đọc `roleId` của chính user đang đăng nhập từ JWT.
 * Phase 7 (sidebar) gọi hàm này để gate nav item theo quyền thật — giữ nguyên
 * tên và return shape.
 */
export const getPermissionResources = async (): Promise<EBPermissionResourceDTO[]> => {
  const res =
    await axiosInstance.get<ApiResponse<EBPermissionResourceWireDTO[]>>("/permission/resource");
  return (res.data.result ?? []).map((item) => ({
    code: item.code,
    actions: parseActions(item.actions)
  }));
};
