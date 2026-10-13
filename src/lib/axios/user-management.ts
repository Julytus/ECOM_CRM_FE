import axiosInstance from "@/lib/axios/instance";
import type { ApiResponse } from "@/lib/types/common";
import type {
  FetchUsersParams,
  UpdateRoleOperatorInput,
  UserItem,
  UserListResult,
  UserPagePayload
} from "@/lib/types/user-management";

function normalizeUsers(payload: UserPagePayload | UserItem[] | null | undefined): UserListResult {
  if (Array.isArray(payload)) {
    return { users: payload, total: payload.length };
  }

  const users = payload?.items ?? payload?.content ?? payload?.data ?? payload?.result ?? [];

  return {
    users,
    total: payload?.total ?? payload?.totalElements ?? users.length
  };
}

export const fetchUsers = async (params: FetchUsersParams): Promise<UserListResult> => {
  const res = await axiosInstance.get<ApiResponse<UserPagePayload | UserItem[]>>("/user/list", {
    params: {
      keyword: params.keyword,
      page: params.page,
      limit: params.limit
    }
  });

  return normalizeUsers(res.data.result);
};

export const updateRoleOperator = async (input: UpdateRoleOperatorInput) => {
  const res = await axiosInstance.post<ApiResponse<string>>("/role/update", {
    id: input.roleId,
    isOperator: input.isOperator
  });

  return res.data.result;
};
