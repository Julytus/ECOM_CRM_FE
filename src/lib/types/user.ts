import type { PagingDTO } from "@/lib/types/paging";

export type UserSortField = "id" | "email" | "fullname" | "active" | "role";

export type SortDirection = "asc" | "desc";

export interface UserDTO {
  id: number;
  name: string;
  phone: string;
  password: string | null;
  plainPassword: string | null;
  avatar: string | null;
  email: string;
  role: "user" | "admin";
  active: boolean;
  username: string;
}

export interface UserListResponseDTO {
  total: number;
  page: number;
  items: UserDTO[];
}

export interface UserListApiRequest {
  keyword?: string;
  status?: number;
  sortBy?: UserSortField;
  sortDir?: SortDirection;
  paging?: PagingDTO;
}

export interface UserListApiResponse {
  code: number;
  message: string;
  result: UserListResponseDTO;
}

export interface UserDetailsApiRequest {
  id: string | number;
}

export interface UserDetailsApiResponse {
  code: number;
  message: string;
  result: UserDTO;
}

export interface GetMeApiResponse {
  code: number;
  message: string;
  result: UserDTO;
}

export interface ChangePasswordApiRequest {
  oldPassword: string;
  newPassword: string;
}

export interface UpdateUserInfoRequest {
  name: string;
  email: string;
  phone: string;
}
