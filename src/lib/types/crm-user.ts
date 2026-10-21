import type { ApiResponse, Prettify } from "@/lib/types/common";
import type { PagingDTO } from "@/lib/types/paging";

/**
 * Subset có chủ đích của entity `auth.User` (~30 field) — chỉ giữ field mà
 * bảng quản lý + dialog upsert thực sự dùng.
 */
export interface CrmUserDTO {
  id: number;
  roleId?: number;
  roleName?: string;
  branchId?: number;
  branchName?: string;
  name: string;
  phone?: string;
  email?: string;
  active?: number;
  plainPassword?: string;
}

export interface CrmUserListApiRequest {
  lstUserId?: number[];
  keyword?: string;
  excludeUserId?: number;
  paging?: PagingDTO;
}

export interface CrmUserListResponseDTO {
  total: number;
  page: number;
  items: CrmUserDTO[];
}

export type CrmUserListApiResponse = Prettify<ApiResponse<CrmUserListResponseDTO>>;
export type CrmUserDetailsApiResponse = Prettify<ApiResponse<CrmUserDTO>>;
