import * as React from "react";
import { ChevronDown, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import type { ResourceInfoDTO } from "@/lib/types/permission";
import type { ModuleDTO } from "@/lib/types/module";
import { Badge } from "@/components/ui/badge";
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
const ACTION_ICONS = { VIEW: Eye, ADD: Plus, UPDATE: Pencil, DELETE: Trash2 } as const;

interface PermissionMatrixProps {
  resources: ResourceInfoDTO[];
  modules: ModuleDTO[];
  collapsedModules: Set<string>;
  isMutating?: boolean;
  onToggleModule: (moduleKey: string) => void;
  onToggle: (resourceId: number, action: string, checked: boolean) => void;
  onToggleMany: (items: { resourceId: number; actions: string[] }[], checked: boolean) => void;
}

function getProgress(resources: ResourceInfoDTO[]) {
  const pairs = resources.flatMap((resource) =>
    ACTIONS.filter(
      (action) => resource.actions.includes(action) || resource.permission.actions.includes(action)
    ).map((action) => ({ resource, action }))
  );
  const granted = pairs.filter(({ resource, action }) =>
    resource.permission.actions.includes(action)
  ).length;
  return { granted, total: pairs.length };
}

export function PermissionMatrix({
  resources,
  modules,
  collapsedModules,
  isMutating,
  onToggleModule,
  onToggle,
  onToggleMany
}: PermissionMatrixProps) {
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

  const getToggleActions = (resource: ResourceInfoDTO, checked: boolean) =>
    ACTIONS.filter((action) =>
      checked
        ? resource.actions.includes(action) && !resource.permission.actions.includes(action)
        : resource.permission.actions.includes(action)
    );

  const getSelectionState = (groupResources: ResourceInfoDTO[]) => {
    const { granted, total } = getProgress(groupResources);
    return {
      checked: granted === 0 ? false : granted === total ? true : "indeterminate",
      disabled: total === 0 || isMutating
    } as const;
  };

  const renderGroupCheckbox = (label: string, groupResources: ResourceInfoDTO[]) => {
    const selection = getSelectionState(groupResources);
    return (
      <Checkbox
        aria-label={label}
        disabled={selection.disabled}
        checked={selection.checked}
        onCheckedChange={(value) =>
          onToggleMany(
            groupResources
              .map((resource) => ({
                resourceId: resource.id,
                actions: getToggleActions(resource, value === true)
              }))
              .filter((item) => item.actions.length > 0),
            value === true
          )
        }
      />
    );
  };

  const renderResource = (resource: ResourceInfoDTO) => (
    <TableRow
      key={resource.id}
      data-testid={`resource-row-${resource.id}`}
      className="hover:bg-muted/40"
    >
      <TableCell>
        <div className="font-medium">{resource.name}</div>
        <div className="text-muted-foreground text-xs">{resource.code}</div>
      </TableCell>
      <TableCell className="text-center">
        {renderGroupCheckbox(`Tất cả ${resource.code}`, [resource])}
      </TableCell>
      {ACTIONS.map((action) => {
        // Quyền đã cấp vẫn có thể gỡ dù action sau đó không còn được hỗ trợ.
        const supported = resource.actions.includes(action);
        const checked = resource.permission.actions.includes(action);
        return (
          <TableCell key={action} className="text-center">
            {supported || checked ? (
              <Checkbox
                aria-label={`${action} ${resource.code}`}
                disabled={(!supported && !checked) || isMutating}
                checked={checked}
                onCheckedChange={(value) => onToggle(resource.id, action, value === true)}
              />
            ) : (
              <span className="text-muted-foreground" aria-hidden="true">
                –
              </span>
            )}
          </TableCell>
        );
      })}
    </TableRow>
  );

  const renderGroup = (
    key: string,
    testId: string,
    label: string,
    resourcesInGroup: ResourceInfoDTO[]
  ) => {
    const isCollapsed = collapsedModules.has(key);
    const { granted, total } = getProgress(resourcesInGroup);
    return (
      <React.Fragment key={key}>
        <TableRow data-testid={testId}>
          <TableCell className="bg-muted/50">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-2 text-left font-semibold"
                aria-expanded={!isCollapsed}
                onClick={() => onToggleModule(key)}
              >
                <ChevronDown
                  aria-hidden="true"
                  className={`size-4 shrink-0 transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
                />
                <span className="truncate">
                  {label} ({resourcesInGroup.length} tài nguyên)
                </span>
              </button>
              <Badge variant="secondary">
                {granted}/{total}
              </Badge>
            </div>
          </TableCell>
          <TableCell className="bg-muted/50 text-center">
            {renderGroupCheckbox(`Tất cả module ${label}`, resourcesInGroup)}
          </TableCell>
          <TableCell colSpan={ACTIONS.length} className="bg-muted/50" />
        </TableRow>
        {!isCollapsed && resourcesInGroup.map(renderResource)}
      </React.Fragment>
    );
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border">
      <Table className="min-w-[44rem]">
        <TableHeader className="bg-background sticky top-0 z-10">
          <TableRow>
            <TableHead className="w-[40%]">Tài nguyên</TableHead>
            <TableHead className="text-center">Tất cả</TableHead>
            {ACTIONS.map((action) => {
              const Icon = ACTION_ICONS[action];
              return (
                <TableHead
                  key={action}
                  className={`text-center ${action === "DELETE" ? "text-destructive" : ""}`}
                >
                  <span className="inline-flex items-center justify-center gap-1.5">
                    <Icon aria-hidden="true" className="size-4" />
                    {action}
                  </span>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {modules.map((module) => {
            const moduleResources = resourcesByModule.get(module.id) ?? [];
            if (moduleResources.length === 0) return null;
            return renderGroup(
              String(module.id),
              `module-group-${module.id}`,
              module.name,
              moduleResources
            );
          })}
          {unassignedResources.length > 0 &&
            renderGroup("none", "module-group-none", "Chưa phân module", unassignedResources)}
        </TableBody>
      </Table>
    </div>
  );
}
