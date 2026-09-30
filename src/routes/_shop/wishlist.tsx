"use client";

import * as React from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Heart, ShoppingBag, Loader2 } from "lucide-react";
import { motion } from "motion/react";

import { PageWrapper } from "@/components/layout/page-warper";
import { ProductGridSection } from "@/components/layout/product/products-section";
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
      <div className="bg-background container mx-auto px-4 py-12 md:px-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col gap-2 border-b pb-8"
        >
          <div className="flex items-center gap-3">
            <Heart className="text-primary fill-primary h-5 w-5" />
            <h2 className="text-foreground text-2xl font-light tracking-[0.2em] uppercase">
              Bộ sưu tập của bạn
            </h2>
          </div>
          <p className="text-muted-foreground text-sm font-light italic">
            Khám phá lại những món đồ nội thất tâm đắc.
          </p>
        </motion.div>

        <ProductGridSection
          title=""
          products={wishlistIds.length === 0 ? [] : products}
          status={isWishlistLoading ? "loading" : wishlistIds.length === 0 ? "success" : status}
          error={error}
          onRetry={refetch}
          className="my-0 px-0"
          loadingFallback={<WishlistLoadingSkeleton />}
          emptyFallback={<WishlistEmptyState />}
        />
      </div>
    </PageWrapper>
  );
}

function WishlistLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="bg-muted/50 aspect-[4/5] w-full animate-pulse rounded-md" />
          <div className="space-y-2">
            <div className="bg-muted h-4 w-2/3 animate-pulse rounded" />
            <div className="bg-muted/60 h-3 w-1/2 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** * Luxury Empty State
 */
function WishlistEmptyState() {
  return (
    <Empty className="animate-in fade-in zoom-in py-20 duration-500">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-secondary/40">
          <Heart className="text-muted-foreground/40 h-10 w-10" />
        </EmptyMedia>
        <EmptyTitle className="text-foreground mt-6 text-2xl font-light tracking-widest uppercase">
          Danh sách trống
        </EmptyTitle>
        <EmptyDescription className="text-muted-foreground mx-auto max-w-md font-light italic">
          Lưu giữ những món đồ nội thất tinh tế để hoàn thiện không gian sống đẳng cấp của bạn.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          asChild
          className="bg-primary text-primary-foreground h-12 rounded-md px-10 text-[10px] font-bold tracking-[0.2em] uppercase hover:opacity-90"
        >
          <a href="/search">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Bắt đầu mua sắm
          </a>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
