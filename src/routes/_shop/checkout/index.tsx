"use client";

import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/layout/page-warper";
import { QueryBoundary } from "@/components/boundary";
import { CheckoutForm } from "@/components/form/block/checkout-form";

import { createOrderMutationOptions } from "@/lib/tanstack/options/order";
import { createProductVariantDetailByIdsQueryOptions } from "@/lib/tanstack/options/product";
import { useCartStore } from "@/lib/stores/cart";

export const Route = createFileRoute("/_shop/checkout/")({
  component: CheckoutPage
});

function CheckoutPage() {
  const { getSelectedItems, clearSelected } = useCartStore();
  const selectedItems = getSelectedItems();
  const variantIds = React.useMemo(() => selectedItems.map((i) => i.variantId), [selectedItems]);

  const query = useQuery({
    ...createProductVariantDetailByIdsQueryOptions({ ids: variantIds }),
    enabled: variantIds.length > 0
  });

  const navigate = useNavigate();
  const mutation = useMutation({
    ...createOrderMutationOptions(),
    onSuccess: (data) => {
      toast.success("Đặt hàng thành công!");
      clearSelected();

      const redirectUrl = data?.result;

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        navigate({ to: "/", replace: true });
      }
    }
  });

  const subtotal = React.useMemo(() => {
    if (!query.data) return 0;
    return selectedItems.reduce((acc, item) => {
      const detail = query.data.find((d) => d.id === item.variantId);
      return acc + (detail?.price || 0) * item.quantity;
    }, 0);
  }, [selectedItems, query.data]);

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
      <div className="relative container mx-auto px-4 py-16">
        <QueryBoundary
          status={variantIds.length > 0 ? query.status : "success"}
          data={query.data}
          error={query.error}
          emptyFallback={
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShoppingBag className="text-muted-foreground mb-4 size-12 opacity-20" />
              <h3 className="text-xl font-bold">Giỏ hàng trống</h3>
              <p className="text-muted-foreground mb-6">
                Vui lòng chọn sản phẩm trước khi thanh toán.
              </p>
              <Button asChild>
                <Link to="/">Tiếp tục mua sắm</Link>
              </Button>
            </div>
          }
        >
          {(details) => (
            <CheckoutForm
              details={details}
              items={selectedItems}
              subtotal={subtotal}
              isPending={mutation.isPending}
              onSubmit={(payload) => mutation.mutate(payload)}
            />
          )}
        </QueryBoundary>
      </div>
    </PageWrapper>
  );
}
