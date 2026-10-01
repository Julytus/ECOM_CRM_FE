import {
  queryOptions,
  type InfiniteData,
  type UseInfiniteQueryOptions,
  type UseMutationOptions
} from "@tanstack/react-query";
import {
  getCategories,
  getCategoryById,
  upsertCategory,
  deleteCategory
} from "@/lib/axios/category";
import type {
  CategoryDTO,
  CategoryListApiRequest,
  CategoryListResponseDTO
} from "@/lib/types/category";

const DEFAULT_LIMIT = 10;

export type CategoriesPage = CategoryListResponseDTO;

export const createInfiniteCategoriesQueryOptions = ({
  opts
}: {
  opts?: CategoryListApiRequest;
}): UseInfiniteQueryOptions<
  CategoriesPage,
  Error,
  InfiniteData<CategoriesPage>,
  unknown[],
  number | undefined
> => ({
  queryKey: ["categories", opts],
  queryFn: ({ pageParam }) => {
    const paging = pageParam
      ? { page: pageParam, limit: opts?.paging?.limit ?? DEFAULT_LIMIT }
      : opts?.paging;

    return getCategories({ ...opts, paging });
  },
  getNextPageParam: (lastPage) => {
    const limit = opts?.paging?.limit ?? DEFAULT_LIMIT;
    const totalPages = Math.ceil(lastPage.total / limit);
    const next = lastPage.page + 1;
    return next <= totalPages ? next : undefined;
  },
  initialPageParam: opts?.paging?.page ?? 1,
  refetchOnWindowFocus: false
});

export const categoryByIdQueryOptions = (id?: number) =>
  queryOptions({
    queryKey: ["category", id],
    queryFn: () => getCategoryById(id!),
    enabled: typeof id === "number" && id > 0
  });

export const upsertCategoryMutationOptions = (): UseMutationOptions<
  string,
  Error,
  Partial<CategoryDTO>
> => ({
  mutationFn: upsertCategory,
  meta: {
    invalidatesQuery: [["categories"]],
    successMessage: "Lưu Danh mục thành công",
    errorMessage: "Không thể lưu Danh mục"
  }
});

export const deleteCategoryMutationOptions = (): UseMutationOptions<string, Error, number> => ({
  mutationFn: deleteCategory,
  meta: {
    invalidatesQuery: [["categories"]],
    successMessage: "Xóa Danh mục thành công",
    errorMessage: "Không thể xóa Danh mục"
  }
});
