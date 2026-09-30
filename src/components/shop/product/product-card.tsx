"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { Eye, Heart, ShoppingCart, Zap } from "lucide-react";
import { useAtom } from "jotai";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { ImageWithFallback } from "@/components/image/image-with-fallback";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { DiscountBadge, Price } from "@/components/shop/price";
import { VariantPicker } from "@/components/shop/product/variant-picker";
import { MotionButton } from "@/components/motion-ui";

import { useCartStore } from "@/lib/stores/cart";
import { quickViewProductIdAtom } from "@/lib/atom/quickview";
import type { ProductDetailsDTO } from "@/lib/types/product";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAddToWishlistMutationOptions,
  createRemoveFromWishlistMutationOptions,
  createWishlistQueryOptions
} from "@/lib/tanstack/options/wishlist";
import { toast } from "sonner";
import { RatingBadge } from "@/components/shop/rating";

/**
 * Variants for the ProductCard to allow reusability in different layouts
 */
const productCardVariants = cva("group bg-background relative flex w-full flex-col", {
  variants: {
    variant: {
      default: "border-none",
      bordered: "border rounded-2xl p-2",
      ghost: "bg-transparent"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

interface ProductCardProps
  extends HTMLMotionProps<"div">, VariantProps<typeof productCardVariants> {
  product: ProductDetailsDTO;
  showVariantPicker?: boolean;
}

const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  ({ product, className, variant, showVariantPicker = true, ...props }, ref) => {
    const [, setSelectedId] = useAtom(quickViewProductIdAtom);
    const addToCart = useCartStore((s) => s.addToCart);

    // --- Logic State ---
    const currentPrice = product?.minPrice || 0;
    const originalPrice = product?.originalMinPrice || 0;

    const [selectedOptions, setSelectedOptions] = React.useState<Record<string, string>>(() => {
      const firstVariant = product.variants?.[0];
      return firstVariant ? { ...firstVariant.options } : {};
    });

    const activeVariant = React.useMemo(() => {
      return product.variants.find((v) =>
        Object.entries(selectedOptions).every(([key, value]) => v.options[key] === value)
      );
    }, [selectedOptions, product]);

    const isOutOfStock =
      !product?.variants ||
      product.variants.length === 0 ||
      product.variants.every((v) => v.stock <= 0);

    const isVariantOutOfStock = (activeVariant?.stock ?? 0) <= 0;
    const canBuy = !isOutOfStock && !isVariantOutOfStock && !!activeVariant;

    const discountPercent =
      originalPrice && originalPrice > currentPrice
        ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
        : 0;
    const hasDiscount = discountPercent > 0;

    const { data: wishlist } = useQuery(createWishlistQueryOptions());

    const isFavorited = wishlist?.some((item) => item.productId === product.id) ?? false;

    const addToWishList = useMutation({
      ...createAddToWishlistMutationOptions()
    });

    const removeFromWishList = useMutation({
      ...createRemoveFromWishlistMutationOptions()
    });

    const isWishlistPending = addToWishList.isPending || removeFromWishList.isPending;

    const handleToggleWishlist = () => {
      if (isWishlistPending) return;

      if (isFavorited) {
        removeFromWishList.mutate({ productId: product.id });
      } else {
        addToWishList.mutate({ productId: product.id });
      }
    };

    const handleAddToCart = () => {
      if (!canBuy) return;
      addToCart(activeVariant.productId, activeVariant.id, 1, activeVariant.stock);
    };

    const navigate = useNavigate();

    const handleBuyNow = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!canBuy) return;
      addToCart(activeVariant.productId, activeVariant.id, 1, activeVariant.stock);
      navigate({ to: "/checkout" });
    };

    return (
      <TooltipProvider delayDuration={0}>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px", amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          className={cn(productCardVariants({ variant, className }))}
          {...props}
        >
          {/* Media Section */}
          <div className="bg-secondary/10 relative overflow-hidden rounded-xl sm:rounded-2xl">
            <AspectRatio ratio={4 / 4}>
              <ImageWithFallback
                src={product.thumbnail || undefined}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </AspectRatio>

            {/* Badges */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
              {hasDiscount && (
                <DiscountBadge
                  percentage={discountPercent}
                  variant="ghost"
                  size="sm"
                  shape="rounded"
                  className="backdrop-blur-md"
                />
              )}
              <RatingBadge
                rating={product.avgRating ?? 0}
                variant="star"
                size="sm"
                shape="rounded"
                className="backdrop-blur-md"
              />
            </div>

            {/* Quick Actions */}
            <motion.div
              className="absolute top-2 right-2 z-30 flex flex-col gap-1.5 sm:top-3 sm:right-3 sm:gap-2"
              initial="hidden"
              whileInView="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08, delayChildren: 0.1 }
                }
              }}
            >
              <ProductActionIcon
                icon={
                  <Heart
                    className={cn(
                      "size-3.5 transition-colors sm:size-4",
                      isFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground"
                    )}
                  />
                }
                tooltip={isFavorited ? "Bỏ yêu thích" : "Yêu thích"}
                onClick={handleToggleWishlist}
                disabled={isWishlistPending}
              />
              <ProductActionIcon
                icon={<ShoppingCart className="size-3.5 sm:size-4" />}
                tooltip="Thêm vào giỏ hàng"
                onClick={handleAddToCart}
                disabled={!canBuy}
              />
              <ProductActionIcon
                icon={<Eye className="size-3.5 sm:size-4" />}
                tooltip="Xem nhanh"
                onClick={() => setSelectedId(product.id)}
              />
            </motion.div>

            {/* Slide-up Interaction Overlay */}
            <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full transition-transform duration-300 ease-out group-hover:pointer-events-auto group-hover:translate-y-0">
              <div className="space-y-3 bg-transparent p-3">
                {showVariantPicker && product.attributes && product.attributes.length > 0 && (
                  <div className="space-y-2">
                    {product.attributes.map((attr) => (
                      <VariantPicker
                        context="overImage"
                        key={attr.id}
                        label={attr.name}
                        variant={attr.fieldName.toLowerCase() === "color" ? "swatch" : "button"}
                        value={selectedOptions[attr.fieldName]}
                        options={attr.options}
                        size="compact"
                        onChange={(val) =>
                          setSelectedOptions((prev) => ({ ...prev, [attr.fieldName]: val }))
                        }
                      />
                    ))}
                  </div>
                )}
                <MotionButton
                  onClick={handleBuyNow}
                  disabled={!canBuy}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-11 w-full items-center justify-center rounded-xl text-[10px] font-bold tracking-widest uppercase hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  variant="destructive"
                >
                  <Zap className="mr-2 size-3 fill-current" />
                  {isOutOfStock ? "Hết hàng" : "Mua ngay"}
                </MotionButton>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <Link to="/product/$id" params={{ id: String(product.id) }}>
            <div className="flex flex-col space-y-1.5 px-0.5 py-1 sm:space-y-2.5 sm:px-1 sm:py-2">
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-muted-foreground/60 text-[8px] font-bold tracking-[0.15em] uppercase sm:text-[10px]">
                  {product.categoryName || "Premium Collection"}
                </p>

                <h2 className="text-foreground group-hover:text-primary line-clamp-1 text-sm leading-tight font-bold tracking-tight transition-colors duration-300 sm:line-clamp-2 sm:text-base md:text-lg">
                  {product.name}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-0.5 sm:gap-2">
                <Price
                  value={currentPrice}
                  size="md"
                  variant={hasDiscount ? "discount" : "default"}
                  className="font-bold tracking-tight sm:text-lg"
                />

                {hasDiscount && (
                  <Price
                    value={originalPrice}
                    variant="original"
                    size="xs"
                    className="text-muted-foreground/40 sm:text-sm"
                  />
                )}
              </div>
            </div>
          </Link>
        </motion.div>
      </TooltipProvider>
    );
  }
);
ProductCard.displayName = "ProductCard";

/**
 * Internal Action Button Component
 */
interface ProductActionIconProps {
  icon: React.ReactNode;
  tooltip: string;
  onClick?: () => void;
  disabled?: boolean;
}

function ProductActionIcon({ icon, disabled, tooltip, onClick }: ProductActionIconProps) {
  const itemVariants = {
    hidden: { opacity: 0, x: 15 },
    show: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 260, damping: 20 }
    }
  } as const;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div variants={itemVariants}>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            disabled={disabled}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClick?.();
            }}
            className="hover:bg-primary h-7 w-7 rounded-full border-none bg-white/95 shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:cursor-pointer hover:text-white active:scale-95 sm:h-9 sm:w-9"
          >
            {icon}
          </Button>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="left" className="text-[10px] font-bold shadow-xl">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

export { ProductCard, productCardVariants };
