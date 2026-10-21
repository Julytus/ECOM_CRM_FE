"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const quantityVariants = cva(
  "flex items-center transition-all duration-300 border bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring/50",
  {
    variants: {
      size: {
        default: "h-12 w-36 shadow-xs",
        compact: "h-9 w-28",
        full: "h-12 w-full shadow-xs"
      },
      variant: {
        default: "border-border",
        ghost: "border-transparent bg-transparent shadow-none hover:bg-muted",
        outline: "border-foreground bg-transparent"
      },
      roundness: {
        none: "rounded-none",
        sm: "rounded-md",
        lg: "rounded-2xl",
        full: "rounded-full px-1"
      }
    },
    defaultVariants: {
      size: "default",
      variant: "default",
      roundness: "lg"
    }
  }
);

interface QuantityInputProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "value">,
    VariantProps<typeof quantityVariants> {
  value: number;
  onQuantityChange: (value: number) => void;
  maxStock?: number;
  showLabel?: boolean;
}

export function QuantityInput({
  value,
  onQuantityChange,
  maxStock = 99,
  size,
  variant,
  roundness,
  className,
  showLabel = true,
  ...props
}: QuantityInputProps) {
  const increment = () => value < maxStock && onQuantityChange(value + 1);
  const decrement = () => value > 1 && onQuantityChange(value - 1);

  const isOutOfStock = maxStock === 0;
  const isLowStock = maxStock > 0 && maxStock <= 5;

  return (
    <div
      className={cn("inline-flex flex-col gap-2.5", size === "full" && "w-full", className)}
      {...props}
    >
      {/* Label Row */}
      {showLabel && (
        <div className="flex items-center justify-between px-1">
          <span className="text-muted-foreground text-xs font-semibold tracking-[0.12em] uppercase">
            Số lượng
          </span>
          {isLowStock && (
            <span className="text-warning text-[11px] font-semibold tracking-wide uppercase motion-safe:animate-pulse">
              Sắp hết hàng
            </span>
          )}
        </div>
      )}

      {/* Control Main */}
      <div
        role="group"
        aria-label="Số lượng"
        className={cn(quantityVariants({ size, variant, roundness }))}
      >
        <button
          type="button"
          onClick={decrement}
          disabled={value <= 1 || isOutOfStock}
          aria-label="Giảm số lượng"
          className="text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:bg-muted flex h-full flex-1 items-center justify-center transition-colors outline-none disabled:pointer-events-none disabled:opacity-30"
        >
          <Minus aria-hidden="true" className="size-3.5" />
        </button>

        <span
          aria-live="polite"
          className={cn(
            "flex w-10 items-center justify-center text-sm font-bold tabular-nums select-none",
            isOutOfStock ? "text-muted-foreground" : "text-foreground"
          )}
        >
          {isOutOfStock ? 0 : value}
        </span>

        <button
          type="button"
          onClick={increment}
          disabled={value >= maxStock || isOutOfStock}
          aria-label="Tăng số lượng"
          className="text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:bg-muted flex h-full flex-1 items-center justify-center transition-colors outline-none disabled:pointer-events-none disabled:opacity-30"
        >
          <Plus aria-hidden="true" className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
