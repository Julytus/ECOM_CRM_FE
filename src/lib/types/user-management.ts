export type UserItem = {
  id: number;
  name?: string | null;
  alias?: string | null;
  phone?: string | null;
  email?: string | null;
  roleId?: number | null;
  roleName?: string | null;
  branchName?: string | null;
  active?: number | null;
  isOperator?: number | null;
  regisDate?: string | null;
};

export type UserPagePayload = {
  items?: UserItem[];
  content?: UserItem[];
  data?: UserItem[];
  result?: UserItem[];
  total?: number;
  totalElements?: number;
  pageable?: unknown;
};

export type UserListResult = {
  users: UserItem[];
  total: number;
};

export type FetchUsersParams = {
  keyword: string;
  page: number;
  limit: number;
};

export type UpdateRoleOperatorInput = {
  roleId: number;
  isOperator: 0 | 1;
};
