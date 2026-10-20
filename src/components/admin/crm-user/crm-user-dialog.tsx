"use client";

import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FormDialog } from "@/components/ui/form-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import { createInfiniteRolesQueryOptions } from "@/lib/tanstack/options/role";
import type { CrmUserDTO } from "@/lib/types/crm-user";

export function CrmUserFormDialog({
  open,
  user,
  onOpenChange,
  onSubmit
}: {
  open: boolean;
  user: CrmUserDTO | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Partial<CrmUserDTO>) => void;
}) {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [roleId, setRoleId] = React.useState<string>("");
  const [active, setActive] = React.useState(true);
  const [plainPassword, setPlainPassword] = React.useState("");

  React.useEffect(() => {
    setName(user?.name ?? "");
    setPhone(user?.phone ?? "");
    setEmail(user?.email ?? "");
    setRoleId(user?.roleId ? String(user.roleId) : "");
    setActive(user ? user.active === 1 : true);
    setPlainPassword("");
  }, [user, open]);

  const { data: roleData } = useInfiniteQuery(createInfiniteRolesQueryOptions({}));
  const roles = React.useMemo(() => roleData?.pages.flatMap((p) => p.items) ?? [], [roleData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const values: Partial<CrmUserDTO> = {
      id: user?.id,
      name,
      phone: phone || undefined,
      email: email || undefined,
      roleId: roleId ? Number(roleId) : undefined,
      active: active ? 1 : 0
    };
    if (!user && plainPassword) {
      values.plainPassword = plainPassword;
    }
    onSubmit(values);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={user ? "Chỉnh sửa người dùng" : "Tạo mới người dùng"}
      featured={user ? "Cập nhật thông tin người dùng CRM" : "Tạo tài khoản người dùng CRM mới"}
      onSubmit={handleSubmit}
      submitLabel={user ? "Cập nhật" : "Tạo mới"}
    >
      <div className="space-y-2">
        <Label htmlFor="crm-user-name">Tên</Label>
        <Input
          id="crm-user-name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="crm-user-phone">Số điện thoại</Label>
          <Input
            id="crm-user-phone"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="crm-user-email">Email</Label>
          <Input
            id="crm-user-email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="crm-user-role">Chức vụ</Label>
        <Select value={roleId} onValueChange={setRoleId}>
          <SelectTrigger id="crm-user-role" className="w-full">
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

      {!user && (
        <div className="space-y-2">
          <Label htmlFor="crm-user-password">Mật khẩu</Label>
          <Input
            id="crm-user-password"
            name="plainPassword"
            type="password"
            value={plainPassword}
            onChange={(e) => setPlainPassword(e.target.value)}
          />
        </div>
      )}

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <Label htmlFor="crm-user-active">Kích hoạt</Label>
          <p className="text-muted-foreground text-xs">
            Tài khoản bị vô hiệu hóa sẽ không đăng nhập được
          </p>
        </div>
        <Switch id="crm-user-active" checked={active} onCheckedChange={setActive} />
      </div>
    </FormDialog>
  );
}
