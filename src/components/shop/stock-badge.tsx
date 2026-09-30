"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase transition-colors",
  {
    variants: {
      status: {
        inStock: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
        outOfStock: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
        lowStock: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
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
      inStock: "bg-emerald-500 animate-pulse",
      outOfStock: "bg-red-500",
      lowStock: "bg-amber-500 animate-bounce"
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
      <span className={cn(dotVariants({ status }))} />
      {label}
    </div>
  );
}
