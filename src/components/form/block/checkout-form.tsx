"use client";

import * as React from "react";
import { z } from "zod";
import { Banknote, CreditCard, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAppForm } from "@/components/form/hooks";

import type { CreateOrderRequest, PaymentMethod } from "@/lib/types/order";
import type { ProductVariantDetailDTO } from "@/lib/types/product"; // Assuming this type exists in your types folder
import type { CartItem } from "@/lib/types/cart";
import { useVietnamLocations } from "@/hooks/use-vietnam-locations";
import { toast } from "sonner";
import { SelectItem } from "@/components/ui/select";
import { ImageWithFallback } from "@/components/image/image-with-fallback";

export const checkoutSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập họ tên"),
  phone: z.string().regex(/^[0-9]{8,15}$/, "Số điện thoại không hợp lệ"),
  // Location Fields
  province: z.string().min(1, "Vui lòng chọn Tỉnh/Thành phố"),
  district: z.string().min(1, "Vui lòng chọn Quận/Huyện"),
  ward: z.string().min(1, "Vui lòng chọn Phường/Xã"),
  street: z.string().min(1, "Vui lòng nhập số nhà và tên đường"),
  // Optional / Enum fields
  note: z.string().optional(),
  paymentMethod: z.literal(["COD", "PAYOS"] as const)
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

/**
 * Component Props with Strict Typing
 */
interface CheckoutFormProps {
  subtotal: number;
  items: CartItem[];
  details: ProductVariantDetailDTO[];
  onSubmit: (payload: CreateOrderRequest) => void;
  isPending: boolean;
}

export function CheckoutForm({ subtotal, items, details, onSubmit, isPending }: CheckoutFormProps) {
  const {
    provinces,
    districts,
    wards,
    handleProvinceChange,
    handleDistrictChange,
    selectedProvince,
    selectedDistrict
  } = useVietnamLocations();

  const form = useAppForm({
    defaultValues: {
      name: "",
      phone: "",
      province: "",
      district: "",
      ward: "",
      street: "",
      note: "",
      paymentMethod: "COD"
    } satisfies CheckoutFormData as CheckoutFormData,
    validators: {
      onSubmit: checkoutSchema
    },
    onSubmit: async ({ value }) => {
      if (items.length === 0) {
        toast.error("Giỏ hàng của bạn đang trống");
        return;
      }

      // Format: "Họ Tên | SĐT | Số nhà, Phường, Quận, Tỉnh"
      const fullAddressString = `${value.name} | ${value.phone} | ${value.street}, ${value.ward}, ${value.district}, ${value.province}`;

      const payload: CreateOrderRequest = {
        paymentReturnUrl: "http://localhost:4200/",
        address: fullAddressString,
        note: value.note,
        paymentMethod: value.paymentMethod,
        totalAmount: subtotal,
        discountAmount: 0,
        finalAmount: subtotal,
        items: items.map((item) => ({
          productVariantId: item.variantId,
          quantity: item.quantity
        })) as CreateOrderRequest["items"]
      };

      onSubmit(payload);
    }
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12"
    >
      {/* --- Left Column: Shipping & Payment --- */}
      <div className="space-y-10 lg:col-span-7">
        <section className="space-y-8">
          <header className="flex items-center gap-3 border-b border-neutral-100 pb-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
              <ShoppingBag className="text-primary size-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight uppercase">Thông tin giao hàng</h2>
          </header>

          {/* Using a controlled grid for perfect alignment */}
          <FieldGroup className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-6">
            {/* Row 1: Basic Info (Half-Half) */}
            <div className="md:col-span-3">
              <form.AppField name="name">
                {(field) => <field.Input label="Họ và tên*" placeholder="Nguyễn Văn A" />}
              </form.AppField>
            </div>

            <div className="md:col-span-3">
              <form.AppField name="phone">
                {(field) => <field.Input label="Số điện thoại*" placeholder="09xxxxxxx" />}
              </form.AppField>
            </div>

            {/* Row 2: Location Selects (One-Third each) */}
            <div className="md:col-span-2">
              <form.AppField name="province">
                {(field) => (
                  <field.Select
                    label="Tỉnh / Thành phố*"
                    placeholder="Chọn Tỉnh/Thành"
                    onValueChange={(val) => {
                      const item = provinces.find((p) => p.name === val);
                      if (item) handleProvinceChange(item.code.toString());
                      form.setFieldValue("district", "");
                      form.setFieldValue("ward", "");
                    }}
                  >
                    {provinces.map((p) => (
                      <SelectItem key={p.code} value={p.name}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </field.Select>
                )}
              </form.AppField>
            </div>

            <div className="md:col-span-2">
              <form.AppField name="district">
                {(field) => (
                  <field.Select
                    label="Quận / Huyện*"
                    placeholder="Chọn Quận/Huyện"
                    disabled={!selectedProvince}
                    onValueChange={(val) => {
                      const item = districts.find((d) => d.name === val);
                      if (item) handleDistrictChange(item.code.toString());
                      form.setFieldValue("ward", "");
                    }}
                  >
                    {districts.map((d) => (
                      <SelectItem key={d.code} value={d.name}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </field.Select>
                )}
              </form.AppField>
            </div>

            <div className="md:col-span-2">
              <form.AppField name="ward">
                {(field) => (
                  <field.Select
                    label="Phường / Xã*"
                    placeholder="Chọn Phường/Xã"
                    disabled={!selectedDistrict}
                  >
                    {wards.map((w) => (
                      <SelectItem key={w.code} value={w.name}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </field.Select>
                )}
              </form.AppField>
            </div>

            {/* Row 3: Detail Address (Full Width) */}
            <div className="md:col-span-6">
              <form.AppField name="street">
                {(field) => (
                  <field.Input label="Số nhà, tên đường*" placeholder="VD: 123 Nguyễn Huệ" />
                )}
              </form.AppField>
            </div>

            {/* Row 4: Note (Full Width) */}
            <div className="md:col-span-6">
              <form.AppField name="note">
                {(field) => (
                  <field.Textarea
                    label="Ghi chú đơn hàng"
                    placeholder="Lưu ý cho người bán (tùy chọn)"
                  />
                )}
              </form.AppField>
            </div>
          </FieldGroup>
        </section>

        <section className="space-y-6">
          <header className="flex items-center gap-2 border-b pb-2">
            <CreditCard className="text-primary size-5" />
            <h2 className="text-xl font-bold tracking-wide uppercase">Phương thức thanh toán</h2>
          </header>

          <form.AppField name="paymentMethod">
            {(field) => (
              <RadioGroup
                value={field.state.value}
                onValueChange={(val) => field.handleChange(val as PaymentMethod)}
                className="grid grid-cols-1 gap-4 md:grid-cols-2"
              >
                <PaymentOption
                  value="COD"
                  label="Thanh toán khi nhận hàng"
                  description="Trả tiền mặt khi giao hàng (COD)"
                  icon={<Banknote className="size-6" />}
                />
                <PaymentOption
                  value="PAYOS"
                  label="Thanh toán trực tuyến"
                  description="Thanh toán nhanh chóng qua cổng PAYOS"
                  icon={<CreditCard className="size-6" />}
                />
              </RadioGroup>
            )}
          </form.AppField>
        </section>
      </div>

      {/* --- Right Column: Summary Stick-to-Top --- */}
      <div className="lg:col-span-5">
        <div className="bg-card rounded-2xl border p-8 shadow-sm">
          <h3 className="mb-6 text-lg font-bold tracking-wider uppercase">Đơn hàng của bạn</h3>

          <div className="max-h-[35vh] space-y-4 overflow-y-auto pr-2">
            {items.map((item) => {
              const detail = details.find((d) => d.id === item.variantId);
              return (
                <div key={`${item.productId}-${item.variantId}`} className="flex gap-4">
                  <div className="bg-muted size-20 shrink-0 overflow-hidden rounded-xl border">
                    <ImageWithFallback
                      src={detail?.image || ""}
                      className="h-full w-full object-cover transition-transform hover:scale-110"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center gap-1">
                    <p className="line-clamp-1 text-sm font-bold uppercase">
                      {detail?.productName}
                    </p>
                    <p className="text-muted-foreground text-xs font-medium">
                      Số lượng: {item.quantity}
                    </p>
                    <p className="text-primary text-sm font-bold">
                      {(detail?.price || 0).toLocaleString()}đ
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <Separator className="my-8" />

          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">Tạm tính</span>
              <span className="font-bold">{subtotal.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">Phí vận chuyển</span>
              <span className="font-bold text-green-600 uppercase">Miễn phí</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-xl font-black">
              <span className="uppercase">Tổng cộng</span>
              <span className="text-primary">{subtotal.toLocaleString()}đ</span>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="mt-8 h-14 w-full text-base font-black tracking-[0.2em] uppercase"
            disabled={isPending || items.length === 0}
          >
            {isPending ? "Đang xử lý..." : "Xác nhận đặt hàng"}
          </Button>

          <p className="text-muted-foreground mt-4 text-center text-[10px] leading-relaxed uppercase">
            Bằng cách đặt hàng, bạn đồng ý với Điều khoản & Chính sách bảo mật của chúng tôi.
          </p>
        </div>
      </div>
    </form>
  );
}

/**
 * Payment Option Sub-component
 */
interface PaymentOptionProps {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

function PaymentOption({ value, label, description, icon }: PaymentOptionProps) {
  return (
    <div className="relative">
      <RadioGroupItem value={value} id={value} className="peer sr-only" />
      <label
        htmlFor={value}
        className="hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 flex cursor-pointer flex-col gap-3 rounded-xl border-2 p-5 transition-all duration-200"
      >
        <div className="text-primary">{icon}</div>
        <div>
          <p className="text-sm leading-tight font-bold tracking-tight uppercase">{label}</p>
          <p className="text-muted-foreground mt-1 text-[11px] leading-tight font-medium">
            {description}
          </p>
        </div>
      </label>
    </div>
  );
}
