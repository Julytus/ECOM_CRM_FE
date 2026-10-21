import {
  type InfiniteData,
  type UseInfiniteQueryOptions,
  type UseMutationOptions
} from "@tanstack/react-query";
import {
  assignResources,
  deleteModule,
  getModules,
  unassignResources,
  updateModuleStatus,
  upsertModule
} from "@/lib/axios/module";
import type {
  AssignResourcesRequest,
  ModuleDTO,
  ModuleListApiRequest,
  ModuleListResponseDTO,
  ResourceIdsRequest
} from "@/lib/types/module";

const DEFAULT_LIMIT = 10;

export type ModulesPage = ModuleListResponseDTO;

export const createInfiniteModulesQueryOptions = ({
  opts
}: {
  opts?: ModuleListApiRequest;
}): UseInfiniteQueryOptions<
  ModulesPage,
  Error,
  InfiniteData<ModulesPage>,
  unknown[],
  number | undefined
> => ({
  queryKey: ["modules", opts],
  queryFn: ({ pageParam }) => {
    const paging = pageParam
      ? { page: pageParam, limit: opts?.paging?.limit ?? DEFAULT_LIMIT }
      : opts?.paging;

    return getModules({ ...opts, paging });
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

export const upsertModuleMutationOptions = (): UseMutationOptions<
  ModuleDTO,
  Error,
  Partial<ModuleDTO>
> => ({
  mutationFn: upsertModule,
  meta: {
    invalidatesQuery: [["modules"]],
    successMessage: "Lưu module thành công",
    errorMessage: "Không thể lưu module"
  }
});

export const deleteModuleMutationOptions = (): UseMutationOptions<number, Error, number> => ({
  mutationFn: deleteModule,
  meta: {
    invalidatesQuery: [["modules"]],
    successMessage: "Xóa module thành công",
    errorMessage: "Không thể xóa module"
  }
});

export interface UpdateModuleStatusVariables {
  id: number;
  active: number;
}

export const updateModuleStatusMutationOptions = (): UseMutationOptions<
  number,
  Error,
  UpdateModuleStatusVariables
> => ({
  mutationFn: ({ id, active }) => updateModuleStatus(id, active),
  meta: {
    invalidatesQuery: [["modules"]],
    successMessage: "Cập nhật trạng thái module thành công",
    errorMessage: "Không thể cập nhật trạng thái module"
  }
});

export const assignResourcesMutationOptions = (): UseMutationOptions<
  number,
  Error,
  AssignResourcesRequest
> => ({
  mutationFn: assignResources,
  meta: {
    invalidatesQuery: [["modules"], ["resources"]],
    successMessage: "Gán tài nguyên cho module thành công",
    errorMessage: "Không thể gán tài nguyên cho module"
  }
});

export const unassignResourcesMutationOptions = (): UseMutationOptions<
  number,
  Error,
  ResourceIdsRequest
> => ({
  mutationFn: unassignResources,
  meta: {
    invalidatesQuery: [["modules"], ["resources"]],
    successMessage: "Gỡ tài nguyên khỏi module thành công",
    errorMessage: "Không thể gỡ tài nguyên khỏi module"
  }
});
