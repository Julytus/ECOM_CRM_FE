"use client";

import * as React from "react";
import type { AxiosError } from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/layout/page-warper";
import { QueryBoundary } from "@/components/boundary";
import { CheckoutForm } from "@/components/form/block/checkout-form";
import { CheckoutSuccess } from "@/components/shop/checkout-success";
import { createProductVariantDetailByIdsQueryOptions } from "@/lib/tanstack/options/product";
import { submitCheckoutMutationOptions } from "@/lib/tanstack/options/checkout";
import { usePaymentDone } from "@/lib/socket";
import type { components } from "@/lib/api/schema.gen";
import { useCartStore } from "@/lib/stores/cart";

type CheckoutResponse = components["schemas"]["CheckoutResponse"];

export const Route = createFileRoute("/_shop/checkout/")({ component: CheckoutPage });

function CheckoutPage() {
  const { getSelectedItems, clearSelected } = useCartStore();
  const selectedItems = getSelectedItems();
  const variantIds = React.useMemo(() => selectedItems.map((item) => item.variantId), [selectedItems]);
  const [checkoutResult, setCheckoutResult] = React.useState<CheckoutResponse | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = React.useState(false);

  const query = useQuery({
    ...createProductVariantDetailByIdsQueryOptions({ ids: variantIds }),
    enabled: variantIds.length > 0
  });
  const mutation = useMutation(submitCheckoutMutationOptions());

  const submitCheckout = (payload: components["schemas"]["CheckoutRequest"]) => {
    mutation.mutate(payload, {
      onSuccess: (result) => {
        if (!result) {
          toast.error("Không nhận được thông tin đơn hàng.");
          return;
        }
        clearSelected();
        setCheckoutResult(result);
        toast.success("Đặt hàng thành công!");
      },
      onError: (error) => {
        const message = (error as AxiosError<{ message?: string }>).response?.data?.message;
        toast.error(message || "Không thể đặt hàng. Vui lòng kiểm tra thông tin và thử lại.");
      }
    });
  };

  const handlePaymentDone = React.useCallback(() => setPaymentConfirmed(true), []);
  usePaymentDone(checkoutResult?.paymentMethod === "PAYOS" ? checkoutResult.invoiceId : undefined, handlePaymentDone);

  return (
    <PageWrapper
      title="Thanh toán"
      image="/page-title/page-title-1.jpg"
      breadcrumbItems={[{ label: "Trang chủ", href: "/" }, { label: "Giỏ hàng", href: "/cart" }, { label: "Thanh toán" }]}
    >
      <div className="relative container mx-auto px-4 py-16">
        {checkoutResult ? (
          <CheckoutSuccess result={checkoutResult} paymentConfirmed={paymentConfirmed} />
        ) : (
          <QueryBoundary
            status={variantIds.length > 0 ? query.status : "success"}
            data={query.data}
            error={query.error}
            emptyFallback={
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <ShoppingBag className="text-muted-foreground mb-4 size-12 opacity-20" />
                <h3 className="text-xl font-bold">Giỏ hàng trống</h3>
                <p className="text-muted-foreground mb-6">Vui lòng chọn sản phẩm trước khi thanh toán.</p>
                <Button asChild><Link to="/">Tiếp tục mua sắm</Link></Button>
              </div>
            }
          >
            {(details) => (
              <CheckoutForm
                details={details}
                items={selectedItems}
                isPending={mutation.isPending}
                onSubmit={submitCheckout}
              />
            )}
          </QueryBoundary>
        )}
      </div>
    </PageWrapper>
  );
}
