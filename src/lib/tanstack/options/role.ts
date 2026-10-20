import {
  type InfiniteData,
  type UseInfiniteQueryOptions,
  type UseMutationOptions
} from "@tanstack/react-query";
import { deleteRole, getRoles, upsertRole } from "@/lib/axios/role";
import type { RoleDTO, RoleListApiRequest, RoleListResponseDTO } from "@/lib/types/role";

const DEFAULT_LIMIT = 10;

export type RolesPage = RoleListResponseDTO;

export const createInfiniteRolesQueryOptions = ({
  opts
}: {
  opts?: RoleListApiRequest;
}): UseInfiniteQueryOptions<
  RolesPage,
  Error,
  InfiniteData<RolesPage>,
  unknown[],
  number | undefined
> => ({
  queryKey: ["roles", opts],
  queryFn: ({ pageParam }) => {
    const paging = pageParam
      ? { page: pageParam, limit: opts?.paging?.limit ?? DEFAULT_LIMIT }
      : opts?.paging;

    return getRoles({ ...opts, paging });
  },
  getNextPageParam: (lastPage) => {
    const limit = opts?.paging?.limit ?? DEFAULT_LIMIT;
    const totalPages = Math.ceil(lastPage.total / limit);
    const next = lastPage.page + 1;
    return next <= totalPages ? next : undefined;
  },
  initialPageParam: opts?.paging?.page ?? 1,
  refetchOnWindowFocus: false
});

export const upsertRoleMutationOptions = (): UseMutationOptions<
  RoleDTO,
  Error,
  Partial<RoleDTO>
> => ({
  mutationFn: upsertRole,
  meta: {
    invalidatesQuery: [["roles"]],
    successMessage: "Lưu Chức vụ thành công",
    errorMessage: "Không thể lưu Chức vụ"
  }
});

export const deleteRoleMutationOptions = (): UseMutationOptions<number, Error, number> => ({
  mutationFn: deleteRole,
  meta: {
    invalidatesQuery: [["roles"]],
    successMessage: "Xóa Chức vụ thành công",
    errorMessage: "Không thể xóa Chức vụ"
  }
});
