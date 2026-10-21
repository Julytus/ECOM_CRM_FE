import type { ApiResponse, Prettify } from "@/lib/types/common";
import type { PagingDTO } from "@/lib/types/paging";

export interface ModuleDTO {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  active?: number;
}

export interface ModuleListApiRequest {
  keyword?: string;
  active?: number;
  paging?: PagingDTO;
}

export interface ModuleListResponseDTO {
  total: number;
  page: number;
  items: ModuleDTO[];
}

export interface AssignResourcesRequest {
  moduleId: number;
  resourceIds: number[];
}

export interface ResourceIdsRequest {
  resourceIds: number[];
}

export type ModuleListApiResponse = Prettify<ApiResponse<ModuleListResponseDTO>>;
