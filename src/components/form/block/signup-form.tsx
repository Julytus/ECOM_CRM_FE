"use client";

import { Link } from "@tanstack/react-router";
import { z } from "zod";

import { useAppForm } from "@/components/form/hooks";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { FormBase } from "@/components/form/form-base";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { createSignupMutationOptions } from "@/lib/tanstack/options/auth";
import { toast } from "sonner";
import type { SignupApiRequest } from "@/lib/types/auth";

export const registerSchema = z
  .object({
    name: z.string().min(1, "Vui lòng nhập họ tên"),
    email: z.email("Vui lòng nhập địa chỉ email hợp lệ"),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9]{8,15}$/, "Số điện thoại không hợp lệ"),
    plainPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: "Bạn phải đồng ý với điều khoản sử dụng"
    })
  })
  .refine((data) => data.plainPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu xác nhận không khớp"
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const mutation = useMutation({
    ...createSignupMutationOptions(),
    onSuccess: () => {
      form.reset();
    }
  });
  const form = useAppForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      plainPassword: "",
      confirmPassword: "",
      agreeTerms: true
    } satisfies RegisterFormData as RegisterFormData,
    validators: {
      onSubmit: registerSchema
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(value);
    }
  });

  return (
    <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-24">
      <div className="flex flex-col space-y-8">
        <h4 className="text-2xl font-bold tracking-tight uppercase md:text-3xl">Đăng ký</h4>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <FieldGroup className="gap-6">
            <form.AppField name="name">
              {(field) => <field.Input label="Họ và tên*" placeholder="Nhập họ và tên của bạn" />}
            </form.AppField>

            <form.AppField name="email">
              {(field) => (
                <field.Input label="Địa chỉ email*" placeholder="vd: example@gmail.com" />
              )}
            </form.AppField>

            <form.AppField name="phone">
              {(field) => <field.Input label="Số điện thoại*" placeholder="vd: 0987654321" />}
            </form.AppField>

            <form.AppField name="plainPassword">
              {(field) => <field.Password label="Mật khẩu*" description="" />}
            </form.AppField>

            <form.AppField name="confirmPassword">
              {(field) => <field.Password label="Xác nhận mật khẩu*" description="" />}
            </form.AppField>

            <form.AppField name="agreeTerms">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <div className="flex items-center space-x-2">
                    <FormBase
                      label=""
                      layout="horizontal"
                      placement="before-content"
                      renderLabel={() => (
                        <div className="flex items-center space-x-1 text-sm text-gray-700">
                          <span>Tôi đồng ý với</span>
                          <Link
                            to="/"
                            className="text-primary hover:text-primary/80 font-medium underline underline-offset-4"
                          >
                            Điều khoản sử dụng
                          </Link>
                        </div>
                      )}
                    >
                      <Checkbox
                        id={field.name}
                        name={field.name}
                        checked={field.state.value}
                        onBlur={field.handleBlur}
                        onCheckedChange={(e) => field.handleChange(e === true)}
                        aria-invalid={isInvalid}
                      />
                    </FormBase>
                  </div>
                );
              }}
            </form.AppField>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="h-12 w-full px-12 font-bold tracking-widest uppercase md:w-fit"
              disabled={form.state.isSubmitting}
            >
              {form.state.isSubmitting ? "Đang xử lý..." : "Đăng ký"}
            </Button>
          </FieldGroup>
        </form>
      </div>

      {/* Cột phải: CTA dành cho người đã có tài khoản */}
      <div className="flex flex-col space-y-6 border-t pt-12 md:border-t-0 md:border-l md:pt-4 md:pl-24">
        <h4 className="text-2xl font-bold tracking-tight uppercase md:text-3xl">
          Bạn đã có tài khoản?
        </h4>
        <p className="text-muted-foreground leading-relaxed text-balance">
          Chào mừng bạn quay trở lại. Đăng nhập để truy cập vào trải nghiệm cá nhân hóa, các tùy
          chọn đã lưu và nhiều hơn thế nữa. Chúng tôi rất vui khi thấy bạn!
        </p>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="hover:bg-primary h-12 w-full border-2 px-12 font-bold tracking-widest uppercase transition-all hover:text-white md:w-fit"
        >
          <Link to="/login">Đăng nhập</Link>
        </Button>
      </div>
    </div>
  );
}
