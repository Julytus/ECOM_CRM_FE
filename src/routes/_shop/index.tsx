import { FeaturesSection } from "@/components/layout/features";
import HeroCarousel from "@/components/layout/hero";
import { InstagramSection } from "@/components/layout/instagram";
import { LookbookSection } from "@/components/layout/product/lookbook";
import { ProductGridSection } from "@/components/layout/product/products-section";
import { Separator } from "@/components/ui/separator";
import { createInfiniteProductDetailsQueryOptions } from "@/lib/tanstack/options/product";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { LazyMount } from "@/components/lazy";

export const Route = createFileRoute("/_shop/")({
  component: ShopHomePage
});

export default function ShopHomePage() {
  const naviagate = useNavigate();
  const {
    data: productsPages,
    status,
    error,
    refetch
  } = useInfiniteQuery({
    ...createInfiniteProductDetailsQueryOptions({ opts: {} })
  });

  const products = useMemo(() => {
    return productsPages?.pages.flatMap((page) => page.items) ?? [];
  }, [productsPages]);

  return (
    <>
      <HeroCarousel />
      <Separator />
      <LazyMount>
        <ProductGridSection
          title="Gợi Ý Dành Riêng Cho Bạn"
          subtitle="Những phong cách mới nhất giúp bạn nâng tầm diện mạo mỗi ngày"
          products={products}
          status={status}
          error={error}
          onRetry={refetch}
          limit={8}
          spacing="large"
          // showVariantPicker={true}
        />
      </LazyMount>
      <LazyMount>
        <LookbookSection />
      </LazyMount>
      <Separator />
      <LazyMount>
        <ProductGridSection
          title="Sản Phẩm Bán Chạy Nhất"
          subtitle="Những mẫu mới nhất đang được yêu thích hiện nay"
          products={products}
          status={status}
          error={error}
          onRetry={refetch}
          viewAllText="Xem Tất Cả Sản Phẩm"
          onViewAllClick={() => naviagate({ to: "/search" })}
          limit={8}
          spacing="large"
        />
      </LazyMount>
      <Separator />
      <LazyMount>
        <InstagramSection />
      </LazyMount>
      <FeaturesSection />
      <Separator />
    </>
  );
}
