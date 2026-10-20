import { queryOptions, type UseMutationOptions } from "@tanstack/react-query";
import {
  addPermission,
  getPermissionInfo,
  getPermissionResources,
  removePermission
} from "@/lib/axios/permission";
import type { PermissionDTO, PermissionMutationPayload } from "@/lib/types/permission";

// Data không phân trang → dùng queryOptions thường, không phải infinite-query.
export const permissionInfoQueryOptions = (roleId?: number, name?: string) =>
  queryOptions({
    queryKey: ["permission-info", roleId, name],
    queryFn: () => getPermissionInfo(roleId!, name),
    enabled: typeof roleId === "number" && roleId > 0
  });

export const permissionResourceQueryOptions = () =>
  queryOptions({
    queryKey: ["permission-resource"],
    queryFn: getPermissionResources
  });

export const addPermissionMutationOptions = (): UseMutationOptions<
  PermissionDTO,
  Error,
  PermissionMutationPayload
> => ({
  mutationFn: addPermission,
  meta: {
    invalidatesQuery: [["permission-info"]],
    successMessage: "Thêm quyền thành công",
    errorMessage: "Không thể thêm quyền"
  }
});

export const removePermissionMutationOptions = (): UseMutationOptions<
  PermissionDTO,
  Error,
  PermissionMutationPayload
> => ({
  mutationFn: removePermission,
  meta: {
    invalidatesQuery: [["permission-info"]],
    successMessage: "Bỏ quyền thành công",
    errorMessage: "Không thể bỏ quyền"
  }
});
