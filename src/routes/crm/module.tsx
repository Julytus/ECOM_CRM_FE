"use client";

import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { useBulkDelete } from "@/hooks/use-bulk-delete";
import { DataTableAdvanced } from "@/components/crm/table/data-table-advanced";
import { DeleteConfirmDialog } from "@/components/crm/delete-confirm-dialog";
import { createModuleColumns } from "@/components/crm/module/columns";
import { AssignResourcesDialog } from "@/components/crm/module/assign-resources-dialog";
import { ModuleFormDialog } from "@/components/crm/module/module-dialog";
import {
  createInfiniteModulesQueryOptions,
  deleteModuleMutationOptions,
  assignResourcesMutationOptions,
  updateModuleStatusMutationOptions,
  upsertModuleMutationOptions
} from "@/lib/tanstack/options/module";
import type { ModuleDTO } from "@/lib/types/module";

export const Route = createFileRoute("/crm/module")({
  component: AdminModules
});

function AdminModules() {
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [filters, setFilters] = React.useState<Record<string, string>>({ keyword: "" });
  const [selectedModule, setSelectedModule] = React.useState<ModuleDTO | null>(null);
  const [assignModule, setAssignModule] = React.useState<ModuleDTO | null>(null);
  const [openForm, setOpenForm] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteModuleId, setDeleteModuleId] = React.useState<number | null>(null);
  const [deleteModuleName, setDeleteModuleName] = React.useState<string | undefined>();

  const {
    data: queryData,
    refetch,
    isFetching
  } = useInfiniteQuery(
    createInfiniteModulesQueryOptions({
      opts: {
        keyword: filters.keyword.trim() || undefined,
        paging: { limit: pagination.pageSize, page: pagination.pageIndex + 1 }
      }
    })
  );

  const modules = React.useMemo(
    () => queryData?.pages.flatMap((page) => page.items) ?? [],
    [queryData]
  );
  const total = queryData?.pages[0]?.total ?? 0;

  const upsertOptions = upsertModuleMutationOptions();
  const deleteOptions = deleteModuleMutationOptions();
  const statusOptions = updateModuleStatusMutationOptions();
  const upsertMutation = useMutation({
    ...upsertOptions,
    meta: {
      ...upsertOptions.meta,
      errorMessage: "Không thể lưu module. Mã module có thể đã tồn tại."
    }
  });
  const deleteMutation = useMutation({
    ...deleteOptions,
    meta: {
      ...deleteOptions.meta,
      errorMessage: "Không thể xóa module. Hãy kiểm tra module còn tài nguyên đang sử dụng."
    }
  });
  const statusMutation = useMutation(statusOptions);
  const updateModuleStatus = statusMutation.mutate;
  const assignMutation = useMutation(assignResourcesMutationOptions());

  const handleEdit = React.useCallback((module: ModuleDTO) => {
    setSelectedModule(module);
    setOpenForm(true);
  }, []);

  const handleShowDeleteConfirm = React.useCallback((id: number, name?: string) => {
    setDeleteModuleId(id);
    setDeleteModuleName(name);
    setDeleteDialogOpen(true);
  }, []);

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        void refetch();
        toast.success("Xóa module thành công");
      },
      onError: () => toast.error("Xóa module thất bại")
    });
  };

  const { run: handleDeleteSelected, isPending: isBulkDeleting } = useBulkDelete({
    deleteOne: deleteMutation.mutateAsync,
    onSettled: refetch,
    label: "module"
  });

  const handleToggleActive = React.useCallback(
    (module: ModuleDTO, active: boolean) => {
      updateModuleStatus(
        { id: module.id, active: active ? 1 : 0 },
        {
          onSuccess: () => {
            void refetch();
            toast.success("Cập nhật trạng thái module thành công");
          },
          onError: () => toast.error("Không thể cập nhật trạng thái module")
        }
      );
    },
    [refetch, updateModuleStatus]
  );

  const handleAssign = (module: ModuleDTO, resourceIds: number[]) => {
    assignMutation.mutate(
      { moduleId: module.id, resourceIds },
      {
        onSuccess: () => {
          setAssignModule(null);
          toast.success("Gán tài nguyên cho module thành công");
        },
        onError: () => toast.error("Không thể gán tài nguyên cho module")
      }
    );
  };

  const columns = React.useMemo(
    () =>
      createModuleColumns({
        onEdit: handleEdit,
        onShowDeleteConfirm: handleShowDeleteConfirm,
        onToggleActive: handleToggleActive,
        onAssign: setAssignModule
      }),
    [handleEdit, handleShowDeleteConfirm, handleToggleActive]
  );

  return (
    <>
      <DataTableAdvanced
        data={modules}
        columns={columns}
        total={total}
        pageSize={pagination.pageSize}
        pageIndex={pagination.pageIndex}
        onPaginationChange={(pageIndex, pageSize) => setPagination({ pageIndex, pageSize })}
        isLoading={isFetching || isBulkDeleting}
        onDeleteSelected={handleDeleteSelected}
        onRefresh={() => void refetch()}
        onAdd={() => {
          setSelectedModule(null);
          setOpenForm(true);
        }}
        addLabel="Thêm module"
        title="Quản lý module"
        description="Khai báo module để nhóm các tài nguyên trong hệ thống"
        filter={{
          fields: [{ key: "keyword", label: "Từ khóa", placeholder: "Tìm kiếm module..." }],
          values: filters,
          onChange: (values) => {
            setFilters(values);
            setPagination((current) => ({ ...current, pageIndex: 0 }));
          }
        }}
      />
      <ModuleFormDialog
        open={openForm}
        module={selectedModule}
        onOpenChange={setOpenForm}
        onSubmit={(values) =>
          upsertMutation.mutate(values, {
            onSuccess: () => {
              setOpenForm(false);
              void refetch();
              toast.success("Lưu module thành công");
            },
            onError: () => toast.error("Không thể lưu module. Mã module có thể đã tồn tại.")
          })
        }
      />
      <AssignResourcesDialog
        open={assignModule !== null}
        module={assignModule}
        isPending={assignMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setAssignModule(null);
        }}
        onAssign={(moduleId, resourceIds) => {
          const module = assignModule;
          if (module?.id === moduleId) handleAssign(module, resourceIds);
        }}
      />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        itemId={deleteModuleId}
        itemName={deleteModuleName}
        itemType="module"
        onConfirm={handleDelete}
        onOpenChange={setDeleteDialogOpen}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
