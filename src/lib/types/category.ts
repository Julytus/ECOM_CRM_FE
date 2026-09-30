import type { ApiResponse, Prettify } from "@/lib/types/common";
import type { PagingDTO } from "@/lib/types/paging";

export interface CategoryDTO {
  id: number;
  name: string;
  description: string | null;
}

export interface CategoryListApiRequest {
  keyword?: string;
  paging?: PagingDTO;
}

export interface CategoryListResponseDTO {
  total: number;
  page: number;
  items: CategoryDTO[];
}

export type CategoryListApiResponse = Prettify<ApiResponse<CategoryListResponseDTO>>;
export type CategoryDetailsApiResponse = Prettify<ApiResponse<CategoryDTO>>;
