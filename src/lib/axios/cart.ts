import axiosInstance from "@/lib/axios/instance";
import type { ProductDTO } from "@/lib/types/product";

export const getCartItems = async (productIds: number[]): Promise<ProductDTO[]> => {
  if (productIds.length === 0) return [];

  const response = await axiosInstance.get<{
    code: number;
    message: string;
    result: ProductDTO[];
  }>("/product/get-by-ids", {
    params: {
      ids: productIds.map(String)
    }
  });

  return response.data.result;
};
