import { getCartItems } from "@/lib/axios/cart";
import type { ProductDTO } from "@/lib/types/product";
import type { UseQueryOptions } from "@tanstack/react-query";

export const createCartProductsQueryOptions = ({
  ids,
  enabled = true
}: {
  ids: number[];
  enabled?: boolean;
}): UseQueryOptions<ProductDTO[], Error> => {
  return {
    queryKey: ["cart-items", ids],
    queryFn: () => getCartItems(ids),
    enabled: enabled && ids.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  };
};
