import {
  queryOptions,
  type InfiniteData,
  type UseInfiniteQueryOptions,
  type UseMutationOptions
} from "@tanstack/react-query";
import {
  deleteCrmUser,
  getCrmUserById,
  getCrmUsers,
  upsertCrmUser
} from "@/lib/axios/crm-user";
import type {
  CrmUserDTO,
  CrmUserListApiRequest,
  CrmUserListResponseDTO
} from "@/lib/types/crm-user";

const DEFAULT_LIMIT = 10;

export type CrmUsersPage = CrmUserListResponseDTO;

export const createInfiniteCrmUsersQueryOptions = ({
  opts
}: {
  opts?: CrmUserListApiRequest;
}): UseInfiniteQueryOptions<
  CrmUsersPage,
  Error,
  InfiniteData<CrmUsersPage>,
  unknown[],
  number | undefined
> => ({
  queryKey: ["crm-users", opts],
  queryFn: ({ pageParam }) => {
    const paging = pageParam
      ? { page: pageParam, limit: opts?.paging?.limit ?? DEFAULT_LIMIT }
      : opts?.paging;

    return getCrmUsers({ ...opts, paging });
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

export const crmUserByIdQueryOptions = (id?: number) =>
  queryOptions({
    queryKey: ["crm-user", id],
    queryFn: () => getCrmUserById(id!),
    enabled: typeof id === "number" && id > 0
  });

export const upsertCrmUserMutationOptions = (): UseMutationOptions<
  CrmUserDTO,
  Error,
  Partial<CrmUserDTO>
> => ({
  mutationFn: upsertCrmUser,
  meta: {
    invalidatesQuery: [["crm-users"]],
    successMessage: "Lưu Tài khoản thành công",
    errorMessage: "Không thể lưu Tài khoản"
  }
});

export const deleteCrmUserMutationOptions = (): UseMutationOptions<number, Error, number> => ({
  mutationFn: deleteCrmUser,
  meta: {
    invalidatesQuery: [["crm-users"]],
    successMessage: "Xóa Tài khoản thành công",
    errorMessage: "Không thể xóa Tài khoản"
  }
});
