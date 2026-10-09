import axiosInstance from "@/lib/axios/instance";
import type { CategoryDTO } from "@/lib/types/category";
import type { DeleteResponse } from "@/lib/types/common";
import type {
  ProductListApiRequest,
  ProductListApiResponse,
  ProductListDetailsApiRequest,
  ProductListDetailsApiResponse,
  ProductDetailsApiResponse,
  ProductVariantDetailApiResponse,
  ProductVariantDetailByIdsApiResponse,
  ProductDetailsDTO,
  ProductVariantDetailDTO,
  CreateProductDTO,
  UpdateProductDTO,
  CreateProductVariantDTO,
  UpdateProductVariantDTO,
  CreateProductAttributeDTO,
  CreateProductAttributeOptionDTO
} from "@/lib/types/product";

/* ---------- Products ---------- */

export const getProducts = async (params: ProductListApiRequest) => {
  const res = await axiosInstance.get<ProductListApiResponse>("/product/list", {
    params: { ...params, ...params.paging }
  });
  return res.data.result;
};

export const getProductDetails = async (id: number | string) => {
  const res = await axiosInstance.get<ProductDetailsApiResponse>(`/product/detail/${id}`);
  return res.data.result;
};

export const getProductDetailsList = async (params: ProductListDetailsApiRequest) => {
  const res = await axiosInstance.get<ProductListDetailsApiResponse>("/product/list-detail", {
    params: { ...params, ...params.paging, ids: params.ids?.join(",") }
  });
  return res.data.result;
};

export const createProduct = async (payload: CreateProductDTO) => {
  const res = await axiosInstance.post<ProductDetailsApiResponse>(
    "/product/createWithStaticAttributes",
    payload
  );
  return res.data.result;
};

export const updateProduct = async (payload: UpdateProductDTO) => {
  const res = await axiosInstance.post<ProductDetailsApiResponse>("/product/update", payload);
  return res.data.result;
};

export const deleteProduct = async (id: number) => {
  const res = await axiosInstance.delete<DeleteResponse>(`/product/delete/${id}`);
  return res.data.result;
};

export const deleteProducts = async (ids: number[]) => {
  const promises = [];

  for (const id of ids) {
    promises.push(deleteProduct(id));
  }

  return Promise.all(promises);
};

/* ---------- Categories ---------- */

export const getCategories = async () => {
  const res = await axiosInstance.get<{
    code: number;
    message: string;
    result: { items: CategoryDTO[] };
  }>("/categoryItem/list", { params: { limit: 100 } });
  return res.data.result.items;
};

/* ---------- Variants ---------- */

export const getProductVariantDetail = async (
  id: number | string
): Promise<ProductVariantDetailDTO> => {
  const res = await axiosInstance.get<ProductVariantDetailApiResponse>(
    `/productVariant/detail/${id}`
  );
  return res.data.result;
};

export const getProductVariantDetailByIds = async (ids: Array<number | string>) => {
  const res = await axiosInstance.get<ProductVariantDetailByIdsApiResponse>(
    "/productVariant/detailByIds",
    { params: { ids: ids.join(",") } }
  );
  return res.data.result;
};

export const createProductVariant = async (payload: CreateProductVariantDTO) => {
  const res = await axiosInstance.post<ProductVariantDetailApiResponse>(
    "/productVariant/update",
    payload
  );
  return res.data.result;
};

export const updateProductVariant = async (payload: UpdateProductVariantDTO) => {
  const res = await axiosInstance.post<ProductVariantDetailApiResponse>(
    "/productVariant/update",
    payload
  );
  return res.data.result;
};

export const deleteProductVariant = async (id: number) => {
  const res = await axiosInstance.delete<DeleteResponse>(`/productVariant/${id}`);
  return res.data.result;
};

/* ---------- Attributes ---------- */

export const createProductAttribute = async (payload: CreateProductAttributeDTO) => {
  const res = await axiosInstance.post("/productAttribute/update", payload);
  return res.data.result;
};

export const createProductAttributeOption = async (payload: CreateProductAttributeOptionDTO) => {
  const res = await axiosInstance.post("/attributeValue/update", payload);
  return res.data.result;
};
