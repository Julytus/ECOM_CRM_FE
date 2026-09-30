import axiosInstance from "@/lib/axios/instance";
import type {
  WishlistApiResponse,
  WishlistAddApiRequest,
  WishlistAddApiResponse,
  WishlistRemoveApiRequest,
  WishlistRemoveApiResponse
} from "@/lib/types/wishlist";

/** GET wishlist */
export const getWishlist = async () => {
  const response = await axiosInstance.get<WishlistApiResponse>("/wishlist");
  return response.data.result;
};

/** POST add */
export const addToWishlist = async ({ productId }: WishlistAddApiRequest) => {
  const response = await axiosInstance.post<WishlistAddApiResponse>("/wishlist/add", productId, {
    headers: { "Content-Type": "application/json" }
  });
  return response.data.result;
};

/** DELETE remove */
export const removeFromWishlist = async ({ productId }: WishlistRemoveApiRequest) => {
  const response = await axiosInstance.delete<WishlistRemoveApiResponse>("/wishlist/remove", {
    params: { productId }
  });
  return response.data.result;
};
