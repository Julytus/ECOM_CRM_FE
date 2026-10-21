"use client";

import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";

import { DataTableAdvanced } from "@/components/admin/table/data-table-advanced";
import { createModuleColumns } from "@/components/crm/module/columns";
import { AssignResourcesDialog } from "@/components/crm/module/assign-resources-dialog";
import { ModuleFormDialog } from "@/components/crm/module/module-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
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
  const [keyword, setKeyword] = React.useState("");
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
        keyword: keyword.trim() || undefined,
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
  const assignMutation = useMutation(assignResourcesMutationOptions());

  const handleEdit = (module: ModuleDTO) => {
    setSelectedModule(module);
    setOpenForm(true);
  };

  const handleShowDeleteConfirm = (id: number, name?: string) => {
    setDeleteModuleId(id);
    setDeleteModuleName(name);
    setDeleteDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        void refetch();
      }
    });
  };

  const handleToggleActive = (module: ModuleDTO, active: boolean) => {
    statusMutation.mutate(
      { id: module.id, active: active ? 1 : 0 },
      {
        onSuccess: () => void refetch()
      }
    );
  };

  const handleAssign = (module: ModuleDTO, resourceIds: number[]) => {
    assignMutation.mutate(
      { moduleId: module.id, resourceIds },
      { onSuccess: () => setAssignModule(null) }
    );
  };

  const columns = createModuleColumns({
    onEdit: handleEdit,
    onShowDeleteConfirm: handleShowDeleteConfirm,
    onToggleActive: handleToggleActive,
    onAssign: setAssignModule
  });

  return (
    <>
      <div className="container mx-auto px-6 pt-6">
        <Input
          value={keyword}
          onChange={(event) => {
            setKeyword(event.target.value);
            setPagination((current) => ({ ...current, pageIndex: 0 }));
          }}
          placeholder="Tìm kiếm module..."
          aria-label="Tìm kiếm module"
          className="max-w-sm"
        />
      </div>
      <DataTableAdvanced
        data={modules}
        columns={columns}
        total={total}
        pageSize={pagination.pageSize}
        pageIndex={pagination.pageIndex}
        onPaginationChange={(pageIndex, pageSize) => setPagination({ pageIndex, pageSize })}
        isLoading={isFetching}
        onRefresh={() => void refetch()}
        onAdd={() => {
          setSelectedModule(null);
          setOpenForm(true);
        }}
        addLabel="Thêm module"
        title="Quản lý module"
        description="Khai báo module để nhóm các tài nguyên trong hệ thống"
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
            }
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
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa module</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa{" "}
              <span className="text-foreground font-semibold">
                {deleteModuleName || "module này"}
              </span>
              ? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteModuleId !== null && handleDelete(deleteModuleId)}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
