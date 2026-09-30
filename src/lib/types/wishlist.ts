import type { ApiResponse, MessageResponse } from "@/lib/types/common";

export interface ProductWishlistDTO {
  productId: number;
  createdAt: string;
}

/** Responses */
export type WishlistApiResponse = ApiResponse<ProductWishlistDTO[]>;
export type WishlistAddApiResponse = ApiResponse<MessageResponse>;
export type WishlistRemoveApiResponse = ApiResponse<MessageResponse>;

/** Requests */
export interface WishlistAddApiRequest {
  productId: number;
}

export interface WishlistRemoveApiRequest {
  productId: number;
}
