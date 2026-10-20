import type { ResourceDTO, ResourceWireDTO } from "@/lib/types/resource";

/**
 * Domain này KHÔNG theo shape paged-CRUD: không có trang upsert/delete chung cho
 * permission, chỉ có matrix role × resource × action.
 * `actions` expose dạng đã parse; backend nhận/trả JSON-array-string.
 */
export interface PermissionDTO {
  id?: number;
  resourceId: number;
  roleId: number;
  actions: string[];
}

/** `ResourceInfo extends Resource { permission: PermissionInfo }` — flatten, không lồng base resource. */
export type ResourceInfoDTO = ResourceDTO & {
  permission: {
    roleId: number;
    actions: string[];
  };
};

export interface EBPermissionResourceDTO {
  code: string;
  actions: string[];
}

/** Payload dùng chung cho `/permission/add` và `/permission/remove`. */
export interface PermissionMutationPayload {
  resourceId: number;
  roleId: number;
  actions: string[];
}

// --- Shape thật trên dây (`actions` chưa parse) — chỉ dùng trong lớp axios ---

export type PermissionWireDTO = Omit<PermissionDTO, "actions"> & { actions: string | null };

export type ResourceInfoWireDTO = ResourceWireDTO & {
  permission: { roleId: number; actions: string | null } | null;
};

export type EBPermissionResourceWireDTO = Omit<EBPermissionResourceDTO, "actions"> & {
  actions: string | null;
};
