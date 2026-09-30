import type { ApiResponse, Prettify } from "@/lib/types/common";
import type { PagingDTO } from "@/lib/types/paging";

/* ===========================
   Sorting & Filtering
=========================== */

export type ProductSortField = "id" | "minPrice" | "maxPrice" | "name" | "avgRating";

export type SortDirection = "asc" | "desc";

export type ProductStatus = 0 | 1;

/* ===========================
   Core DTOs
=========================== */

export interface ProductDTO {
  id: number;
  name: string;
  description: string | null;
  categoryId: number | null;
  categoryName: string | null;
  image: string | null;
  thumbnail: string | null;
  avgRating: number | null;
  active: ProductStatus;
  minPrice: number;
  maxPrice: number;
  originalMinPrice: number;
  originalMaxPrice: number;
}

export interface ProductVariantDetailDTO {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  image: string | null;
  price: number;
  originalPrice: number | null;
  stock: number;
  options: { size: string; color: string };
}

/* ===========================
   Attributes
=========================== */

export interface ProductAttributeOptionDTO {
  id: number;
  attributeId: number;
  value: string;
}

export interface ProductAttributeDTO {
  id: number;
  fieldName: string;
  name: string;
  options: ProductAttributeOptionDTO[];
}

/* ===========================
   Variants
=========================== */

export interface ProductVariantDTO {
  id: number;
  productId: number;
  sku: string;
  price: number;
  image: string | null;
  originalPrice: number;
  stock: number;
  createdAt: string | null;
  options: Record<string, string>;
}

/* ===========================
   Product Details
=========================== */

export interface ProductDetailsDTO extends ProductDTO {
  attributes: ProductAttributeDTO[];
  variants: ProductVariantDTO[];
}

/* ===========================
   List API
=========================== */

export interface ProductListApiRequest {
  keyword?: string;

  status?: number;

  minPrice?: number;
  maxPrice?: number;

  minRating?: number;
  maxRating?: number;

  inStock?: boolean;
  minStock?: number;

  sortBy?: ProductSortField;
  sortDir?: SortDirection;

  fromDate?: string;
  toDate?: string;

  paging?: PagingDTO;
}

export interface ProductListResponseDTO {
  total: number;
  page: number;
  items: ProductDTO[];
}

export interface ProductListApiResponse {
  code: number;
  message: string;
  result: ProductListResponseDTO;
}

/* ===========================
   Details API
=========================== */

export interface ProductListDetailsApiRequest {
  keyword?: string;
  categoryId?: number;
  active?: ProductStatus;
  priceFrom?: number;
  priceTo?: number;

  avgRatingFrom?: number;
  avgRatingTo?: number;

  ids?: number[];

  // minRating?: number;
  // maxRating?: number;

  // inStock?: boolean;
  // minStock?: number;

  sortBy?: ProductSortField;
  sortDir?: SortDirection;

  // fromDate?: string;
  // toDate?: string;

  paging?: PagingDTO;
}

export interface ProductListDetailsResponseDTO {
  total: number;
  page: number;
  items: ProductDetailsDTO[];
}

export interface ProductListDetailsApiResponse {
  code: number;
  message: string;
  result: ProductListDetailsResponseDTO;
}

/* ===========================
   Details API
=========================== */

export interface ProductDetailsApiRequest {
  id: string | number;
}

export interface ProductDetailsApiResponse {
  code: number;
  message: string;
  result: ProductDetailsDTO;
}

/* ===========================
  Variant Details API
=========================== */

export interface ProductVariantDetailApiRequest {
  id: number | string;
}

export type ProductVariantDetailApiResponse = Prettify<ApiResponse<ProductVariantDetailDTO>>;

export interface ProductVariantDetailByIdsApiRequest {
  ids: Array<number | string>;
}

export type ProductVariantDetailByIdsApiResponse = Prettify<ApiResponse<ProductVariantDetailDTO[]>>;

export interface CreateProductDTO {
  name: string;
  description?: string | null;
  categoryId?: number | null;
  active?: ProductStatus;
  image?: string | null;
  thumbnail?: string | null;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {
  id?: number;
}

export interface CreateProductVariantDTO {
  productId: number;
  sku: string;
  price: number;
  originalPrice?: number | null;
  stock: number;
  attributeValueIds: number[] | null;
}

export interface UpdateProductVariantDTO extends Partial<CreateProductVariantDTO> {
  id: number;
}

export interface CreateProductAttributeDTO {
  id?: number | null;
  productId: number;
  fieldName: string;
  name: string;
}

export interface CreateProductAttributeOptionDTO {
  id?: number | null;
  attributeId: number;
  value: string;
}

export type ProductAttributeApiResponse = Prettify<ApiResponse<ProductAttributeDTO>>;
export type ProductAttributeListApiResponse = Prettify<ApiResponse<ProductAttributeDTO[]>>;
