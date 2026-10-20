import {
  type InfiniteData,
  type UseInfiniteQueryOptions,
  type UseMutationOptions
} from "@tanstack/react-query";
import {
  deleteResource,
  getResources,
  updateResourceStatus,
  upsertResource
} from "@/lib/axios/resource";
import type {
  ResourceDTO,
  ResourceListApiRequest,
  ResourceListResponseDTO
} from "@/lib/types/resource";

const DEFAULT_LIMIT = 10;

export type ResourcesPage = ResourceListResponseDTO;

export const createInfiniteResourcesQueryOptions = ({
  opts
}: {
  opts?: ResourceListApiRequest;
}): UseInfiniteQueryOptions<
  ResourcesPage,
  Error,
  InfiniteData<ResourcesPage>,
  unknown[],
  number | undefined
> => ({
  queryKey: ["resources", opts],
  queryFn: ({ pageParam }) => {
    const paging = pageParam
      ? { page: pageParam, limit: opts?.paging?.limit ?? DEFAULT_LIMIT }
      : opts?.paging;

    return getResources({ ...opts, paging });
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

export const upsertResourceMutationOptions = (): UseMutationOptions<
  ResourceDTO,
  Error,
  Partial<ResourceDTO>
> => ({
  mutationFn: upsertResource,
  meta: {
    invalidatesQuery: [["resources"]],
    successMessage: "Lưu Tài nguyên thành công",
    errorMessage: "Không thể lưu Tài nguyên"
  }
});

export const deleteResourceMutationOptions = (): UseMutationOptions<number, Error, number> => ({
  mutationFn: deleteResource,
  meta: {
    invalidatesQuery: [["resources"]],
    successMessage: "Xóa Tài nguyên thành công",
    errorMessage: "Không thể xóa Tài nguyên"
  }
});

export interface UpdateResourceStatusVariables {
  id: number;
  active: number;
}

export const updateResourceStatusMutationOptions = (): UseMutationOptions<
  number,
  Error,
  UpdateResourceStatusVariables
> => ({
  mutationFn: ({ id, active }) => updateResourceStatus(id, active),
  meta: {
    invalidatesQuery: [["resources"]],
    successMessage: "Cập nhật trạng thái Tài nguyên thành công",
    errorMessage: "Không thể cập nhật trạng thái Tài nguyên"
  }
});
