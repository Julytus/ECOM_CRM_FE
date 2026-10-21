import * as React from "react";
import type { ResourceInfoDTO } from "@/lib/types/permission";
import type { ModuleDTO } from "@/lib/types/module";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

const ACTIONS = ["VIEW", "ADD", "UPDATE", "DELETE"] as const;

interface PermissionMatrixProps {
  resources: ResourceInfoDTO[];
  modules: ModuleDTO[];
  isMutating?: boolean;
  onToggle: (resourceId: number, action: string, checked: boolean) => void;
}

export function PermissionMatrix({
  resources,
  modules,
  isMutating,
  onToggle
}: PermissionMatrixProps) {
  const [collapsedModules, setCollapsedModules] = React.useState<Set<number>>(() => new Set());

  if (resources.length === 0) {
    return <p className="text-muted-foreground text-sm">Không có tài nguyên nào.</p>;
  }

  const resourcesByModule = new Map<number, ResourceInfoDTO[]>();
  const moduleIds = new Set(modules.map((module) => module.id));
  const unassignedResources: ResourceInfoDTO[] = [];
  for (const resource of resources) {
    if (resource.moduleId == null || !moduleIds.has(resource.moduleId)) {
      unassignedResources.push(resource);
      continue;
    }

    const moduleResources = resourcesByModule.get(resource.moduleId) ?? [];
    moduleResources.push(resource);
    resourcesByModule.set(resource.moduleId, moduleResources);
  }

  const toggleModule = (moduleId: number) => {
    setCollapsedModules((current) => {
      const next = new Set(current);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const renderResource = (resource: ResourceInfoDTO) => (
    <TableRow key={resource.id} data-testid={`resource-row-${resource.id}`}>
      <TableCell>
        <div className="font-medium">{resource.name}</div>
        <div className="text-muted-foreground text-xs">{resource.code}</div>
      </TableCell>
      {ACTIONS.map((action) => {
        // chỉ cho tick action mà resource này tự khai báo hỗ trợ (vd REPORT chỉ có VIEW).
        // Nhưng nếu action đã được cấp từ trước rồi resource bị sửa bỏ hỗ trợ action đó
        // (vd xoá DELETE khỏi resource ở trang Resource), permission tồn đọng (`checked`)
        // vẫn phải cho bỏ tick được — nếu không, quyền thừa không có đường gỡ qua UI.
        const supported = resource.actions.includes(action);
        const checked = resource.permission.actions.includes(action);
        return (
          <TableCell key={action} className="text-center">
            <Checkbox
              aria-label={`${action} ${resource.code}`}
              disabled={(!supported && !checked) || isMutating}
              checked={checked}
              onCheckedChange={(value) => onToggle(resource.id, action, value === true)}
            />
          </TableCell>
        );
      })}
    </TableRow>
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tài nguyên</TableHead>
          {ACTIONS.map((action) => (
            <TableHead key={action} className="text-center">
              {action}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {modules.map((module) => {
          const moduleResources = resourcesByModule.get(module.id) ?? [];
          if (moduleResources.length === 0) return null;

          const isCollapsed = collapsedModules.has(module.id);
          return (
            <React.Fragment key={module.id}>
              <TableRow data-testid={`module-group-${module.id}`}>
                <TableCell colSpan={ACTIONS.length + 1} className="bg-muted/50">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between text-left font-semibold"
                    aria-expanded={!isCollapsed}
                    onClick={() => toggleModule(module.id)}
                  >
                    <span>{module.name} ({moduleResources.length} tài nguyên)</span>
                    <span aria-hidden="true">{isCollapsed ? "▶" : "▼"}</span>
                  </button>
                </TableCell>
              </TableRow>
              {!isCollapsed && moduleResources.map(renderResource)}
            </React.Fragment>
          );
        })}
        {unassignedResources.length > 0 && (
          <React.Fragment>
            <TableRow data-testid="module-group-none">
              <TableCell colSpan={ACTIONS.length + 1} className="bg-muted/50">
                <span className="font-semibold">
                  Chưa phân module ({unassignedResources.length} tài nguyên)
                </span>
              </TableCell>
            </TableRow>
            {unassignedResources.map(renderResource)}
          </React.Fragment>
        )}
      </TableBody>
    </Table>
  );
}
