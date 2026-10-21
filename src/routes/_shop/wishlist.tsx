"use client";

import * as React from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";

import { PageWrapper } from "@/components/layout/page-warper";
import {
  ProductGridSection,
  ProductGridSkeleton
} from "@/components/layout/product/products-section";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";

import { createWishlistQueryOptions } from "@/lib/tanstack/options/wishlist";
import { createInfiniteProductDetailsQueryOptions } from "@/lib/tanstack/options/product";

export const Route = createFileRoute("/_shop/wishlist")({
  component: WishlistPage
});

function WishlistPage() {
  const { data: wishlist, isLoading: isWishlistLoading } = useQuery(createWishlistQueryOptions());

  const wishlistIds = React.useMemo(
    () => wishlist?.map((item) => item.productId) ?? [],
    [wishlist]
  );

  const {
    data: productsPages,
    status,
    error,
    refetch
  } = useInfiniteQuery({
    ...createInfiniteProductDetailsQueryOptions({
      opts: { ids: wishlistIds, active: 1 }
    }),
    enabled: wishlistIds.length > 0
  });

  const products = React.useMemo(() => {
    return productsPages?.pages.flatMap((page) => page.items) ?? [];
  }, [productsPages]);

  return (
    <PageWrapper
      title="Danh sách yêu thích"
      image="/page-title/page-title-2.jpg"
      breadcrumbItems={[{ label: "Trang chủ", href: "/" }, { label: "Sản phẩm yêu thích" }]}
    >
      <div className="container mx-auto px-4 py-10 sm:px-6 md:px-12 md:py-14 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-border mb-8 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between md:mb-10 md:pb-8"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="bg-sale/10 text-sale flex size-9 items-center justify-center rounded-full">
                <Heart aria-hidden="true" className="size-4 fill-current" />
              </span>
              <h2 className="font-display text-foreground text-2xl font-semibold tracking-tight md:text-3xl">
                Bộ sưu tập của bạn
              </h2>
            </div>
            <p className="text-muted-foreground text-sm">
              Những món đồ bạn đã lưu lại — sẵn sàng khi bạn quay lại.
            </p>
          </div>
          {wishlistIds.length > 0 && (
            <p className="text-muted-foreground text-sm" aria-live="polite">
              <span className="text-foreground font-semibold tabular-nums">
                {wishlistIds.length}
              </span>{" "}
              sản phẩm
            </p>
          )}
        </motion.div>

        <ProductGridSection
          title=""
          products={wishlistIds.length === 0 ? [] : products}
          status={isWishlistLoading ? "loading" : wishlistIds.length === 0 ? "success" : status}
          error={error}
          onRetry={refetch}
          className="my-0 px-0 sm:px-0 md:px-0 lg:px-0 xl:px-0"
          loadingFallback={<ProductGridSkeleton count={4} />}
          emptyFallback={<WishlistEmptyState />}
        />
      </div>
    </PageWrapper>
  );
}

function WishlistEmptyState() {
  return (
    <Empty className="animate-in fade-in zoom-in-95 border-border rounded-2xl border border-dashed py-16 duration-500 motion-reduce:animate-none md:py-20">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-muted size-14 rounded-full">
          <Heart aria-hidden="true" className="text-muted-foreground size-6" />
        </EmptyMedia>
        <EmptyTitle className="font-display text-foreground mt-4 text-2xl font-semibold">
          Danh sách trống
        </EmptyTitle>
        <EmptyDescription className="text-muted-foreground mx-auto max-w-md">
          Nhấn biểu tượng trái tim trên sản phẩm để lưu lại những món đồ bạn yêu thích.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild size="lg" className="h-11 rounded-full px-8">
          <Link to="/search">
            <ShoppingBag aria-hidden="true" className="size-4" />
            Bắt đầu mua sắm
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
