"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FormDialog } from "@/components/ui/form-dialog";
import type { ModuleDTO } from "@/lib/types/module";

export function ModuleFormDialog({
  open,
  module,
  onOpenChange,
  onSubmit
}: {
  open: boolean;
  module: ModuleDTO | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Partial<ModuleDTO>) => void;
}) {
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [active, setActive] = React.useState(true);

  React.useEffect(() => {
    setName(module?.name ?? "");
    setCode(module?.code ?? "");
    setDescription(module?.description ?? "");
    setActive(module?.active !== 0);
  }, [module, open]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({
      id: module?.id,
      name: name.trim(),
      code: code.trim(),
      description: description.trim(),
      active: active ? 1 : 0
    });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={module ? "Chỉnh sửa module" : "Tạo mới module"}
      featured={module ? "Cập nhật thông tin module" : "Tạo module mới để nhóm tài nguyên"}
      onSubmit={handleSubmit}
      submitLabel={module ? "Cập nhật" : "Tạo mới"}
    >
      <div className="space-y-2">
        <Label htmlFor="module-name">Tên module</Label>
        <Input
          id="module-name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="module-code">Code</Label>
        <Input
          id="module-code"
          name="code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="module-description">Mô tả</Label>
        <Textarea
          id="module-description"
          name="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-[80px]"
        />
      </div>
      <div className="flex items-center justify-between rounded-lg border p-3">
        <Label htmlFor="module-active">Đang kích hoạt</Label>
        <Switch id="module-active" checked={active} onCheckedChange={setActive} />
      </div>
    </FormDialog>
  );
}
