"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase transition-colors",
  {
    variants: {
      status: {
        inStock: "bg-success/10 text-success",
        outOfStock: "bg-sale/10 text-sale",
        lowStock: "bg-warning/10 text-warning"
      }
    },
    defaultVariants: {
      status: "inStock"
    }
  }
);

const dotVariants = cva("h-1.5 w-1.5 rounded-full", {
  variants: {
    status: {
      inStock: "bg-success motion-safe:animate-pulse",
      outOfStock: "bg-sale",
      lowStock: "bg-warning motion-safe:animate-bounce"
    }
  },
  defaultVariants: {
    status: "inStock"
  }
});

export interface StockBadgeProps extends VariantProps<typeof badgeVariants> {
  className?: string;
  count?: number;
}

export function StockBadge({ status, className, count }: StockBadgeProps) {
  const label = {
    inStock: "Còn hàng",
    outOfStock: "Hết hàng",
    lowStock: count ? `Chỉ còn ${count}` : "Sắp hết hàng"
  }[status ?? "inStock"];

  return (
    <div className={cn(badgeVariants({ status }), className)}>
      <span aria-hidden="true" className={cn(dotVariants({ status }))} />
      {label}
    </div>
  );
}
