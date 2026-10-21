import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

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

  const { data: resources, isFetching, isLoading } = useQuery(permissionInfoQueryOptions(roleId));
  const allResources = React.useMemo(() => resources ?? [], [resources]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [collapsedModules, setCollapsedModules] = React.useState<Set<string>>(() => new Set());
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
  const visibleResources = React.useMemo(
    () =>
      normalizedSearch
        ? allResources.filter(
            (resource) =>
              resource.name.toLocaleLowerCase().includes(normalizedSearch) ||
              resource.code.toLocaleLowerCase().includes(normalizedSearch)
          )
        : allResources,
    [allResources, normalizedSearch]
  );
  const selectedRole = roles.find((role) => role.id === roleId);
  const totalProgress = React.useMemo(() => {
    const pairs = allResources.flatMap((resource) =>
      ["VIEW", "ADD", "UPDATE", "DELETE"]
        .filter(
          (action) =>
            resource.actions.includes(action) || resource.permission.actions.includes(action)
        )
        .map((action) => ({ resource, action }))
    );
    return {
      granted: pairs.filter(({ resource, action }) => resource.permission.actions.includes(action))
        .length,
      total: pairs.length
    };
  }, [allResources]);
  const visibleModuleKeys = React.useMemo(() => {
    const keys = new Set<string>();
    const moduleIds = new Set(modules.map((module) => module.id));
    for (const resource of visibleResources) {
      keys.add(
        resource.moduleId != null && moduleIds.has(resource.moduleId)
          ? String(resource.moduleId)
          : "none"
      );
    }
    return keys;
  }, [modules, visibleResources]);
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

  const setAllGroupsCollapsed = (collapsed: boolean) => {
    setCollapsedModules((current) => {
      const next = new Set(current);
      for (const key of visibleModuleKeys) {
        if (collapsed) next.add(key);
        else next.delete(key);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-lg font-semibold">Phân quyền</h1>
        <p className="text-muted-foreground text-sm">
          Chọn chức vụ để xem và chỉnh sửa quyền VIEW/ADD/UPDATE/DELETE theo từng tài nguyên.
        </p>
      </div>

      <div className="bg-background/95 sticky top-0 z-20 -mx-4 -mt-4 flex flex-wrap items-end gap-3 border-b px-4 py-3 backdrop-blur">
        <div className="w-full min-w-56 sm:w-64">
          <label className="mb-1.5 block text-sm font-medium">Chức vụ</label>
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
        <div className="w-full min-w-56 flex-1 sm:max-w-sm">
          <Input
            aria-label="Tìm tài nguyên"
            placeholder="Tìm theo tên hoặc mã tài nguyên"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAllGroupsCollapsed(false)}
          >
            Mở tất cả
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAllGroupsCollapsed(true)}
          >
            Thu tất cả
          </Button>
        </div>
        <div className="text-muted-foreground ml-auto text-sm whitespace-nowrap">
          <span className="text-foreground font-semibold">
            {totalProgress.granted}/{totalProgress.total}
          </span>{" "}
          quyền đã cấp
        </div>
      </div>

      {selectedRole?.isOperator === 1 && (
        <Alert>
          <AlertDescription className="text-foreground">
            Chức vụ Toàn quyền: không cần cấp quyền chi tiết
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-3" aria-label="Đang tải quyền">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : visibleResources.length === 0 && searchTerm.trim() ? (
        <p className="text-muted-foreground rounded-lg border border-dashed px-4 py-8 text-center text-sm">
          Không tìm thấy tài nguyên phù hợp.
        </p>
      ) : (
        <PermissionMatrix
          resources={visibleResources}
          modules={modules}
          collapsedModules={collapsedModules}
          isMutating={addMutation.isPending || removeMutation.isPending || isBulkPending}
          onToggleModule={(key) =>
            setCollapsedModules((current) => {
              const next = new Set(current);
              if (next.has(key)) next.delete(key);
              else next.add(key);
              return next;
            })
          }
          onToggle={handleToggle}
          onToggleMany={handleToggleMany}
        />
      )}

      {isFetching && !isLoading && <span className="sr-only">Đang cập nhật quyền...</span>}
    </div>
  );
}
