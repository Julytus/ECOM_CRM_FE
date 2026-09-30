"use client";

import { Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { useAppForm } from "@/components/form/hooks";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { useMutation } from "@tanstack/react-query";
import { createLoginMutationOptions } from "@/lib/tanstack/options/auth";
import type { LoginApiRequest } from "@/lib/types/auth";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/auth";

const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Vui lòng nhập email hoặc số điện thoại")
    .refine(
      (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^[0-9]{8,15}$/.test(v),
      "Email hoặc số điện thoại không hợp lệ"
    ),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  rememberMe: z.boolean().optional()
});

const isEmail = (v: string) => v.includes("@");

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const navigate = useNavigate();
  const set = useAuthStore((s) => s.set);
  const mutation = useMutation({
    ...createLoginMutationOptions(),
    onSuccess: (data) => {
      set({ accessToken: data.token, refreshToken: null });
      form.reset();
      navigate({ to: "/" });
    }
  });
  const form = useAppForm({
    defaultValues: {
      identifier: "",
      password: "",
      rememberMe: true
    } satisfies LoginFormData as LoginFormData,
    validators: {
      onSubmit: loginSchema
    },
    onSubmit: async ({ value }) => {
      const payload: LoginApiRequest = isEmail(value.identifier)
        ? { email: value.identifier, plainPassword: value.password }
        : { phone: value.identifier, plainPassword: value.password };

      mutation.mutate(payload);
    }
  });

  return (
    <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-24">
      <div className="flex flex-col space-y-8">
        <h4 className="text-2xl font-bold tracking-tight md:text-3xl">Đăng nhập</h4>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <FieldGroup className="gap-6">
            {/* Email Field */}
            <form.AppField name="identifier">
              {(field) => (
                <field.Input
                  label="Email hoặc số điện thoại*"
                  placeholder="vd: example@gmail.com hoặc 0987654321"
                  description=""
                />
              )}
            </form.AppField>

            {/* Password Field */}
            <form.AppField name="password">
              {(field) => <field.Password label="Mật khẩu*" description="" />}
            </form.AppField>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between">
              <form.AppField name="rememberMe">
                {(field) => (
                  <div className="flex items-center space-x-2">
                    <field.Checkbox label="Ghi nhớ đăng nhập" />
                  </div>
                )}
              </form.AppField>

              <Link
                to="/"
                className="text-primary text-sm font-medium underline-offset-4 hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="h-12 w-full px-12 font-bold tracking-widest uppercase md:w-fit"
              disabled={form.state.isSubmitting}
            >
              {form.state.isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </FieldGroup>
        </form>
      </div>

      {/* Right Column: CTA */}
      <div className="flex flex-col space-y-6 border-t pt-12 md:border-t-0 md:border-l md:pt-0 md:pl-24">
        <h4 className="text-2xl font-bold tracking-tight md:text-3xl">Khách hàng mới</h4>
        <p className="text-muted-foreground leading-relaxed">
          Hãy trở thành một phần trong cộng đồng khách hàng mới của chúng tôi! Tham gia ngay hôm nay
          và trải nghiệm những ưu đãi, chương trình độc quyền và trải nghiệm cá nhân hóa.
        </p>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="h-12 w-full border-2 px-12 font-bold tracking-widest uppercase md:w-fit"
        >
          <Link to="/register">Đăng ký</Link>
        </Button>
      </div>
    </div>
  );
}
