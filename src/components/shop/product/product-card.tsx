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
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createAddToWishlistMutationOptions,
  createRemoveFromWishlistMutationOptions,
  createWishlistQueryOptions
} from "@/lib/tanstack/options/wishlist";
import { RatingBadge } from "@/components/shop/rating";

/**
 * Variants for the ProductCard to allow reusability in different layouts
 */
const productCardVariants = cva(
  // has-[…]: the stretched title link is the single tab stop; ring the whole card when it is focused.
  "group relative flex w-full flex-col gap-3 rounded-2xl transition-shadow has-[[data-card-link]:focus-visible]:ring-2 has-[[data-card-link]:focus-visible]:ring-ring/60 has-[[data-card-link]:focus-visible]:ring-offset-4 has-[[data-card-link]:focus-visible]:ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        bordered: "bg-card text-card-foreground border border-border p-2 pb-3 hover:shadow-md",
        ghost: "bg-transparent"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

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

    const hasRating = (product.avgRating ?? 0) > 0;
    const hasPicker = showVariantPicker && product.attributes && product.attributes.length > 0;

    return (
      <TooltipProvider delayDuration={200}>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px", amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          className={cn(productCardVariants({ variant, className }))}
          {...props}
        >
          {/* Media */}
          <div className="bg-muted ring-border/60 relative overflow-hidden rounded-xl ring-1 sm:rounded-2xl">
            <AspectRatio ratio={4 / 5}>
              <ImageWithFallback
                src={product.thumbnail || undefined}
                alt={product.name}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100",
                  isOutOfStock && "opacity-70 grayscale-[35%]"
                )}
              />
            </AspectRatio>

            {/* Status badges (decorative layer, never intercepts clicks) */}
            <div className="pointer-events-none absolute top-2 left-2 z-20 flex flex-col items-start gap-1.5 sm:top-3 sm:left-3">
              {isOutOfStock ? (
                <span className="bg-background/90 text-foreground rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase shadow-sm backdrop-blur-md">
                  Hết hàng
                </span>
              ) : (
                hasDiscount && (
                  <DiscountBadge
                    percentage={discountPercent}
                    variant="solid"
                    size="md"
                    shape="rounded"
                    className="shadow-sm"
                  />
                )
              )}
              {hasRating && (
                <RatingBadge
                  rating={product.avgRating ?? 0}
                  variant="star"
                  size="sm"
                  shape="rounded"
                />
              )}
            </div>

            {/* Quick actions: always visible on touch, revealed on hover/focus for fine pointers */}
            <div className="absolute top-2 right-2 z-30 flex flex-col gap-2 sm:top-3 sm:right-3">
              <ProductActionIcon
                icon={
                  <Heart
                    className={cn(
                      "size-4 transition-colors",
                      isFavorited ? "fill-sale text-sale" : "text-foreground"
                    )}
                  />
                }
                label={`${isFavorited ? "Bỏ yêu thích" : "Thêm vào yêu thích"}: ${product.name}`}
                tooltip={isFavorited ? "Bỏ yêu thích" : "Yêu thích"}
                pressed={isFavorited}
                onClick={handleToggleWishlist}
                disabled={isWishlistPending}
              />
              <ProductActionIcon
                icon={<ShoppingCart className="size-4" />}
                label={`Thêm vào giỏ hàng: ${product.name}`}
                tooltip={canBuy ? "Thêm vào giỏ hàng" : "Hết hàng"}
                onClick={handleAddToCart}
                disabled={!canBuy}
                revealOnHover
              />
              <ProductActionIcon
                icon={<Eye className="size-4" />}
                label={`Xem nhanh: ${product.name}`}
                tooltip="Xem nhanh"
                onClick={() => setSelectedId(product.id)}
                revealOnHover
              />
            </div>

            {/* Slide-up panel — fine pointers only; keyboard focus also reveals it */}
            <div className="absolute inset-x-0 bottom-0 z-30 hidden translate-y-full p-2 transition-transform duration-300 ease-out motion-reduce:transition-none sm:p-3 pointer-fine:block pointer-fine:group-focus-within:translate-y-0 pointer-fine:group-hover:translate-y-0">
              <div className="bg-background/90 border-border/60 space-y-3 rounded-xl border p-2.5 shadow-lg backdrop-blur-md">
                {hasPicker && (
                  <div className="space-y-2">
                    {product.attributes.map((attr) => (
                      <VariantPicker
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
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!canBuy}
                  whileTap={{ scale: 0.97 }}
                  aria-label={`Mua ngay: ${product.name}`}
                  className="h-10 w-full rounded-lg text-xs font-semibold tracking-[0.12em] uppercase"
                >
                  <Zap aria-hidden="true" className="size-3.5 fill-current" />
                  {isOutOfStock ? "Hết hàng" : "Mua ngay"}
                </MotionButton>
              </div>
            </div>
          </div>

          {/* Content — the title link is stretched over the whole card (single tab stop) */}
          <div className="flex flex-col gap-1.5 px-1">
            {product.categoryName && (
              <p className="text-muted-foreground truncate text-[11px] font-medium tracking-[0.14em] uppercase">
                {product.categoryName}
              </p>
            )}

            <h3 className="text-foreground line-clamp-2 min-h-[2lh] text-sm leading-snug font-medium sm:text-base">
              <Link
                to="/product/$id"
                params={{ id: String(product.id) }}
                data-card-link=""
                className="decoration-foreground/40 underline-offset-4 outline-none group-hover:underline before:absolute before:inset-0 before:z-10 before:rounded-2xl before:content-['']"
              >
                {product.name}
              </Link>
            </h3>

            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <Price
                value={currentPrice}
                size="md"
                variant={hasDiscount ? "discount" : "default"}
                className="sm:text-lg"
              />
              {hasDiscount && (
                <Price value={originalPrice} variant="original" size="xs" className="sm:text-sm" />
              )}
            </div>
          </div>
        </motion.div>
      </TooltipProvider>
    );
  }
);
ProductCard.displayName = "ProductCard";

interface ProductActionIconProps {
  icon: React.ReactNode;
  /** Accessible name — include the product name so screen-reader users know the target. */
  label: string;
  tooltip: string;
  onClick?: () => void;
  disabled?: boolean;
  pressed?: boolean;
  /** Hide until card hover/focus on fine-pointer devices; touch devices always see it. */
  revealOnHover?: boolean;
}

function ProductActionIcon({
  icon,
  label,
  disabled,
  tooltip,
  pressed,
  onClick,
  revealOnHover
}: ProductActionIconProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          disabled={disabled}
          aria-label={label}
          aria-pressed={pressed}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick?.();
          }}
          className={cn(
            "bg-background/90 text-foreground hover:bg-primary hover:text-primary-foreground focus-visible:ring-ring/60 size-9 rounded-full border-none shadow-md backdrop-blur-sm transition-all duration-200 active:scale-95 disabled:opacity-40 sm:size-10 [&:hover_svg]:text-current",
            revealOnHover &&
              "motion-reduce:translate-x-0 pointer-fine:translate-x-2 pointer-fine:opacity-0 pointer-fine:group-focus-within:translate-x-0 pointer-fine:group-focus-within:opacity-100 pointer-fine:group-hover:translate-x-0 pointer-fine:group-hover:opacity-100"
          )}
        >
          <span aria-hidden="true" className="contents">
            {icon}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left" className="text-xs font-medium">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

export { ProductCard, productCardVariants };
