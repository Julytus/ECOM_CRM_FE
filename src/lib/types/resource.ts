import type { ApiResponse, Prettify } from "@/lib/types/common";
import type { PagingDTO } from "@/lib/types/paging";

/**
 * `actions` ở đây là mảng đã parse. Backend lưu/trả về JSON-array-string
 * (vd `'["VIEW", "ADD"]'`) — lớp `lib/axios/resource.ts` chịu trách nhiệm
 * JSON.parse khi đọc và JSON.stringify khi ghi, caller không bao giờ thấy raw string.
 */
export interface ResourceDTO {
  id: number;
  name: string;
  // BE trả `null` cho một số resource (quan sát thật: resource id=3) → không chỉ `string`.
  description?: string | null;
  code: string;
  uri: string;
  actions: string[];
  active?: number;
}

/** Shape thật trên dây (`actions` chưa parse) — chỉ dùng trong lớp axios. */
export type ResourceWireDTO = Omit<ResourceDTO, "actions"> & { actions: string | null };

export interface ResourceListApiRequest {
  keyword?: string;
  active?: number;
  paging?: PagingDTO;
}

export interface ResourceListResponseDTO {
  total: number;
  page: number;
  items: ResourceDTO[];
}

export interface ResourceListWireResponseDTO {
  total: number;
  page: number;
  items: ResourceWireDTO[];
}

export type ResourceListApiResponse = Prettify<ApiResponse<ResourceListResponseDTO>>;
