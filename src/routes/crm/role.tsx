"use client";

import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { DataTableAdvanced } from "@/components/admin/table/data-table-advanced";
import { createRoleColumns } from "@/components/crm/role/columns";
import { RoleFormDialog } from "@/components/admin/role/role-dialog";
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

import {
  createInfiniteRolesQueryOptions,
  upsertRoleMutationOptions,
  deleteRoleMutationOptions
} from "@/lib/tanstack/options/role";
import type { RoleDTO } from "@/lib/types/role";

export const Route = createFileRoute("/crm/role")({
  component: AdminRoles
});

function AdminRoles() {
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10
  });

  const [selectedRole, setSelectedRole] = React.useState<RoleDTO | null>(null);
  const [openForm, setOpenForm] = React.useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteRoleId, setDeleteRoleId] = React.useState<number | null>(null);
  const [deleteRoleName, setDeleteRoleName] = React.useState<string | undefined>();

  // Query
  const {
    data: queryData,
    refetch,
    isFetching
  } = useInfiniteQuery(
    createInfiniteRolesQueryOptions({
      opts: {
        paging: {
          limit: pagination.pageSize,
          page: pagination.pageIndex + 1
        }
      }
    })
  );

  const roles = React.useMemo(() => queryData?.pages.flatMap((p) => p.items) ?? [], [queryData]);
  const total = React.useMemo(() => queryData?.pages[0]?.total ?? 0, [queryData]);

  // Mutations
  const upsertMutation = useMutation({ ...upsertRoleMutationOptions() });
  const deleteMutation = useMutation({ ...deleteRoleMutationOptions() });

  const handleEdit = (role: RoleDTO) => {
    setSelectedRole(role);
    setOpenForm(true);
  };

  const handleShowDeleteConfirm = (id: number, name?: string) => {
    setDeleteRoleId(id);
    setDeleteRoleName(name);
    setDeleteDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        refetch();
        toast.success("Xóa chức vụ thành công");
      },
      onError: () => {
        toast.error("Xóa chức vụ thất bại");
      }
    });
  };

  const handleDeleteSelected = (ids: number[]) => {
    if (confirm(`Bạn có chắc muốn xóa ${ids.length} chức vụ đã chọn?`)) {
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
      createRoleColumns({
        onEdit: handleEdit,
        onShowDeleteConfirm: handleShowDeleteConfirm
      }),
    [handleEdit, handleShowDeleteConfirm]
  );

  return (
    <>
      <DataTableAdvanced
        data={roles}
        columns={columns}
        total={total}
        pageSize={pagination.pageSize}
        pageIndex={pagination.pageIndex}
        onPaginationChange={handlePaginationChange}
        isLoading={isFetching}
        onRefresh={refetch}
        onAdd={() => {
          setSelectedRole(null);
          setOpenForm(true);
        }}
        onDeleteSelected={handleDeleteSelected}
        addLabel="Thêm chức vụ"
        deleteLabel="Xóa đã chọn"
        title="Quản lý chức vụ"
        description="Khai báo chức vụ để gán phân quyền cho người dùng"
      />
      <RoleFormDialog
        open={openForm}
        role={selectedRole}
        onOpenChange={setOpenForm}
        onSubmit={(values) =>
          upsertMutation.mutate(values, {
            onSuccess: () => {
              setOpenForm(false);
              refetch();
              toast.success("Lưu chức vụ thành công");
            }
          })
        }
      />
      {/* Dialog xoá riêng (không dùng DeleteConfirmDialog dùng chung) vì cần
          cảnh báo thêm về permission mồ côi — xem Risks ở phase-5 plan. */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa chức vụ</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa{" "}
              <span className="text-foreground font-semibold">
                {deleteRoleName || "chức vụ này"}
              </span>
              ? Hành động này không thể hoàn tác. Nếu chức vụ đang có phân quyền gán sẵn, dữ liệu
              phân quyền đó sẽ không còn chức vụ nào sử dụng (không tự động dọn dẹp).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteRoleId && handleDelete(deleteRoleId)}
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
