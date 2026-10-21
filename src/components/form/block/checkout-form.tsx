"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Banknote, CreditCard, ShoppingBag } from "lucide-react";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ImageWithFallback } from "@/components/image/image-with-fallback";
import { useAppForm } from "@/components/form/hooks";
import { previewCheckoutMutationOptions } from "@/lib/tanstack/options/checkout";
import type { components } from "@/lib/api/schema.gen";
import type { ProductVariantDetailDTO } from "@/lib/types/product";
import type { CartItem } from "@/lib/types/cart";

type CheckoutRequest = components["schemas"]["CheckoutRequest"];
type CheckoutPreview = components["schemas"]["CheckoutPreviewResponse"];

const phoneSchema = z.string().regex(/^[0-9]{8,15}$/, "Số điện thoại không hợp lệ");

export const checkoutSchema = z.object({
  buyerName: z.string().min(1, "Vui lòng nhập họ tên người mua"),
  buyerPhone: phoneSchema,
  buyerEmail: z.union([z.literal(""), z.email("Email không hợp lệ")]),
  receiverName: z.string().min(1, "Vui lòng nhập tên người nhận"),
  receiverPhone: phoneSchema,
  addressLine: z.string().min(1, "Vui lòng nhập địa chỉ giao hàng"),
  voucherCode: z.string(),
  note: z.string(),
  paymentMethod: z.enum(["COD", "PAYOS"])
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  items: CartItem[];
  details: ProductVariantDetailDTO[];
  onSubmit: (payload: CheckoutRequest) => void;
  isPending: boolean;
}

const emptyPreview: CheckoutPreview = {};

export function CheckoutForm({ items, details, onSubmit, isPending }: CheckoutFormProps) {
  const [receiverIsBuyer, setReceiverIsBuyer] = React.useState(false);
  const [preview, setPreview] = React.useState<CheckoutPreview>(emptyPreview);
  const [previewError, setPreviewError] = React.useState<string | null>(null);
  const [voucherInput, setVoucherInput] = React.useState("");
  const previewMutation = useMutation(previewCheckoutMutationOptions());
  const itemSignature = items.map(({ variantId, quantity }) => `${variantId}:${quantity}`).join(",");

  const form = useAppForm({
    defaultValues: {
      buyerName: "",
      buyerPhone: "",
      buyerEmail: "",
      receiverName: "",
      receiverPhone: "",
      addressLine: "",
      voucherCode: "",
      note: "",
      paymentMethod: "COD"
    } as CheckoutFormData,
    validators: { onSubmit: checkoutSchema },
    onSubmit: async ({ value }) => {
      if (!items.length) return;

      const payload: CheckoutRequest = {
        items: items.map((item) => ({
          productVariantId: item.variantId,
          quantity: item.quantity
        })),
        buyerName: value.buyerName.trim(),
        buyerPhone: value.buyerPhone.trim(),
        ...(value.buyerEmail.trim() ? { buyerEmail: value.buyerEmail.trim() } : {}),
        receiverName: value.receiverName.trim(),
        receiverPhone: value.receiverPhone.trim(),
        addressLine: value.addressLine.trim(),
        ...(value.note.trim() ? { note: value.note.trim() } : {}),
        paymentMethod: value.paymentMethod,
        ...(voucherInput.trim() ? { voucherCode: voucherInput.trim() } : {})
      };

      onSubmit(payload);
    }
  });

  React.useEffect(() => {
    if (items.length === 0) {
      setPreview(emptyPreview);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPreviewError(null);
      previewMutation.mutate(
        {
          items: items.map((item) => ({
            productVariantId: item.variantId,
            quantity: item.quantity
          })),
          ...(voucherInput.trim() ? { voucherCode: voucherInput.trim() } : {})
        },
        {
          onSuccess: (result) => setPreview(result ?? emptyPreview),
          onError: (error) => {
            const responseMessage = (error as AxiosError<{ message?: string }>).response?.data?.message;
            setPreview(emptyPreview);
            setPreviewError(responseMessage || "Không thể áp dụng voucher hoặc tính phí đơn hàng.");
          }
        }
      );
    }, 350);

    return () => window.clearTimeout(timeoutId);
    // The item signature tracks cart changes without depending on array identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemSignature, voucherInput]);

  const setSameAsBuyer = (checked: boolean) => {
    setReceiverIsBuyer(checked);
    if (checked) {
      form.setFieldValue("receiverName", form.getFieldValue("buyerName"));
      form.setFieldValue("receiverPhone", form.getFieldValue("buyerPhone"));
    }
  };

  const setBuyerValue = (name: "buyerName" | "buyerPhone", value: string) => {
    form.setFieldValue(name, value);
    if (receiverIsBuyer) {
      form.setFieldValue(name === "buyerName" ? "receiverName" : "receiverPhone", value);
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12"
    >
      <div className="space-y-10 lg:col-span-7">
        <section className="space-y-6">
          <header className="flex items-center gap-3 border-b border-neutral-100 pb-3">
            <ShoppingBag className="text-primary size-5" />
            <h2 className="text-xl font-bold tracking-tight uppercase">Địa chỉ giao hàng</h2>
          </header>
          <FieldGroup className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <form.AppField name="receiverName">
              {(field) => <field.Input label="Tên người nhận*" placeholder="Nguyễn Văn A" />}
            </form.AppField>
            <form.AppField name="receiverPhone">
              {(field) => <field.Input label="Số điện thoại người nhận*" placeholder="09xxxxxxx" />}
            </form.AppField>
            <div className="md:col-span-2">
              <form.AppField name="addressLine">
                {(field) => <field.Input label="Địa chỉ*" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" />}
              </form.AppField>
            </div>
          </FieldGroup>
        </section>

        <section className="space-y-6">
          <header className="border-b border-neutral-100 pb-3">
            <h2 className="text-xl font-bold tracking-tight uppercase">Người mua</h2>
          </header>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={receiverIsBuyer} onCheckedChange={(checked) => setSameAsBuyer(checked === true)} />
            Người nhận là người mua
          </label>
          <FieldGroup className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <form.AppField name="buyerName">
              {(field) => (
                <label className="grid gap-2 text-sm font-medium" htmlFor="buyerName">
                  Họ và tên người mua*
                  <Input id="buyerName" value={field.state.value} placeholder="Nguyễn Văn A" onBlur={field.handleBlur} onChange={(event) => setBuyerValue("buyerName", event.target.value)} />
                </label>
              )}
            </form.AppField>
            <form.AppField name="buyerPhone">
              {(field) => (
                <label className="grid gap-2 text-sm font-medium" htmlFor="buyerPhone">
                  Số điện thoại người mua*
                  <Input id="buyerPhone" value={field.state.value} placeholder="09xxxxxxx" onBlur={field.handleBlur} onChange={(event) => setBuyerValue("buyerPhone", event.target.value)} />
                </label>
              )}
            </form.AppField>
            <div className="md:col-span-2">
              <form.AppField name="buyerEmail">
                {(field) => (
                  <label className="grid gap-2 text-sm font-medium" htmlFor="buyerEmail">
                    Email
                    <Input id="buyerEmail" type="email" value={field.state.value} placeholder="email@example.com" onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value)} />
                  </label>
                )}
              </form.AppField>
            </div>
          </FieldGroup>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight uppercase">Voucher</h2>
          <label className="grid gap-2 text-sm font-medium" htmlFor="voucherCode">
            Mã voucher
            <Input id="voucherCode" value={voucherInput} placeholder="Nhập mã voucher" onChange={(event) => setVoucherInput(event.target.value)} />
          </label>
          {previewError && <p role="alert" className="text-destructive text-sm">{previewError}</p>}
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
                onValueChange={(value) => field.handleChange(value as "COD" | "PAYOS")}
                className="grid grid-cols-1 gap-4 md:grid-cols-2"
              >
                <PaymentOption value="COD" label="Thanh toán khi nhận hàng" description="Trả tiền khi giao hàng" icon={<Banknote className="size-6" />} />
                <PaymentOption value="PAYOS" label="Thanh toán trực tuyến" description="Thanh toán qua cổng PAYOS" icon={<CreditCard className="size-6" />} />
              </RadioGroup>
            )}
          </form.AppField>
          <form.AppField name="note">
            {(field) => <field.Textarea label="Ghi chú đơn hàng" placeholder="Lưu ý cho người bán (tuỳ chọn)" />}
          </form.AppField>
        </section>
      </div>

      <aside className="lg:col-span-5">
        <div className="bg-card rounded-2xl border p-8 shadow-sm">
          <h3 className="mb-6 text-lg font-bold tracking-wider uppercase">Đơn hàng của bạn</h3>
          <div className="max-h-[35vh] space-y-4 overflow-y-auto pr-2">
            {items.map((item) => {
              const detail = details.find((product) => product.id === item.variantId);
              return (
                <div key={`${item.productId}-${item.variantId}`} className="flex gap-4">
                  <div className="bg-muted size-20 shrink-0 overflow-hidden rounded-xl border">
                    <ImageWithFallback src={detail?.image || ""} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col justify-center gap-1">
                    <p className="line-clamp-1 text-sm font-bold uppercase">{detail?.productName}</p>
                    <p className="text-muted-foreground text-xs">Số lượng: {item.quantity}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <Separator className="my-8" />
          <div className="space-y-4">
            <MoneyRow label="Tạm tính" value={preview.subtotal} />
            <MoneyRow label="Giảm giá" value={preview.discount} />
            <MoneyRow label="Phí vận chuyển" value={preview.shippingFee} />
            {preview.voucherCode && <p className="text-muted-foreground text-xs">Voucher: {preview.voucherCode}</p>}
            <Separator className="my-2" />
            <MoneyRow label="Tổng cộng" value={preview.finalAmount} emphasis />
            {previewMutation.isPending && <p className="text-muted-foreground text-xs">Đang cập nhật tổng tiền…</p>}
          </div>
          <Button type="submit" size="lg" className="mt-8 h-14 w-full text-base font-black uppercase" disabled={isPending || items.length === 0}>
            {isPending ? "Đang xử lý…" : "Xác nhận đặt hàng"}
          </Button>
        </div>
      </aside>
    </form>
  );
}

function MoneyRow({ label, value, emphasis = false }: { label: string; value?: number; emphasis?: boolean }) {
  return (
    <div className={`flex justify-between ${emphasis ? "text-xl font-black" : "text-sm"}`}>
      <span className={emphasis ? "uppercase" : "text-muted-foreground font-medium"}>{label}</span>
      <span className={emphasis ? "text-primary" : "font-bold"}>{value === undefined ? "—" : `${value.toLocaleString("vi-VN")}₫`}</span>
    </div>
  );
}

function PaymentOption({ value, label, description, icon }: { value: string; label: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="relative">
      <RadioGroupItem value={value} id={value} className="peer sr-only" />
      <label htmlFor={value} className="hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 flex cursor-pointer flex-col gap-3 rounded-xl border-2 p-5 transition-all">
        <div className="text-primary">{icon}</div>
        <div>
          <p className="text-sm font-bold uppercase">{label}</p>
          <p className="text-muted-foreground mt-1 text-xs">{description}</p>
        </div>
      </label>
    </div>
  );
}
