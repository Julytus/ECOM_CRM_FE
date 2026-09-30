import type { UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import { getWishlist, addToWishlist, removeFromWishlist } from "@/lib/axios/wishlist";
import type {
  ProductWishlistDTO,
  WishlistAddApiRequest,
  WishlistRemoveApiRequest
} from "@/lib/types/wishlist";
import type { ErrorResponse, MessageResponse } from "@/lib/types/common";
import type { AxiosError } from "axios";

export const createWishlistQueryOptions = (): UseQueryOptions<
  ProductWishlistDTO[],
  Error,
  ProductWishlistDTO[],
  unknown[]
> => ({
  queryKey: ["wishlist"],
  queryFn: getWishlist,
  refetchOnWindowFocus: false,
  retry: 1
});

export const createAddToWishlistMutationOptions = (): UseMutationOptions<
  MessageResponse,
  AxiosError<ErrorResponse>,
  WishlistAddApiRequest
> => ({
  mutationFn: addToWishlist,
  meta: {
    invalidatesQuery: [["wishlist"]],
    successMessage: "Đã thêm vào danh sách yêu thích",
    errorMessage: "Không thể thêm vào danh sách yêu thích"
  }
});

export const createRemoveFromWishlistMutationOptions = (): UseMutationOptions<
  MessageResponse,
  AxiosError<ErrorResponse>,
  WishlistRemoveApiRequest
> => ({
  mutationFn: removeFromWishlist,
  meta: {
    invalidatesQuery: [["wishlist"]],
    successMessage: "Đã xoá khỏi danh sách yêu thích",
    errorMessage: "Không thể xoá khỏi danh sách yêu thích"
  }
});
