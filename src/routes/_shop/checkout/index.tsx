"use client";

import * as React from "react";
import type { AxiosError } from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
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
  const variantIds = React.useMemo(
    () => selectedItems.map((item) => item.variantId),
    [selectedItems]
  );
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
  usePaymentDone(
    checkoutResult?.paymentMethod === "PAYOS" ? checkoutResult.invoiceId : undefined,
    handlePaymentDone
  );

  return (
    <PageWrapper
      title="Thanh toán"
      image="/page-title/page-title-1.jpg"
      breadcrumbItems={[
        { label: "Trang chủ", href: "/" },
        { label: "Giỏ hàng", href: "/cart" },
        { label: "Thanh toán" }
      ]}
    >
      <div className="relative container mx-auto px-4 py-8 sm:px-6 md:py-12 lg:px-8 lg:py-16">
        {checkoutResult ? (
          <CheckoutSuccess result={checkoutResult} paymentConfirmed={paymentConfirmed} />
        ) : (
          <QueryBoundary
            status={variantIds.length > 0 ? query.status : "success"}
            data={query.data}
            error={query.error}
            loadingFallback={<CheckoutSkeleton />}
            emptyFallback={
              <Empty className="border-border mx-auto max-w-xl rounded-2xl border border-dashed py-16">
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="size-14 rounded-full">
                    <ShoppingBag aria-hidden="true" />
                  </EmptyMedia>
                  <EmptyTitle className="font-display text-2xl font-semibold">
                    Giỏ hàng trống
                  </EmptyTitle>
                  <EmptyDescription>Vui lòng chọn sản phẩm trước khi thanh toán.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button asChild size="lg" className="h-11 rounded-full px-8">
                    <Link to="/">Tiếp tục mua sắm</Link>
                  </Button>
                </EmptyContent>
              </Empty>
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

function CheckoutSkeleton() {
  return (
    <div
      role="status"
      aria-label="Đang tải thông tin thanh toán"
      className="grid grid-cols-1 items-start gap-6 md:gap-8 lg:grid-cols-12 lg:gap-10"
    >
      <div className="space-y-6 lg:col-span-7">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-56 w-full rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-96 w-full rounded-2xl lg:col-span-5" />
    </div>
  );
}
