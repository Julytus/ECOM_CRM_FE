"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Heart, ShieldCheck, ShoppingCart, Truck, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";
import { useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ActionGroup } from "@/components/shop/action-group";
import { InfoFeature } from "@/components/shop/product/info-feature";
import { ImageGallery } from "@/components/image/image-gallery";
import { ProductHeader } from "@/components/shop/product/product-header";
import { SizeGuide } from "@/components/shop/product/size-guide";
import { VariantPicker } from "@/components/shop/product/variant-picker";
import { QuantityInput } from "@/components/shop/quantity-input";
import { ProductPriceDisplay } from "@/components/shop/product/product-price-display";
import { MotionButton } from "@/components/motion-ui";
import { useIsMobile } from "@/hooks/use-mobile";
import { normalizeImages } from "@/lib/format";
import { createProductDetailsQueryOptions } from "@/lib/tanstack/options/product";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/stores/cart";
import {
  createAddToWishlistMutationOptions,
  createRemoveFromWishlistMutationOptions,
  createWishlistQueryOptions
} from "@/lib/tanstack/options/wishlist";
import { toast } from "sonner";

type QuickViewSheetProps = {
  productId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function QuickViewSheet({ productId, open, onOpenChange }: QuickViewSheetProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);

  const { data: product, isLoading } = useQuery({
    ...createProductDetailsQueryOptions({ id: productId || "" }),
    enabled: Boolean(productId) && open
  });

  const { data: wishlist } = useQuery(createWishlistQueryOptions());
  const addToWishList = useMutation(createAddToWishlistMutationOptions());
  const removeFromWishList = useMutation(createRemoveFromWishlistMutationOptions());

  const [selectedOptions, setSelectedOptions] = React.useState<Record<string, string>>({});
  const [quantity, setQuantity] = React.useState(1);

  React.useEffect(() => {
    if (!product) return;

    const initial: Record<string, string> = {};
    for (const attribute of product.attributes ?? []) {
      initial[attribute.fieldName] = attribute.options?.[0]?.value ?? "";
    }
    setSelectedOptions(initial);
    setQuantity(1);
  }, [product?.id]);

  // Match by fieldName first, then attribute name for compatibility with older API responses.
  const activeVariant = React.useMemo(() => {
    if (!product) return undefined;
    return product.variants?.find((variant) =>
      (product.attributes ?? []).every((attribute) => {
        const selectedValue = selectedOptions[attribute.fieldName];
        const variantValue =
          variant.options?.[attribute.fieldName] ?? variant.options?.[attribute.name];
        return selectedValue !== undefined && variantValue === selectedValue;
      })
    );
  }, [product, selectedOptions]);

  React.useEffect(() => {
    const stock = activeVariant?.stock ?? 0;
    setQuantity((current) => (stock > 0 ? Math.min(Math.max(current, 1), stock) : 1));
  }, [activeVariant?.id, activeVariant?.stock]);

  const images = React.useMemo(() => {
    if (!product) return [];
    const urls = [
      activeVariant?.image,
      product.thumbnail,
      ...normalizeImages(product.image),
      ...(product.variants ?? []).map((variant) => variant.image)
    ];
    return [
      ...new Set(
        urls.filter((url): url is string => typeof url === "string" && url.trim().length > 0)
      )
    ];
  }, [product, activeVariant?.id, activeVariant?.image]);

  const isOutOfStock =
    !product?.variants?.length || product.variants.every((variant) => variant.stock <= 0);
  const isVariantOutOfStock = (activeVariant?.stock ?? 0) <= 0;
  const canBuy = Boolean(activeVariant && !isOutOfStock && !isVariantOutOfStock);
  const isFavorited = wishlist?.some((item) => item.productId === productId) ?? false;

  const handleToggleWishlist = () => {
    if (!product?.id) return;
    if (isFavorited) removeFromWishList.mutate({ productId: product.id });
    else addToWishList.mutate({ productId: product.id });
  };

  const handleBuyNow = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!activeVariant || !canBuy) return;
    addToCart(activeVariant.productId, activeVariant.id, 1, activeVariant.stock);
    navigate({ to: "/checkout" });
  };

  const handleAddToCart = () => {
    if (!activeVariant || !canBuy) return;
    addToCart(activeVariant.productId, activeVariant.id, quantity, activeVariant.stock);
    toast.success("Đã thêm sản phẩm vào giỏ hàng");
  };

  if (!productId) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col border-l-0 p-0 sm:max-w-4xl">
        <SheetHeader className="sr-only">
          <SheetTitle>{product?.name ?? "Chi tiết sản phẩm"}</SheetTitle>
        </SheetHeader>

        <AnimatePresence mode="wait">
          {isLoading || !product ? (
            <QuickViewSkeleton key="skeleton" />
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full min-h-0 flex-col overflow-hidden md:flex-row"
            >
              <ImageGallery
                key={`variant-gallery-${activeVariant?.id ?? "none"}`}
                layout={!isMobile ? "editorial" : "responsive"}
                images={images}
                scrollbarPosition="right"
                className="h-[45vh] w-full shrink-0 md:h-full md:w-[40%] lg:w-[35%]"
              />

              <div className="bg-background flex min-h-0 w-full flex-1 flex-col py-6 md:py-0">
                <ScrollArea className="h-full w-full">
                  <div className="flex flex-col p-6 sm:p-8 lg:p-12">
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <ProductHeader
                          brand="OAKLYN"
                          name={product.name}
                          rating={product.avgRating ?? 0}
                          reviewCount={124}
                          status={isOutOfStock ? "outOfStock" : "inStock"}
                        />
                        <ProductPriceDisplay
                          currentPrice={activeVariant?.price ?? 0}
                          originalPrice={activeVariant?.originalPrice}
                        />
                        {activeVariant ? (
                          <p
                            className={cn(
                              "text-sm font-medium",
                              activeVariant.stock > 0 ? "text-emerald-700" : "text-red-600"
                            )}
                          >
                            {activeVariant.stock > 0
                              ? `Còn ${activeVariant.stock} sản phẩm`
                              : "Sản phẩm này đã hết hàng"}
                          </p>
                        ) : (
                          <p className="text-muted-foreground text-sm">
                            Chọn đầy đủ thuộc tính để xem biến thể, ảnh và tồn kho.
                          </p>
                        )}
                        {product.description && (
                          <p className="max-w-prose text-sm leading-relaxed text-neutral-500">
                            {product.description}
                          </p>
                        )}
                      </div>

                      <Separator className="bg-neutral-100" />

                      {/* Render every dynamic attribute; do not restrict to color/size. */}
                      <div className="space-y-6">
                        {(product.attributes ?? []).map((attribute) => {
                          const normalizedName =
                            `${attribute.fieldName} ${attribute.name}`.toLowerCase();
                          const isColor = /color/.test(normalizedName);
                          const isSize = /size|kích cỡ|kich co/.test(normalizedName);

                          return (
                            <VariantPicker
                              key={attribute.id}
                              label={attribute.name}
                              variant={isColor ? "swatch" : "button"}
                              value={selectedOptions[attribute.fieldName] ?? ""}
                              options={attribute.options ?? []}
                              onChange={(value) => {
                                setSelectedOptions((previous) => ({
                                  ...previous,
                                  [attribute.fieldName]: value
                                }));
                              }}
                              renderHeaderRight={isSize ? <SizeGuide /> : undefined}
                            />
                          );
                        })}

                        <QuantityInput
                          value={quantity}
                          onQuantityChange={(value) => {
                            const stock = activeVariant?.stock ?? 0;
                            setQuantity(Math.max(1, Math.min(value, stock || 1)));
                          }}
                          maxStock={activeVariant?.stock ?? 0}
                          className="py-2"
                          roundness="lg"
                        />
                      </div>

                      <div className="space-y-4 pt-4 pb-8">
                        <ActionGroup layout="split">
                          <MotionButton
                            onClick={handleAddToCart}
                            disabled={!canBuy}
                            whileTap={{ scale: 0.95 }}
                            className="flex h-12 w-full items-center justify-center rounded-xl text-[10px] font-bold tracking-widest uppercase"
                          >
                            <ShoppingCart className="mr-2 size-3" />
                            Thêm vào giỏ hàng
                          </MotionButton>
                          <MotionButton
                            onClick={handleBuyNow}
                            disabled={!canBuy}
                            variant="outline"
                            whileTap={{ scale: 0.95 }}
                            className="flex h-12 w-full items-center justify-center rounded-xl text-[10px] font-bold tracking-widest uppercase"
                          >
                            <Zap className="mr-2 size-3" />
                            Mua ngay
                          </MotionButton>
                        </ActionGroup>

                        <Button
                          onClick={handleToggleWishlist}
                          variant="ghost"
                          className="group w-full text-[9px] font-bold tracking-widest uppercase transition-colors"
                        >
                          <Heart
                            className={cn(
                              "mr-2 size-3 transition-colors",
                              isFavorited
                                ? "fill-red-500 text-red-500"
                                : "group-hover:fill-red-500 group-hover:text-red-500"
                            )}
                          />
                          {isFavorited ? "Đã yêu thích" : "Thêm vào yêu thích"}
                        </Button>

                        <Separator className="bg-neutral-100" />
                        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-6">
                          <InfoFeature
                            icon={ShieldCheck}
                            theme="emerald"
                            title="An toàn"
                            subtitle="Bảo mật 100%"
                          />
                          <InfoFeature
                            icon={Truck}
                            theme="blue"
                            title="Giao hàng"
                            subtitle="Từ 2-3 ngày"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}

function QuickViewSkeleton() {
  return (
    <div className="flex h-full animate-pulse flex-col md:flex-row">
      <div className="h-1/2 w-full bg-neutral-100 md:h-full md:w-[55%]" />
      <div className="flex w-full flex-col space-y-8 p-10 md:w-[45%]">
        <div className="space-y-4">
          <div className="h-4 w-24 rounded bg-neutral-100" />
          <div className="h-10 w-full rounded bg-neutral-100" />
        </div>
        <div className="flex-1 space-y-10 pt-10">
          <div className="h-24 w-full rounded-3xl bg-neutral-50" />
          <div className="h-24 w-full rounded-3xl bg-neutral-50" />
        </div>
        <div className="h-14 w-full rounded-full bg-neutral-100" />
      </div>
    </div>
  );
}
