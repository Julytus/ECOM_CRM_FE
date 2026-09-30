"use client";

import * as React from "react";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAppForm } from "@/components/form/hooks";
import { FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { MeDTO } from "@/lib/types/auth";
import {
  createChangePasswordMutationOptions,
  createUpdateUserInfoMutationOptions
} from "@/lib/tanstack/options/user";

/* =======================
    Schemas
======================= */

const profileInfoSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập họ tên"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ")
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(6, "Mật khẩu mới phải từ 6 ký tự"),
    confirmPassword: z.string()
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"]
  });

type ProfileInfoFormData = z.infer<typeof profileInfoSchema>;
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

interface ProfileFormProps {
  user: MeDTO;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [openSection, setOpenSection] = React.useState<string | null>("profile");

  const updateInfoMutation = useMutation(createUpdateUserInfoMutationOptions());
  const changePasswordMutation = useMutation(createChangePasswordMutationOptions());

  /* -------- Profile Info Form -------- */
  const profileForm = useAppForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || ""
    } satisfies ProfileInfoFormData,
    validators: { onSubmit: profileInfoSchema },
    onSubmit: async ({ value }) => {
      try {
        await updateInfoMutation.mutateAsync(value);
        toast.success("Cập nhật thông tin thành công");
      } catch (error) {
        toast.error("Không thể cập nhật thông tin");
      }
    }
  });

  /* -------- Change Password Form -------- */
  const passwordForm = useAppForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    } satisfies ChangePasswordFormData,
    validators: { onSubmit: changePasswordSchema },
    onSubmit: async ({ value }) => {
      try {
        await changePasswordMutation.mutateAsync({
          oldPassword: value.currentPassword,
          newPassword: value.newPassword
        });
        toast.success("Đổi mật khẩu thành công");
        passwordForm.reset();
      } catch (error) {
        toast.error("Mật khẩu hiện tại không chính xác");
      }
    }
  });

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* ================= Profile Info ================= */}
      <Collapsible
        open={openSection === "profile"}
        onOpenChange={() => setOpenSection(openSection === "profile" ? null : "profile")}
        className="bg-card rounded-xl border shadow-sm"
      >
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center justify-between p-6 text-left">
            <div className="space-y-1">
              <h4 className="text-primary text-lg font-bold tracking-tight uppercase">
                Thông tin cá nhân
              </h4>
              <p className="text-muted-foreground text-sm">
                Quản lý tên hiển thị và thông tin liên hệ của bạn.
              </p>
            </div>
            <ChevronDown
              className={cn(
                "h-5 w-5 transition-transform duration-200",
                openSection === "profile" && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-6 pb-8">
          <Separator className="mb-8" />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              profileForm.handleSubmit();
            }}
            className="space-y-8"
          >
            <FieldGroup className="flex">
              <profileForm.AppField name="name">
                {(field) => <field.Input label="Họ và tên*" placeholder="Nhập họ tên" />}
              </profileForm.AppField>

              <profileForm.AppField name="email">
                {(field) => <field.Input label="Email*" placeholder="name@example.com" />}
              </profileForm.AppField>

              <profileForm.AppField name="phone">
                {(field) => <field.Input label="Số điện thoại*" placeholder="09xx xxx xxx" />}
              </profileForm.AppField>
            </FieldGroup>

            <Button
              type="submit"
              size="lg"
              className="h-12 min-w-[180px] font-bold tracking-widest uppercase"
              disabled={profileForm.state.isSubmitting}
            >
              {profileForm.state.isSubmitting ? "Đang lưu..." : "Lưu thông tin"}
            </Button>
          </form>
        </CollapsibleContent>
      </Collapsible>

      {/* ================= Change Password ================= */}
      <Collapsible
        open={openSection === "password"}
        onOpenChange={() => setOpenSection(openSection === "password" ? null : "password")}
        className="bg-card rounded-xl border shadow-sm"
      >
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center justify-between p-6 text-left">
            <div className="space-y-1">
              <h4 className="text-primary text-lg font-bold tracking-tight uppercase">
                Thay đổi mật khẩu
              </h4>
              <p className="text-muted-foreground text-sm">
                Đảm bảo an toàn cho tài khoản của bạn.
              </p>
            </div>
            <ChevronDown
              className={cn(
                "h-5 w-5 transition-transform duration-200",
                openSection === "password" && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-6 pb-8">
          <Separator className="mb-8" />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              passwordForm.handleSubmit();
            }}
            className="space-y-8"
          >
            <FieldGroup className="flex">
              <passwordForm.AppField name="currentPassword">
                {(field) => <field.Password label="Mật khẩu hiện tại*" />}
              </passwordForm.AppField>

              <passwordForm.AppField name="newPassword">
                {(field) => <field.Password label="Mật khẩu mới*" />}
              </passwordForm.AppField>

              <passwordForm.AppField name="confirmPassword">
                {(field) => <field.Password label="Xác nhận mật khẩu mới*" />}
              </passwordForm.AppField>
            </FieldGroup>

            <Button
              type="submit"
              size="lg"
              className="h-12 min-w-[180px] font-bold tracking-widest uppercase"
              disabled={passwordForm.state.isSubmitting}
            >
              {passwordForm.state.isSubmitting ? "Đang xử lý..." : "Cập nhật mật khẩu"}
            </Button>
          </form>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
