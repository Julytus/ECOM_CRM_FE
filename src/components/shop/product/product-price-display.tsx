"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { DiscountBadge, Price } from "@/components/shop/price";

const priceGroupVariants = cva("flex items-baseline gap-3", {
  variants: {
    layout: {
      horizontal: "flex-row items-baseline",
      vertical: "flex-col items-start gap-1"
    }
  },
  defaultVariants: {
    layout: "horizontal"
  }
});

interface ProductPriceDisplayProps extends VariantProps<typeof priceGroupVariants> {
  currentPrice: number;
  originalPrice?: number;
  className?: string;
}

export function ProductPriceDisplay({
  currentPrice,
  originalPrice,
  layout,
  className
}: ProductPriceDisplayProps) {
  const discountPercentage = React.useMemo(() => {
    if (originalPrice == null || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }, [currentPrice, originalPrice]);

  const hasDiscount = discountPercentage > 0;

  return (
    <div className={cn(priceGroupVariants({ layout }), className)}>
      <Price
        value={currentPrice}
        size={layout === "vertical" ? "lg" : "xl"}
        variant={hasDiscount ? "discount" : "hero"}
      />

      {originalPrice != null && originalPrice > currentPrice && (
        <div className="flex items-center gap-2">
          <Price value={originalPrice} variant="original" size="sm" />

          {hasDiscount && (
            <DiscountBadge percentage={discountPercentage} variant="ghost" size="md" shape="pill" />
          )}
        </div>
      )}
    </div>
  );
}
