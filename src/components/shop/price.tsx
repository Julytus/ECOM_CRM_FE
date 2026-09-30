import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { formatVnd } from "@/lib/format";

const priceVariants = cva("inline-flex items-baseline font-sans", {
  variants: {
    variant: {
      default: "text-neutral-900 font-semibold",
      muted: "text-muted-foreground",
      original: "text-neutral-400 line-through font-normal decoration-neutral-300",
      discount: "text-red-600 font-bold",
      hero: "text-3xl font-medium tracking-tight text-neutral-900"
    },
    size: {
      xs: "text-xs",
      sm: "text-sm",
      md: "text-base",
      lg: "text-xl",
      xl: "text-2xl"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "md"
  }
});

export interface PriceProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof priceVariants> {
  value: number;
  showCurrency?: boolean;
}

export function Price({ value, variant, size, className, ...props }: PriceProps) {
  const Tag = variant === "original" ? "del" : "span";

  return (
    <Tag className={cn(priceVariants({ variant, size }), className)} {...props}>
      {formatVnd(value)}
    </Tag>
  );
}

const discountBadgeVariants = cva(
  "inline-flex items-center justify-center font-sans font-bold tracking-tighter uppercase transition-colors",
  {
    variants: {
      variant: {
        solid: "bg-red-500 text-white hover:bg-red-600 border-none",
        outline: "border border-red-500 text-red-500 bg-transparent",
        ghost: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
        minimal: "text-red-600 p-0 tracking-widest text-[10px]" // Just text
      },
      size: {
        sm: "text-[9px] px-1.5 py-0.5",
        md: "text-[11px] px-2.5 py-1",
        lg: "text-xs px-3 py-1.5"
      },
      shape: {
        square: "rounded-none",
        rounded: "rounded-md",
        pill: "rounded-full"
      }
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
      shape: "rounded"
    }
  }
);

interface DiscountBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof discountBadgeVariants> {
  percentage: number;
}

export function DiscountBadge({
  percentage,
  variant,
  size,
  shape,
  className,
  ...props
}: DiscountBadgeProps) {
  if (percentage <= 0) return null;

  return (
    <div className={cn(discountBadgeVariants({ variant, size, shape }), className)} {...props}>
      -{percentage}%
    </div>
  );
}

// --- COMPOUND COMPONENT ---

interface PriceGroupProps {
  current: number;
  original?: number;
  className?: string;
  size?: VariantProps<typeof priceVariants>["size"];
}

export function PriceGroup({ current, original, size = "md", className }: PriceGroupProps) {
  const hasDiscount = original && original > current;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Price value={current} size={size} variant={hasDiscount ? "discount" : "default"} />
      {hasDiscount && <Price value={original} size="sm" variant="original" />}
    </div>
  );
}
