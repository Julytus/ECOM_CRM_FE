import {
  changePassword,
  getInfiniteUsers,
  getMe,
  setUserActive,
  updateUser,
  updateUserInfo
} from "@/lib/axios/user";
import type { MeApiResponse, MeDTO } from "@/lib/types/auth";
import type { ErrorResponse, MessageResponse } from "@/lib/types/common";
import type {
  ChangePasswordApiRequest,
  GetMeApiResponse,
  UpdateUserInfoRequest,
  UserDTO,
  UserListApiRequest,
  UserListResponseDTO
} from "@/lib/types/user";
import type {
  InfiniteData,
  UseInfiniteQueryOptions,
  UseMutationOptions,
  UseQueryOptions
} from "@tanstack/react-query";
import type { AxiosError } from "axios";

export type UsersPage = UserListResponseDTO;

const DEFAULT_LIMIT = 10;

export const createInfiniteUsersQueryOptions = ({
  opts
}: {
  opts?: UserListApiRequest;
}): UseInfiniteQueryOptions<
  UsersPage,
  Error,
  InfiniteData<UsersPage>,
  unknown[],
  number | undefined
> => {
  return {
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      "users",
      {
        keyword: opts?.keyword,
        status: opts?.status,
        sortBy: opts?.sortBy,
        sortDir: opts?.sortDir
      },
      opts?.paging
    ],

    queryFn: ({ pageParam }) => {
      const paging = pageParam
        ? { page: pageParam, limit: opts?.paging?.limit ?? DEFAULT_LIMIT }
        : opts?.paging;

      return getInfiniteUsers({
        ...opts,
        paging
      });
    },

    getNextPageParam: (lastPage) => {
      const limit = opts?.paging?.limit ?? DEFAULT_LIMIT;
      const totalPages = Math.ceil(lastPage.total / limit);
      const nextPage = lastPage.page + 1;

      return nextPage <= totalPages ? nextPage : undefined;
    },

    initialPageParam: opts?.paging?.page ?? 1,
    refetchOnWindowFocus: false
  };
};

export const createUpdateUserInfoMutationOptions = (): UseMutationOptions<
  MessageResponse,
  AxiosError<ErrorResponse>,
  UpdateUserInfoRequest
> => ({
  mutationFn: updateUserInfo,
  meta: {
    invalidatesQuery: [["me"]],
    successMessage: "Cập nhật thông tin thành công",
    errorMessage: "Không thể cập nhật thông tin"
  }
});

export const createUpdateUserMutationOptions = (): UseMutationOptions<
  UserDTO,
  AxiosError<ErrorResponse>,
  UserDTO
> => ({
  mutationFn: updateUser,
  meta: {
    invalidatesQuery: [["users"]],
    successMessage: "Cập nhật thông tin thành công",
    errorMessage: "Không thể cập nhật thông tin"
  }
});

export const setUserActiveMutationOptions = (): UseMutationOptions<
  string,
  Error,
  { id: number; active: boolean }
> => ({
  mutationFn: ({ id, active }) => setUserActive(id, active),
  meta: {
    invalidatesQuery: [["users"]],
    successMessage: "Cập nhật trạng thái thành công",
    errorMessage: "Không thể cập nhật trạng thái"
  }
});

export const createChangePasswordMutationOptions = (): UseMutationOptions<
  MessageResponse,
  AxiosError<ErrorResponse>,
  ChangePasswordApiRequest
> => ({
  mutationFn: changePassword,
  meta: {
    successMessage: "Đổi mật khẩu thành công"
    // errorMessage: "Không thể đổi mật khẩu"
  }
});
