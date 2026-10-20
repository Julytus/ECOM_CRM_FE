"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FormDialog } from "@/components/ui/form-dialog";
import type { RoleDTO } from "@/lib/types/role";

export function RoleFormDialog({
  open,
  role,
  onOpenChange,
  onSubmit
}: {
  open: boolean;
  role: RoleDTO | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Partial<RoleDTO>) => void;
}) {
  const [name, setName] = React.useState("");
  const [isDefault, setIsDefault] = React.useState(false);
  const [isOperator, setIsOperator] = React.useState(false);

  React.useEffect(() => {
    setName(role?.name ?? "");
    setIsDefault(role?.isDefault === 1);
    setIsOperator(role?.isOperator === 1);
  }, [role, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: role?.id,
      name,
      isDefault: isDefault ? 1 : 0,
      isOperator: isOperator ? 1 : 0
    });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={role ? "Chỉnh sửa chức vụ" : "Tạo mới chức vụ"}
      featured={
        role ? "Cập nhật thông tin chức vụ" : "Tạo chức vụ mới để gán phân quyền cho người dùng"
      }
      onSubmit={handleSubmit}
      submitLabel={role ? "Cập nhật" : "Tạo mới"}
    >
      <div className="space-y-2">
        <Label htmlFor="role-name">Tên chức vụ</Label>
        <Input
          id="role-name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <Label htmlFor="role-is-default">Chức vụ mặc định</Label>
          <p className="text-muted-foreground text-xs">Gán tự động cho tài khoản mới đăng ký</p>
        </div>
        <Switch id="role-is-default" checked={isDefault} onCheckedChange={setIsDefault} />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <Label htmlFor="role-is-operator">Toàn quyền (Operator)</Label>
          <p className="text-muted-foreground text-xs">
            Bỏ qua kiểm tra phân quyền theo tài nguyên — chỉ bật cho chức vụ quản trị cấp cao nhất
          </p>
        </div>
        <Switch id="role-is-operator" checked={isOperator} onCheckedChange={setIsOperator} />
      </div>
    </FormDialog>
  );
}
