"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, ShieldCheck, ShoppingCart, Truck, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import { Price } from "@/components/shop/price";
import { ActionGroup } from "@/components/shop/action-group";
import { InfoFeature } from "@/components/shop/product/info-feature";
import { ImageGallery } from "@/components/image/image-gallery";
import { ProductHeader } from "@/components/shop/product/product-header";
import { SizeGuide } from "@/components/shop/product/size-guide";
import { VariantPicker } from "@/components/shop/product/variant-picker";
import { QuantityInput } from "@/components/shop/quantity-input";
import { normalizeImages } from "@/lib/format";
import { createProductDetailsQueryOptions } from "@/lib/tanstack/options/product";
import { cn } from "@/lib/utils";
import { ProductPriceDisplay } from "@/components/shop/product/product-price-display";
import { useCartStore } from "@/lib/stores/cart";
import { MotionButton } from "@/components/motion-ui";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  createAddToWishlistMutationOptions,
  createRemoveFromWishlistMutationOptions,
  createWishlistQueryOptions
} from "@/lib/tanstack/options/wishlist";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

interface QuickViewSheetProps {
  productId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickViewSheet({ productId, open, onOpenChange }: QuickViewSheetProps) {
  const isMobile = useIsMobile();
  const { data: product, isLoading } = useQuery({
    ...createProductDetailsQueryOptions({ id: productId || "" }),
    enabled: !!productId && open
  });

  const { data: wishlist } = useQuery(createWishlistQueryOptions());

  const queryClient = useQueryClient();

  const addToWishList = useMutation({
    ...createAddToWishlistMutationOptions()
  });

  const removeFromWishList = useMutation({
    ...createRemoveFromWishlistMutationOptions()
  });

  const [selectedOptions, setSelectedOptions] = React.useState<Record<string, string>>({});
  const [quantity, setQuantity] = React.useState(1);

  React.useEffect(() => {
    if (product) {
      const initial: Record<string, string> = {};
      product.attributes.forEach((attr) => {
        initial[attr.fieldName] = attr.options[0]?.value || "";
      });
      setSelectedOptions(initial);
      setQuantity(1);
    }
  }, [product]);

  const activeVariant = React.useMemo(() => {
    if (!product) return null;
    return product.variants.find((v) =>
      Object.entries(selectedOptions).every(([key, value]) => v.options[key] === value)
    );
  }, [selectedOptions, product]);

  React.useEffect(() => {
    setQuantity(1);
    console.log(activeVariant);
  }, [activeVariant, selectedOptions]);

  const currentPrice = activeVariant?.price ?? 0;
  const originalPrice = activeVariant?.originalPrice;

  const isOutOfStock =
    !product?.variants ||
    product.variants.length === 0 ||
    product.variants.every((v) => v.stock <= 0);

  const isVariantOutOfStock = (activeVariant?.stock ?? 0) <= 0;

  const images: string[] = Array.from(
    [product?.thumbnail, ...normalizeImages(product?.image)].filter(
      (img): img is string => typeof img === "string" && img.length > 0
    )
  );

  const isFavorited = wishlist?.some((item) => item.productId === productId) ?? false;

  const canBuy = !isOutOfStock && !isVariantOutOfStock && !!activeVariant;

  const handleToggleWishlist = () => {
    if (!product?.id) return;

    if (isFavorited) {
      removeFromWishList.mutate({ productId: product.id });
    } else {
      addToWishList.mutate({ productId: product.id });
    }
  };

  const navigate = useNavigate();

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canBuy) return;
    addToCart(activeVariant.productId, activeVariant.id, 1, activeVariant.stock);
    navigate({ to: "/checkout" });
  };

  const addToCart = useCartStore((s) => s.addToCart);

  const handleAddToCart = () => {
    if (!canBuy) return;
    addToCart(activeVariant.productId, activeVariant.id, quantity, activeVariant.stock);
  };

  if (!productId) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col border-l-0 p-0 sm:max-w-4xl">
        <SheetHeader className="sr-only">
          <SheetTitle>{product?.name}</SheetTitle>
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
              className="flex h-full flex-col overflow-hidden md:flex-row"
            >
              <ImageGallery
                layout={!isMobile ? "editorial" : "responsive"}
                images={images}
                scrollbarPosition="right"
                className="h-[45vh] w-full shrink-0 md:h-full md:w-[40%] lg:w-[35%]"
              />

              {/* RIGHT: Sophisticated Details */}
              <div className="bg-background flex min-h-0 w-full flex-1 flex-col py-6 md:py-0">
                <ScrollArea className="h-full w-full">
                  <div className="flex flex-col p-6 sm:p-8 lg:p-12">
                    <div className="space-y-8">
                      {/* Header Section */}
                      <div className="space-y-4">
                        <ProductHeader
                          brand="OAKLYN"
                          name={product.name}
                          rating={product.avgRating ?? 0}
                          reviewCount={124}
                          status={isOutOfStock ? "outOfStock" : "inStock"}
                        />

                        <ProductPriceDisplay
                          currentPrice={currentPrice}
                          originalPrice={originalPrice}
                        />

                        <p className="max-w-prose text-sm leading-relaxed text-neutral-500">
                          {product.description}
                        </p>
                      </div>

                      <Separator className="bg-neutral-100" />

                      {/* Configuration Section */}
                      <div className="space-y-6">
                        {product.attributes.map((attr) => {
                          const fieldName = attr.fieldName.toLowerCase();
                          if (fieldName !== "color" && fieldName !== "size") return null;

                          return (
                            <VariantPicker
                              key={attr.id}
                              label={attr.name}
                              variant={fieldName === "color" ? "swatch" : "button"}
                              value={selectedOptions[attr.fieldName]}
                              options={attr.options}
                              onChange={(val) =>
                                setSelectedOptions((prev) => ({ ...prev, [attr.fieldName]: val }))
                              }
                              renderHeaderRight={fieldName === "size" && <SizeGuide />}
                            />
                          );
                        })}

                        <QuantityInput
                          value={quantity}
                          onQuantityChange={setQuantity}
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
                          className={cn(
                            "group w-full text-[9px] font-bold tracking-widest uppercase transition-colors",

                            isFavorited ? "text-red-500" : "text-neutral-400 hover:text-black"
                          )}
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
