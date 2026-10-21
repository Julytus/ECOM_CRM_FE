"use client";

import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createInfiniteResourcesQueryOptions } from "@/lib/tanstack/options/resource";
import type { ModuleDTO } from "@/lib/types/module";

const PAGE_SIZE = 10;

interface AssignResourcesDialogProps {
  open: boolean;
  module: ModuleDTO | null;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (moduleId: number, resourceIds: number[]) => void;
}

export function AssignResourcesDialog({
  open,
  module,
  isPending,
  onOpenChange,
  onAssign
}: AssignResourcesDialogProps) {
  const [keyword, setKeyword] = React.useState("");
  const [debouncedKeyword, setDebouncedKeyword] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(() => new Set());

  React.useEffect(() => {
    setKeyword("");
    setDebouncedKeyword("");
    setSelectedIds(new Set());
  }, [open, module?.id]);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedKeyword(keyword.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [keyword]);

  const resourcesQuery = useInfiniteQuery({
    ...createInfiniteResourcesQueryOptions({
      opts: {
        unassigned: true,
        keyword: debouncedKeyword || undefined,
        paging: { page: 1, limit: PAGE_SIZE }
      }
    }),
    enabled: open
  });

  const resources = React.useMemo(
    () => resourcesQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [resourcesQuery.data]
  );

  const toggleResource = (id: number, checked: boolean | "indeterminate") => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked === true) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setKeyword("");
      setDebouncedKeyword("");
      setSelectedIds(new Set());
    }
    onOpenChange(nextOpen);
  };

  const handleAssign = () => {
    if (module && selectedIds.size > 0 && !isPending) {
      onAssign(module.id, Array.from(selectedIds));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gán tài nguyên</DialogTitle>
          <DialogDescription>
            Chọn tài nguyên chưa thuộc module để gán vào {module?.name ?? "module"}.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Tìm kiếm tài nguyên..."
          aria-label="Tìm kiếm tài nguyên"
        />
        <ScrollArea className="h-64 rounded-md border">
          <div className="p-3">
            {resourcesQuery.isLoading ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Đang tải tài nguyên...
              </p>
            ) : resourcesQuery.isError ? (
              <p className="text-destructive py-8 text-center text-sm">
                Không thể tải danh sách tài nguyên.
              </p>
            ) : resources.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Không có tài nguyên chưa gán.
              </p>
            ) : (
              <div className="space-y-1">
                {resources.map((resource) => (
                  <label
                    key={resource.id}
                    className="hover:bg-muted flex cursor-pointer items-center gap-3 rounded-md p-2"
                  >
                    <Checkbox
                      checked={selectedIds.has(resource.id)}
                      onCheckedChange={(checked) => toggleResource(resource.id, checked)}
                      aria-label={`Chọn ${resource.name}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{resource.name}</span>
                      <span className="text-muted-foreground block truncate text-xs">
                        {resource.code}
                        {resource.uri ? ` · ${resource.uri}` : ""}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}
            {resourcesQuery.hasNextPage && (
              <Button
                type="button"
                variant="ghost"
                className="mt-2 w-full"
                disabled={resourcesQuery.isFetchingNextPage}
                onClick={() => void resourcesQuery.fetchNextPage()}
              >
                {resourcesQuery.isFetchingNextPage ? "Đang tải..." : "Tải thêm"}
              </Button>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => handleOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            disabled={selectedIds.size === 0 || isPending}
            onClick={handleAssign}
          >
            {isPending ? "Đang gán..." : `Gán${selectedIds.size ? ` (${selectedIds.size})` : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
