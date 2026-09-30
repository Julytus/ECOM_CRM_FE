import type { ApiResponse, Prettify } from "@/lib/types/common";
import type { PagingDTO } from "@/lib/types/paging";

export interface ProductReviewDTO {
  id: number;

  orderId: number;
  orderItemId: number;

  productId: number;
  productVariantId: number;

  userId: number;

  rating: number; // 1..5
  comment: string | null;
  files: string | null; // JSON string

  createdAt: string;
}

export interface ProductReviewListApiRequest {
  productId?: number;
  userId?: number;
  paging?: PagingDTO;
}

export interface ProductReviewListResponseDTO {
  total: number;
  page: number;
  items: ProductReviewDTO[];
}

export type ProductReviewListApiResponse = Prettify<ApiResponse<ProductReviewListResponseDTO>>;
export type ProductReviewApiResponse = Prettify<ApiResponse<ProductReviewDTO>>;
