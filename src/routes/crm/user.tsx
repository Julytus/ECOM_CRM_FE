"use client";

import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserStats } from "@/components/crm/user/user-stats";
import { UserTable } from "@/components/crm/user/user-table";
import { UserPermissionDialog } from "@/components/crm/user/user-permission-dialog";
import { fetchUsers, updateRoleOperator } from "@/lib/axios/user-management";
import type { UserItem } from "@/lib/types/user-management";

export const Route = createFileRoute("/crm/user")({
  component: UserManagementPage
});

const PAGE_SIZE = 10;

function UserManagementPage() {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pendingUser, setPendingUser] = React.useState<UserItem | null>(null);
  const [nextOperator, setNextOperator] = React.useState<0 | 1>(1);

  const usersQuery = useQuery({
    queryKey: ["crm-users", search, page, PAGE_SIZE],
    queryFn: () => fetchUsers({ keyword: search, page, limit: PAGE_SIZE })
  });

  const operatorMutation = useMutation({
    mutationFn: updateRoleOperator,
    onSuccess: async (_result, variables) => {
      toast.success(
        variables.isOperator === 1
          ? "Đã cấp quyền toàn quyền cho vai trò"
          : "Đã thu hồi quyền toàn quyền của vai trò"
      );
      setPendingUser(null);
      await queryClient.invalidateQueries({ queryKey: ["crm-users"] });
      await queryClient.invalidateQueries({ queryKey: ["crm-roles"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật quyền");
    }
  });

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(keyword.trim());
  };

  const openPermissionConfirm = (user: UserItem) => {
    if (!user.roleId) {
      toast.error("Người dùng chưa được gán vai trò. Hãy gán vai trò trước.");
      return;
    }
    setNextOperator(user.isOperator === 1 ? 0 : 1);
    setPendingUser(user);
  };

  const confirmPermissionChange = () => {
    if (!pendingUser?.roleId) return;
    operatorMutation.mutate({
      roleId: pendingUser.roleId,
      isOperator: nextOperator
    });
  };

  const users = usersQuery.data?.users ?? [];
  const total = usersQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Người dùng &amp; phân quyền</h1>
          <p className="text-muted-foreground text-sm">
            Quản lý tài khoản và quyền quản trị toàn hệ thống.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void usersQuery.refetch()}
          disabled={usersQuery.isFetching}
        >
          Làm mới
        </Button>
      </div>

      <UserStats users={users} total={total} />

      <form onSubmit={submitSearch} className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Tìm theo tên, email hoặc số điện thoại..."
          className="sm:max-w-md"
        />
        <Button type="submit">Tìm kiếm</Button>
      </form>

      <UserTable
        users={users}
        isLoading={usersQuery.isLoading}
        isError={usersQuery.isError}
        isFetching={usersQuery.isFetching}
        mutationPending={operatorMutation.isPending}
        page={page}
        totalPages={totalPages}
        total={total}
        onTogglePermission={openPermissionConfirm}
        onPageChange={setPage}
      />

      <UserPermissionDialog
        user={pendingUser}
        nextOperator={nextOperator}
        open={!!pendingUser}
        isLoading={operatorMutation.isPending}
        onOpenChange={(open) => {
          if (!open && !operatorMutation.isPending) setPendingUser(null);
        }}
        onConfirm={confirmPermissionChange}
      />
    </div>
  );
}
