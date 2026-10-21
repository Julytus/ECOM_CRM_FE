import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { PermissionMatrix } from "@/components/crm/permission/permission-matrix";

import { getRoles } from "@/lib/axios/role";
import { getModules } from "@/lib/axios/module";
import { addPermission, removePermission } from "@/lib/axios/permission";
import {
  addPermissionMutationOptions,
  permissionInfoQueryOptions,
  removePermissionMutationOptions
} from "@/lib/tanstack/options/permission";

export const Route = createFileRoute("/crm/permission")({
  validateSearch: (search: Record<string, unknown>): { roleId?: number } => ({
    roleId: typeof search.roleId === "number" ? search.roleId : undefined
  }),
  component: PermissionPage
});

function PermissionPage() {
  const { roleId } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const { data: rolesPage } = useQuery({
    queryKey: ["roles-for-permission"],
    queryFn: () => getRoles({ paging: { page: 1, limit: 100 } })
  });
  const roles = React.useMemo(() => rolesPage?.items ?? [], [rolesPage]);

  const { data: modulesPage } = useQuery({
    queryKey: ["modules-for-permission"],
    queryFn: () => getModules({ paging: { page: 1, limit: 100 } })
  });
  const modules = React.useMemo(() => modulesPage?.items ?? [], [modulesPage]);

  React.useEffect(() => {
    if (roleId === undefined && roles.length > 0) {
      void navigate({
        search: (prev) => ({ ...prev, roleId: roles[0].id }),
        replace: true
      });
    }
  }, [navigate, roleId, roles]);

  const { data: resources = [], isFetching } = useQuery(permissionInfoQueryOptions(roleId));
  const queryClient = useQueryClient();

  const addMutation = useMutation(addPermissionMutationOptions());
  const removeMutation = useMutation(removePermissionMutationOptions());
  const [isBulkPending, setIsBulkPending] = React.useState(false);

  const handleToggle = (resourceId: number, action: string, checked: boolean) => {
    if (!roleId) return;
    const payload = { resourceId, roleId, actions: [action] };
    if (checked) {
      addMutation.mutate(payload);
    } else {
      removeMutation.mutate(payload);
    }
  };

  const handleToggleMany = async (
    items: { resourceId: number; actions: string[] }[],
    checked: boolean
  ) => {
    if (!roleId || items.length === 0 || isBulkPending) return;

    setIsBulkPending(true);
    try {
      const results = await Promise.all(
        items.map(async ({ resourceId, actions }) => {
          try {
            const payload = { resourceId, roleId, actions };
            if (checked) await addPermission(payload);
            else await removePermission(payload);
            return true;
          } catch {
            return false;
          }
        })
      );

      await queryClient.invalidateQueries({ queryKey: ["permission-info"] });
      if (results.every(Boolean)) toast.success("Cập nhật quyền thành công");
      else toast.error("Không thể cập nhật quyền");
    } catch {
      toast.error("Không thể cập nhật quyền");
    } finally {
      setIsBulkPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-lg font-semibold">Phân quyền</h1>
        <p className="text-muted-foreground text-sm">
          Chọn chức vụ để xem và chỉnh sửa quyền VIEW/ADD/UPDATE/DELETE theo từng tài nguyên.
        </p>
      </div>

      <div className="w-64">
        <Select
          value={roleId !== undefined ? String(roleId) : undefined}
          onValueChange={(value) => {
            void navigate({
              search: (prev) => ({ ...prev, roleId: Number(value) }),
              replace: true
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn chức vụ" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.id} value={String(role.id)}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <PermissionMatrix
        resources={resources}
        modules={modules}
        isMutating={addMutation.isPending || removeMutation.isPending || isBulkPending}
        onToggle={handleToggle}
        onToggleMany={handleToggleMany}
      />

      {isFetching && <p className="text-muted-foreground text-sm">Đang tải...</p>}
    </div>
  );
}
