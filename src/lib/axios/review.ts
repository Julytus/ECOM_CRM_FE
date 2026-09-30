import axiosInstance from "@/lib/axios/instance";
import type {
  ProductReviewListApiRequest,
  ProductReviewListApiResponse,
  ProductReviewDTO
} from "@/lib/types/review";

export async function getProductReviews(params: ProductReviewListApiRequest) {
  const { data } = await axiosInstance.get<ProductReviewListApiResponse>("/productReview/list", {
    params
  });
  return data.result;
}

export async function createProductReview(review: Partial<ProductReviewDTO>) {
  const { data } = await axiosInstance.post("/productReview/update", review);
  return data;
}
