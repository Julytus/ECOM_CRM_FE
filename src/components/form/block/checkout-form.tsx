"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Banknote, CreditCard, Loader2, Lock, TicketPercent, Truck, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { formatVnd } from "@/lib/format";
import { LoyaltyVoucherSelect } from "@/components/shop/checkout/loyalty-voucher-select";
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
  const [customerVoucherId, setCustomerVoucherId] = React.useState<number | undefined>();
  const [previewForKey, setPreviewForKey] = React.useState<string | null>(null);
  const previewMutation = useMutation(previewCheckoutMutationOptions());
  const itemSignature = items
    .map(({ variantId, quantity }) => `${variantId}:${quantity}`)
    .join(",");
  const previewRequestKey = JSON.stringify([itemSignature, voucherInput.trim(), customerVoucherId]);
  const latestPreviewKey = React.useRef(previewRequestKey);
  latestPreviewKey.current = previewRequestKey;
  const voucherPayload = buildVoucherPayload(voucherInput, customerVoucherId);

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
      if (!items.length || previewForKey !== previewRequestKey || previewError) return;

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
        ...voucherPayload
      };

      onSubmit(payload);
    }
  });

  React.useEffect(() => {
    if (items.length === 0) {
      setPreview(emptyPreview);
      setPreviewForKey(null);
      return;
    }

    setPreviewForKey(null);
    setPreviewError(null);
    const timeoutId = window.setTimeout(() => {
      previewMutation.mutate(
        {
          items: items.map((item) => ({
            productVariantId: item.variantId,
            quantity: item.quantity
          })),
          ...voucherPayload
        },
        {
          onSuccess: (result) => {
            if (latestPreviewKey.current !== previewRequestKey) return;
            setPreview(result ?? emptyPreview);
            setPreviewForKey(previewRequestKey);
          },
          onError: (error) => {
            if (latestPreviewKey.current !== previewRequestKey) return;
            const responseMessage = (error as AxiosError<{ message?: string }>).response?.data
              ?.message;
            setPreview(emptyPreview);
            setPreviewForKey(null);
            setPreviewError(responseMessage || "Không thể áp dụng voucher hoặc tính phí đơn hàng.");
          }
        }
      );
    }, 350);

    return () => window.clearTimeout(timeoutId);
    // The item signature tracks cart changes without depending on array identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewRequestKey]);

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
      className="grid grid-cols-1 items-start gap-6 md:gap-8 lg:grid-cols-12 lg:gap-10"
    >
      <div className="space-y-6 lg:col-span-7">
        <section
          aria-labelledby="checkout-shipping"
          className="bg-card text-card-foreground border-border space-y-6 rounded-2xl border p-5 shadow-xs sm:p-6"
        >
          <SectionHeader
            id="checkout-shipping"
            step={1}
            icon={<Truck />}
            title="Địa chỉ giao hàng"
          />
          <FieldGroup className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <form.AppField name="receiverName">
              {(field) => <field.Input label="Tên người nhận*" placeholder="Nguyễn Văn A" />}
            </form.AppField>
            <form.AppField name="receiverPhone">
              {(field) => <field.Input label="Số điện thoại người nhận*" placeholder="09xxxxxxx" />}
            </form.AppField>
            <div className="md:col-span-2">
              <form.AppField name="addressLine">
                {(field) => (
                  <field.Input
                    label="Địa chỉ*"
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                  />
                )}
              </form.AppField>
            </div>
          </FieldGroup>
        </section>

        <section
          aria-labelledby="checkout-buyer"
          className="bg-card text-card-foreground border-border space-y-6 rounded-2xl border p-5 shadow-xs sm:p-6"
        >
          <SectionHeader id="checkout-buyer" step={2} icon={<UserRound />} title="Người mua" />
          <label className="hover:bg-muted/60 -mx-2 flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm">
            <Checkbox
              checked={receiverIsBuyer}
              onCheckedChange={(checked) => setSameAsBuyer(checked === true)}
            />
            Người nhận là người mua
          </label>
          <FieldGroup className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <form.AppField name="buyerName">
              {(field) => (
                <label className="grid gap-2 text-sm font-medium" htmlFor="buyerName">
                  Họ và tên người mua*
                  <Input
                    id="buyerName"
                    value={field.state.value}
                    placeholder="Nguyễn Văn A"
                    onBlur={field.handleBlur}
                    onChange={(event) => setBuyerValue("buyerName", event.target.value)}
                  />
                </label>
              )}
            </form.AppField>
            <form.AppField name="buyerPhone">
              {(field) => (
                <label className="grid gap-2 text-sm font-medium" htmlFor="buyerPhone">
                  Số điện thoại người mua*
                  <Input
                    id="buyerPhone"
                    value={field.state.value}
                    placeholder="09xxxxxxx"
                    onBlur={field.handleBlur}
                    onChange={(event) => setBuyerValue("buyerPhone", event.target.value)}
                  />
                </label>
              )}
            </form.AppField>
            <div className="md:col-span-2">
              <form.AppField name="buyerEmail">
                {(field) => (
                  <label className="grid gap-2 text-sm font-medium" htmlFor="buyerEmail">
                    Email
                    <Input
                      id="buyerEmail"
                      type="email"
                      value={field.state.value}
                      placeholder="email@example.com"
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                  </label>
                )}
              </form.AppField>
            </div>
          </FieldGroup>
        </section>

        <section
          aria-labelledby="checkout-voucher"
          className="bg-card text-card-foreground border-border space-y-4 rounded-2xl border p-5 shadow-xs sm:p-6"
        >
          <SectionHeader id="checkout-voucher" step={3} icon={<TicketPercent />} title="Voucher" />
          <label className="grid gap-2 text-sm font-medium" htmlFor="voucherCode">
            Mã voucher
            <Input
              id="voucherCode"
              value={voucherInput}
              placeholder="Nhập mã voucher"
              onChange={(event) => setVoucherInput(event.target.value)}
            />
          </label>
          <LoyaltyVoucherSelect value={customerVoucherId} onChange={setCustomerVoucherId} />
          {previewError && (
            <p role="alert" className="text-destructive text-sm">
              {previewError}
            </p>
          )}
        </section>

        <section
          aria-labelledby="checkout-payment"
          className="bg-card text-card-foreground border-border space-y-6 rounded-2xl border p-5 shadow-xs sm:p-6"
        >
          <SectionHeader
            id="checkout-payment"
            step={4}
            icon={<CreditCard />}
            title="Phương thức thanh toán"
          />
          <form.AppField name="paymentMethod">
            {(field) => (
              <RadioGroup
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value as "COD" | "PAYOS")}
                aria-label="Phương thức thanh toán"
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                <PaymentOption
                  value="COD"
                  label="Thanh toán khi nhận hàng"
                  description="Trả tiền khi giao hàng"
                  icon={<Banknote className="size-6" />}
                />
                <PaymentOption
                  value="PAYOS"
                  label="Thanh toán trực tuyến"
                  description="Thanh toán qua cổng PAYOS"
                  icon={<CreditCard className="size-6" />}
                />
              </RadioGroup>
            )}
          </form.AppField>
          <form.AppField name="note">
            {(field) => (
              <field.Textarea
                label="Ghi chú đơn hàng"
                placeholder="Lưu ý cho người bán (tuỳ chọn)"
              />
            )}
          </form.AppField>
        </section>
      </div>

      <aside aria-labelledby="checkout-summary" className="lg:sticky lg:top-28 lg:col-span-5">
        <div className="bg-card text-card-foreground border-border rounded-2xl border p-5 shadow-sm sm:p-6 lg:p-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 id="checkout-summary" className="font-display text-2xl font-semibold">
              Đơn hàng của bạn
            </h2>
            <span className="bg-muted text-foreground rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums">
              {items.length} sản phẩm
            </span>
          </div>
          <ul role="list" className="max-h-[35vh] space-y-4 overflow-y-auto pr-1">
            {items.map((item) => {
              const detail = details.find((product) => product.id === item.variantId);
              return (
                <li key={`${item.productId}-${item.variantId}`} className="flex gap-4">
                  <div className="bg-muted border-border size-20 shrink-0 overflow-hidden rounded-xl border">
                    <ImageWithFallback
                      src={detail?.image || ""}
                      alt={detail?.productName || "Sản phẩm"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                    <p className="line-clamp-2 text-sm font-medium">{detail?.productName}</p>
                    <p className="text-muted-foreground text-xs">Số lượng: {item.quantity}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <Separator className="my-6" />
          <div className="space-y-3" aria-live="polite">
            <MoneyRow label="Tạm tính" value={preview.subtotal} />
            <MoneyRow label="Giảm giá (voucher)" value={preview.discount} tone="success" />
            <MoneyRow label="Giảm giá (đổi điểm)" value={preview.loyaltyDiscount} tone="success" />
            <MoneyRow label="Phí vận chuyển" value={preview.shippingFee} />
            {preview.voucherCode && (
              <p className="text-success text-xs font-medium">
                Đã áp dụng voucher: {preview.voucherCode}
              </p>
            )}
            <Separator className="my-2" />
            <MoneyRow label="Tổng" value={preview.finalAmount} emphasis />
            {previewMutation.isPending && (
              <p className="text-muted-foreground text-xs">Đang cập nhật tổng tiền…</p>
            )}
          </div>
          <Button
            type="submit"
            size="lg"
            className="mt-6 h-12 w-full rounded-xl text-sm font-semibold tracking-[0.12em] uppercase md:h-14"
            disabled={isPending || items.length === 0 || previewMutation.isPending || previewForKey !== previewRequestKey || Boolean(previewError)}
            aria-busy={isPending}
          >
            {isPending ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Lock aria-hidden="true" className="size-4" />
            )}
            {isPending ? "Đang xử lý…" : "Xác nhận đặt hàng"}
          </Button>
        </div>
      </aside>
    </form>
  );
}

function MoneyRow({
  label,
  value,
  emphasis = false,
  tone
}: {
  label: string;
  value?: number;
  emphasis?: boolean;
  tone?: "success";
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4",
        emphasis ? "text-lg font-semibold md:text-xl" : "text-sm"
      )}
    >
      <span className={emphasis ? "text-foreground" : "text-muted-foreground"}>{label}</span>
      <span
        className={cn(
          "tabular-nums",
          emphasis ? "text-foreground font-bold" : "font-medium",
          tone === "success" && value ? "text-success" : undefined
        )}
      >
        {value === undefined ? "—" : formatVnd(value)}
      </span>
    </div>
  );
}

function buildVoucherPayload(
  voucherCode: string,
  customerVoucherId?: number
): Pick<CheckoutRequest, "voucherCode" | "customerVoucherId"> {
  return {
    ...(voucherCode.trim() ? { voucherCode: voucherCode.trim() } : {}),
    ...(customerVoucherId !== undefined ? { customerVoucherId } : {})
  };
}

function SectionHeader({
  id,
  step,
  icon,
  title
}: {
  id: string;
  step: number;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <header className="border-border flex items-center gap-3 border-b pb-4">
      <span
        aria-hidden="true"
        className="bg-muted text-foreground flex size-9 shrink-0 items-center justify-center rounded-full [&_svg]:size-4"
      >
        {icon}
      </span>
      <h2 id={id} className="font-sans text-base font-semibold tracking-tight md:text-lg">
        <span className="text-muted-foreground mr-1.5 tabular-nums">{step}.</span>
        {title}
      </h2>
    </header>
  );
}

function PaymentOption({
  value,
  label,
  description,
  icon
}: {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative">
      <RadioGroupItem value={value} id={value} className="peer sr-only" />
      <label
        htmlFor={value}
        className="border-border hover:bg-muted/60 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-focus-visible:ring-ring/60 peer-focus-visible:ring-offset-background flex h-full cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 sm:p-5"
      >
        <span
          aria-hidden="true"
          className="bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-full [&_svg]:size-5"
        >
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold">{label}</span>
          <span className="text-muted-foreground mt-1 block text-xs">{description}</span>
        </span>
      </label>
    </div>
  );
}
