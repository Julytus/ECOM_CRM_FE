import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { PermissionMatrix } from "@/components/crm/permission/permission-matrix";

import { getRoles } from "@/lib/axios/role";
import {
  addPermissionMutationOptions,
  permissionInfoQueryOptions,
  removePermissionMutationOptions
} from "@/lib/tanstack/options/permission";

export const Route = createFileRoute("/crm/permission")({
  component: PermissionPage
});

function PermissionPage() {
  const [roleId, setRoleId] = React.useState<number | undefined>(undefined);

  const { data: rolesPage } = useQuery({
    queryKey: ["roles-for-permission"],
    queryFn: () => getRoles({ paging: { page: 1, limit: 100 } })
  });
  const roles = React.useMemo(() => rolesPage?.items ?? [], [rolesPage]);

  React.useEffect(() => {
    if (roleId === undefined && roles.length > 0) {
      setRoleId(roles[0].id);
    }
  }, [roleId, roles]);

  const { data: resources = [], isFetching } = useQuery(permissionInfoQueryOptions(roleId));

  const addMutation = useMutation(addPermissionMutationOptions());
  const removeMutation = useMutation(removePermissionMutationOptions());

  const handleToggle = (resourceId: number, action: string, checked: boolean) => {
    if (!roleId) return;
    const payload = { resourceId, roleId, actions: [action] };
    if (checked) {
      addMutation.mutate(payload);
    } else {
      removeMutation.mutate(payload);
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
          value={roleId ? String(roleId) : undefined}
          onValueChange={(value) => setRoleId(Number(value))}
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
        isMutating={addMutation.isPending || removeMutation.isPending}
        onToggle={handleToggle}
      />

      {isFetching && <p className="text-muted-foreground text-sm">Đang tải...</p>}
    </div>
  );
}
