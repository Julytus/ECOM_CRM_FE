import axiosInstance from "@/lib/axios/instance"; // Đường dẫn tới file instance của bạn

export interface ProductData {
  id: number;
  name: string;
  description: string;

  categoryId: number;
  categoryName: string | null;

  avgRating: number;

  image: string; // JSON string, e.g. "[]", '["url"]'
  thumbnail: string;

  active: 0 | 1; // backend uses int flag

  minPrice: number;
  maxPrice: number;

  originalMinPrice: number;
  originalMaxPrice: number;
}

export type SearchResponse = ProductSearchResponse | ChatSearchResponse;

export interface ProductSearchResponse {
  type: "PRODUCT";
  data: ProductData;
}

export interface ChatSearchResponse {
  type: "CHAT";

  message: string;
}

export const searchProduct = async (message: string): Promise<SearchResponse> => {
  const response = await axiosInstance.post("/ai/product/search", { message });
  return response.data;
};
