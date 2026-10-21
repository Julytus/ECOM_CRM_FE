"use client";

import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { DataTableAdvanced } from "@/components/admin/table/data-table-advanced";
import { createCrmUserColumns } from "@/components/crm/user/columns";
import { CrmUserFormDialog } from "@/components/admin/crm-user/crm-user-dialog";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";

import {
  createInfiniteCrmUsersQueryOptions,
  upsertCrmUserMutationOptions,
  deleteCrmUserMutationOptions
} from "@/lib/tanstack/options/crm-user";
import type { CrmUserDTO } from "@/lib/types/crm-user";

export const Route = createFileRoute("/crm/user")({
  component: AdminCrmUsers
});

function AdminCrmUsers() {
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10
  });
  const [filters, setFilters] = React.useState<Record<string, string>>({ keyword: "" });

  const [selectedUser, setSelectedUser] = React.useState<CrmUserDTO | null>(null);
  const [openForm, setOpenForm] = React.useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteUserId, setDeleteUserId] = React.useState<number | null>(null);
  const [deleteUserName, setDeleteUserName] = React.useState<string | undefined>();

  // Query
  const {
    data: queryData,
    refetch,
    isFetching
  } = useInfiniteQuery(
    createInfiniteCrmUsersQueryOptions({
      opts: {
        keyword: filters.keyword.trim() || undefined,
        paging: {
          limit: pagination.pageSize,
          page: pagination.pageIndex + 1
        }
      }
    })
  );

  const users = React.useMemo(() => queryData?.pages.flatMap((p) => p.items) ?? [], [queryData]);
  const total = React.useMemo(() => queryData?.pages[0]?.total ?? 0, [queryData]);

  // Mutations
  const upsertMutation = useMutation({ ...upsertCrmUserMutationOptions() });
  const deleteMutation = useMutation({ ...deleteCrmUserMutationOptions() });

  const handleEdit = (user: CrmUserDTO) => {
    setSelectedUser(user);
    setOpenForm(true);
  };

  const handleShowDeleteConfirm = (id: number, name?: string) => {
    setDeleteUserId(id);
    setDeleteUserName(name);
    setDeleteDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        refetch();
        toast.success("Xóa người dùng thành công");
      },
      onError: () => {
        toast.error("Xóa người dùng thất bại");
      }
    });
  };

  const handleDeleteSelected = (ids: number[]) => {
    if (confirm(`Bạn có chắc muốn xóa ${ids.length} người dùng đã chọn?`)) {
      Promise.all(ids.map((id) => deleteMutation.mutateAsync(id)))
        .then(() => {
          toast.success("Xóa thành công");
          refetch();
        })
        .catch(() => {
          toast.error("Có lỗi xảy ra");
        });
    }
  };

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPagination({ pageIndex, pageSize });
  };

  // Define columns
  const columns = React.useMemo(
    () =>
      createCrmUserColumns({
        onEdit: handleEdit,
        onShowDeleteConfirm: handleShowDeleteConfirm
      }),
    [handleEdit, handleShowDeleteConfirm]
  );

  return (
    <>
      <DataTableAdvanced
        data={users}
        columns={columns}
        total={total}
        pageSize={pagination.pageSize}
        pageIndex={pagination.pageIndex}
        onPaginationChange={handlePaginationChange}
        isLoading={isFetching}
        onRefresh={refetch}
        onAdd={() => {
          setSelectedUser(null);
          setOpenForm(true);
        }}
        onDeleteSelected={handleDeleteSelected}
        addLabel="Thêm người dùng"
        deleteLabel="Xóa đã chọn"
        title="Quản lý người dùng"
        description="Khai báo người dùng CRM và gán chức vụ tương ứng"
        filter={{
          fields: [{ key: "keyword", label: "Từ khóa", placeholder: "Tìm người dùng..." }],
          values: filters,
          onChange: (values) => {
            setFilters(values);
            setPagination((current) => ({ ...current, pageIndex: 0 }));
          }
        }}
      />
      <CrmUserFormDialog
        open={openForm}
        user={selectedUser}
        onOpenChange={setOpenForm}
        onSubmit={(values) =>
          upsertMutation.mutate(values, {
            onSuccess: () => {
              setOpenForm(false);
              refetch();
              toast.success("Lưu người dùng thành công");
            }
          })
        }
      />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        itemId={deleteUserId}
        itemName={deleteUserName}
        itemType="người dùng"
        onConfirm={handleDelete}
        onOpenChange={setDeleteDialogOpen}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
