import {
  getProductDetails,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductVariantDetailByIds,
  getProducts,
  getProductDetailsList,
  getCategories,
  getProductVariantDetail,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
  createProductAttribute,
  createProductAttributeOption,
  deleteProducts
} from "@/lib/axios/product";

import type { CategoryDTO } from "@/lib/types/category";

import type {
  ProductDetailsApiRequest,
  ProductListApiRequest,
  ProductListResponseDTO,
  ProductDTO,
  ProductDetailsDTO,
  ProductListDetailsApiRequest,
  ProductListDetailsResponseDTO,
  ProductVariantDetailByIdsApiRequest,
  ProductVariantDetailDTO,
  CreateProductDTO,
  CreateProductVariantDTO,
  UpdateProductVariantDTO,
  CreateProductAttributeDTO,
  CreateProductAttributeOptionDTO,
  UpdateProductDTO,
  ProductAttributeDTO
} from "@/lib/types/product";

import type {
  InfiniteData,
  UseInfiniteQueryOptions,
  UseMutationOptions,
  UseQueryOptions,
  QueryKey
} from "@tanstack/react-query";

/* ===========================
   Constants
=========================== */

export const DEFAULT_LIMIT = 10;

/* ===========================
   Infinite Products List
=========================== */

export type ProductsPage = ProductListResponseDTO;

export const createInfiniteProductsQueryOptions = ({
  opts
}: {
  opts?: ProductListApiRequest;
}): UseInfiniteQueryOptions<
  ProductsPage,
  Error,
  InfiniteData<ProductsPage>,
  ["products", ProductListApiRequest | undefined],
  number
> => ({
  queryKey: ["products", opts],
  queryFn: ({ pageParam = opts?.paging?.page ?? 1 }) =>
    getProducts({
      ...opts,
      paging: {
        page: pageParam,
        limit: opts?.paging?.limit ?? DEFAULT_LIMIT
      }
    }),
  getNextPageParam: (lastPage) => {
    const limit = opts?.paging?.limit ?? DEFAULT_LIMIT;
    const totalPages = Math.ceil(lastPage.total / limit);
    return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
  },
  initialPageParam: opts?.paging?.page ?? 1,
  refetchOnWindowFocus: false
});

/* ===========================
   Infinite Product Details List
=========================== */

export type ProductDetailsPage = ProductListDetailsResponseDTO;

export const createInfiniteProductDetailsQueryOptions = ({
  opts
}: {
  opts?: ProductListDetailsApiRequest;
}): UseInfiniteQueryOptions<
  ProductDetailsPage,
  Error,
  InfiniteData<ProductDetailsPage>,
  ["product-details", ProductListDetailsApiRequest | undefined],
  number
> => ({
  queryKey: ["product-details", opts],
  queryFn: ({ pageParam = opts?.paging?.page ?? 1 }) =>
    getProductDetailsList({
      ...opts,
      paging: {
        page: pageParam,
        limit: opts?.paging?.limit ?? DEFAULT_LIMIT
      }
    }),
  getNextPageParam: (lastPage) => {
    const limit = opts?.paging?.limit ?? DEFAULT_LIMIT;
    const totalPages = Math.ceil(lastPage.total / limit);
    return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
  },
  initialPageParam: opts?.paging?.page ?? 1,
  refetchOnWindowFocus: false
});

/* ===========================
   Product Details Query
=========================== */

export const createProductDetailsQueryOptions = ({
  id
}: ProductDetailsApiRequest): UseQueryOptions<
  ProductDetailsDTO,
  Error,
  ProductDetailsDTO,
  ["product", number | string]
> => ({
  queryKey: ["product", id],
  queryFn: () => getProductDetails(id),
  enabled: Boolean(id)
});

/* ===========================
   Variant Details By Ids
=========================== */

export const createProductVariantDetailByIdsQueryOptions = ({
  ids
}: ProductVariantDetailByIdsApiRequest): UseQueryOptions<
  ProductVariantDetailDTO[],
  Error,
  ProductVariantDetailDTO[],
  ["product-variant", "by-ids", (number | string)[]]
> => ({
  queryKey: ["product-variant", "by-ids", ids],
  queryFn: () => getProductVariantDetailByIds(ids),
  enabled: ids.length > 0
});

/* ===========================
   Categories
=========================== */

export const createCategoriesQueryOptions = (): UseQueryOptions<
  CategoryDTO[],
  Error,
  CategoryDTO[],
  ["categories"]
> => ({
  queryKey: ["categories"],
  queryFn: getCategories
});

/* ===========================
   Variant Details
=========================== */

export const createProductVariantDetailQueryOptions = ({
  id
}: {
  id: number | string;
}): UseQueryOptions<
  ProductVariantDetailDTO,
  Error,
  ProductVariantDetailDTO,
  ["product-variant", "detail", number | string]
> => ({
  queryKey: ["product-variant", "detail", id],
  queryFn: () => getProductVariantDetail(id),
  enabled: !!id
});

/* ===========================
   Mutations
=========================== */

export const createProductMutationOptions = (): UseMutationOptions<
  ProductDetailsDTO,
  Error,
  CreateProductDTO
> => ({
  mutationFn: createProduct,
  meta: {
    invalidatesQuery: [["products"], ["product-details"]],
    successMessage: "Tạo sản phẩm thành công",
    errorMessage: "Không thể tạo sản phẩm"
  }
});

export const updateProductMutationOptions = (): UseMutationOptions<
  ProductDTO,
  Error,
  UpdateProductDTO
> => ({
  mutationFn: updateProduct,
  meta: {
    invalidatesQuery: [["products"], ["product", ""], ["product-details"]],
    successMessage: "Cập nhật sản phẩm thành công",
    errorMessage: "Không thể cập nhật sản phẩm"
  }
});

export const deleteProductMutationOptions = (): UseMutationOptions<number, Error, number> => ({
  mutationFn: deleteProduct,
  meta: {
    invalidatesQuery: [["products"]],
    successMessage: "Xóa sản phẩm thành công",
    errorMessage: "Không thể xóa sản phẩm"
  }
});

export const deleteProductsMutationOptions = (): UseMutationOptions<number[], Error, number[]> => ({
  mutationFn: deleteProducts,
  meta: {
    invalidatesQuery: [["products"], ["product-details"]],
    successMessage: "Đã xóa các sản phẩm đã chọn",
    errorMessage: "Không thể xóa một hoặc nhiều sản phẩm"
  }
});

export const createProductVariantMutationOptions = (): UseMutationOptions<
  ProductVariantDetailDTO,
  Error,
  CreateProductVariantDTO
> => ({
  mutationFn: createProductVariant,
  meta: {
    invalidatesQuery: [["product-variant"], ["product"]]
    // successMessage: "Tạo biến thể thành công",
    // errorMessage: "Không thể tạo biến thể"
  }
});

export const updateProductVariantMutationOptions = (): UseMutationOptions<
  ProductVariantDetailDTO,
  Error,
  UpdateProductVariantDTO
> => ({
  mutationFn: updateProductVariant,
  meta: {
    invalidatesQuery: [["product-variant"], ["product"]]
    // successMessage: "Cập nhật biến thể thành công",
    // errorMessage: "Không thể cập nhật biến thể"
  }
});

export const deleteProductVariantMutationOptions = (): UseMutationOptions<
  unknown,
  Error,
  number
> => ({
  mutationFn: deleteProductVariant,
  meta: {
    invalidatesQuery: [["product-variant"], ["product"]]
    // successMessage: "Xóa biến thể thành công",
    // errorMessage: "Không thể xóa biến thể"
  }
});

export const createProductAttributeMutationOptions = (): UseMutationOptions<
  ProductAttributeDTO,
  Error,
  CreateProductAttributeDTO
> => ({
  mutationFn: createProductAttribute,
  meta: {
    invalidatesQuery: [["product"]]
    // successMessage: "Tạo thuộc tính thành công",
    // errorMessage: "Không thể tạo thuộc tính"
  }
});

export const createProductAttributeOptionMutationOptions = (): UseMutationOptions<
  unknown,
  Error,
  CreateProductAttributeOptionDTO
> => ({
  mutationFn: createProductAttributeOption,
  meta: {
    invalidatesQuery: [["product"]]
    // successMessage: "Tạo giá trị thuộc tính thành công",
    // errorMessage: "Không thể tạo giá trị thuộc tính"
  }
});
