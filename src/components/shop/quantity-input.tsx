"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const quantityVariants = cva(
  "flex items-center transition-all duration-300 border bg-white overflow-hidden",
  {
    variants: {
      size: {
        default: "h-12 w-36 shadow-sm",
        compact: "h-9 w-28",
        full: "h-12 w-full shadow-sm"
      },
      variant: {
        default: "border-neutral-200",
        ghost: "border-transparent bg-transparent shadow-none hover:bg-neutral-50",
        outline: "border-neutral-800 bg-transparent"
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
          <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-900 uppercase">
            Số lượng
          </span>
          {isLowStock && (
            <span className="animate-pulse text-[9px] font-bold tracking-widest text-amber-600 uppercase">
              Sắp hết hàng
            </span>
          )}
        </div>
      )}

      {/* Control Main */}
      <div className={cn(quantityVariants({ size, variant, roundness }))}>
        <button
          type="button"
          onClick={decrement}
          disabled={value <= 1 || isOutOfStock}
          className="flex h-full flex-1 items-center justify-center text-neutral-400 transition-colors hover:text-black disabled:opacity-20"
        >
          <Minus className="size-3.5" />
        </button>

        <span
          className={cn(
            "flex w-10 items-center justify-center text-sm font-bold select-none",
            isOutOfStock ? "text-neutral-300" : "text-neutral-900"
          )}
        >
          {isOutOfStock ? 0 : value}
        </span>

        <button
          type="button"
          onClick={increment}
          disabled={value >= maxStock || isOutOfStock}
          className="flex h-full flex-1 items-center justify-center text-neutral-400 transition-colors hover:text-black disabled:opacity-20"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
