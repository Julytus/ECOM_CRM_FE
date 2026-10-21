"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FormDialog } from "@/components/ui/form-dialog";
import type { ResourceDTO } from "@/lib/types/resource";

const ALL_ACTIONS = ["VIEW", "ADD", "UPDATE", "DELETE"] as const;

// `checkPermission` khớp theo RESOURCE.URI — sửa sai code/uri của 1 trong 4 resource
// hệ thống này tự chặn luôn trang tương ứng cho mọi role non-operator (red-team, plan.md).
const SYSTEM_RESOURCE_CODES = ["ROLE", "RESOURCE", "USER", "PERMISSION"];

export function ResourceFormDialog({
  open,
  resource,
  onOpenChange,
  onSubmit
}: {
  open: boolean;
  resource: ResourceDTO | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Partial<ResourceDTO>) => void;
}) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [code, setCode] = React.useState("");
  const [uri, setUri] = React.useState("");
  const [actions, setActions] = React.useState<string[]>([]);

  React.useEffect(() => {
    setName(resource?.name ?? "");
    setDescription(resource?.description ?? "");
    setCode(resource?.code ?? "");
    setUri(resource?.uri ?? "");
    setActions(resource?.actions ?? []);
  }, [resource, open]);

  const isSystemResource = !!resource && SYSTEM_RESOURCE_CODES.includes(resource.code);

  const toggleAction = (action: string, checked: boolean) => {
    setActions((prev) => (checked ? [...prev, action] : prev.filter((a) => a !== action)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ id: resource?.id, name, description, code, uri, actions });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={resource ? "Chỉnh sửa tài nguyên" : "Tạo mới tài nguyên"}
      featured={
        resource
          ? "Cập nhật thông tin tài nguyên hệ thống"
          : "Tạo tài nguyên mới để gán quyền cho các chức vụ"
      }
      onSubmit={handleSubmit}
      submitLabel={resource ? "Cập nhật" : "Tạo mới"}
    >
      <div className="space-y-2">
        <Label htmlFor="resource-name">Tên tài nguyên</Label>
        <Input
          id="resource-name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="resource-description">Mô tả</Label>
        <Textarea
          id="resource-description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[80px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="resource-code">Code</Label>
          <Input
            id="resource-code"
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isSystemResource}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="resource-uri">URI</Label>
          <Input
            id="resource-uri"
            name="uri"
            value={uri}
            onChange={(e) => setUri(e.target.value)}
            disabled={isSystemResource}
            required
          />
        </div>
      </div>
      {isSystemResource && (
        <p className="text-muted-foreground text-xs">
          Đây là tài nguyên hệ thống — không thể sửa Code/URI vì phân quyền khớp theo URI này.
        </p>
      )}

      <div className="space-y-2">
        <Label>Hành động hỗ trợ</Label>
        <div className="flex gap-4">
          {ALL_ACTIONS.map((action) => (
            <label key={action} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={actions.includes(action)}
                onCheckedChange={(checked) => toggleAction(action, checked === true)}
              />
              {action}
            </label>
          ))}
        </div>
      </div>
    </FormDialog>
  );
}
