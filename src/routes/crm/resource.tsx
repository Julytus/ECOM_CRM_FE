"use client";

import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { useBulkDelete } from "@/hooks/use-bulk-delete";
import { DataTableAdvanced } from "@/components/admin/table/data-table-advanced";
import { createResourceColumns } from "@/components/crm/resource/columns";
import { ResourceFormDialog } from "@/components/admin/resource/resource-dialog";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";

import {
  createInfiniteResourcesQueryOptions,
  upsertResourceMutationOptions,
  deleteResourceMutationOptions,
  updateResourceStatusMutationOptions
} from "@/lib/tanstack/options/resource";
import type { ResourceDTO } from "@/lib/types/resource";

export const Route = createFileRoute("/crm/resource")({
  component: AdminResources
});

function AdminResources() {
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10
  });
  const [filters, setFilters] = React.useState<Record<string, string>>({ keyword: "" });

  const [selectedResource, setSelectedResource] = React.useState<ResourceDTO | null>(null);
  const [openForm, setOpenForm] = React.useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteResourceId, setDeleteResourceId] = React.useState<number | null>(null);
  const [deleteResourceName, setDeleteResourceName] = React.useState<string | undefined>();

  // Query
  const {
    data: queryData,
    refetch,
    isFetching
  } = useInfiniteQuery(
    createInfiniteResourcesQueryOptions({
      opts: {
        keyword: filters.keyword.trim() || undefined,
        paging: {
          limit: pagination.pageSize,
          page: pagination.pageIndex + 1
        }
      }
    })
  );

  const resources = React.useMemo(
    () => queryData?.pages.flatMap((p) => p.items) ?? [],
    [queryData]
  );
  const total = React.useMemo(() => queryData?.pages[0]?.total ?? 0, [queryData]);

  // Mutations
  const upsertMutation = useMutation({ ...upsertResourceMutationOptions() });
  const deleteMutation = useMutation({ ...deleteResourceMutationOptions() });
  const toggleStatusMutation = useMutation({ ...updateResourceStatusMutationOptions() });

  const handleEdit = (resource: ResourceDTO) => {
    setSelectedResource(resource);
    setOpenForm(true);
  };

  const handleShowDeleteConfirm = (id: number, name?: string) => {
    setDeleteResourceId(id);
    setDeleteResourceName(name);
    setDeleteDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        refetch();
        toast.success("Xóa tài nguyên thành công");
      },
      onError: () => {
        toast.error("Xóa tài nguyên thất bại");
      }
    });
  };

  const { run: handleDeleteSelected, isPending: isBulkDeleting } = useBulkDelete({
    deleteOne: deleteMutation.mutateAsync,
    onSettled: refetch,
    label: "tài nguyên"
  });

  const handleToggleActive = (resource: ResourceDTO, active: boolean) => {
    toggleStatusMutation.mutate(
      { id: resource.id, active: active ? 1 : 0 },
      {
        onSuccess: () => refetch(),
        onError: () => toast.error("Không thể cập nhật trạng thái tài nguyên")
      }
    );
  };

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPagination({ pageIndex, pageSize });
  };

  // Define columns
  const columns = React.useMemo(
    () =>
      createResourceColumns({
        onEdit: handleEdit,
        onShowDeleteConfirm: handleShowDeleteConfirm,
        onToggleActive: handleToggleActive
      }),
    [handleEdit, handleShowDeleteConfirm, handleToggleActive]
  );

  return (
    <>
      <DataTableAdvanced
        data={resources}
        columns={columns}
        total={total}
        pageSize={pagination.pageSize}
        pageIndex={pagination.pageIndex}
        onPaginationChange={handlePaginationChange}
        isLoading={isFetching || isBulkDeleting}
        onRefresh={refetch}
        onAdd={() => {
          setSelectedResource(null);
          setOpenForm(true);
        }}
        onDeleteSelected={handleDeleteSelected}
        addLabel="Thêm tài nguyên"
        deleteLabel="Xóa đã chọn"
        title="Quản lý tài nguyên"
        description="Khai báo tài nguyên và hành động hỗ trợ để gán quyền cho các chức vụ"
        filter={{
          fields: [{ key: "keyword", label: "Từ khóa", placeholder: "Tìm tài nguyên..." }],
          values: filters,
          onChange: (values) => {
            setFilters(values);
            setPagination((current) => ({ ...current, pageIndex: 0 }));
          }
        }}
      />
      <ResourceFormDialog
        open={openForm}
        resource={selectedResource}
        onOpenChange={setOpenForm}
        onSubmit={(values) =>
          upsertMutation.mutate(values, {
            onSuccess: () => {
              setOpenForm(false);
              refetch();
              toast.success("Lưu tài nguyên thành công");
            }
          })
        }
      />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        itemId={deleteResourceId}
        itemName={deleteResourceName}
        itemType="tài nguyên"
        onConfirm={handleDelete}
        onOpenChange={setDeleteDialogOpen}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
