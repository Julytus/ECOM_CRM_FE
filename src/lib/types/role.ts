import type { ApiResponse, Prettify } from "@/lib/types/common";
import type { PagingDTO } from "@/lib/types/paging";

export interface RoleDTO {
  id: number;
  name: string;
  isDefault?: number;
  isOperator?: number;
}

export interface RoleListApiRequest {
  id?: number;
  keyword?: string;
  isDefault?: number;
  isOperator?: number;
  paging?: PagingDTO;
}

export interface RoleListResponseDTO {
  total: number;
  page: number;
  items: RoleDTO[];
}

export type RoleListApiResponse = Prettify<ApiResponse<RoleListResponseDTO>>;
