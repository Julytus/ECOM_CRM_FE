"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const ratingBadgeVariants = cva(
  "inline-flex items-center justify-center gap-1 font-sans transition-colors shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "border border-input bg-background text-foreground",
        ghost: "bg-primary/5 text-primary",
        minimal: "bg-transparent p-0 text-foreground font-medium",
        star: "bg-background/85 text-foreground [&_svg]:text-warning shadow-sm backdrop-blur-sm"
      },
      size: {
        xs: "text-[10px] px-1.5 py-0.5 [&_svg]:size-2.5",
        sm: "text-[11px] px-2 py-0.5 [&_svg]:size-3",
        md: "text-xs px-2.5 py-1 [&_svg]:size-3.5",
        lg: "text-sm px-3 py-1.5 [&_svg]:size-4"
      },
      shape: {
        square: "rounded-none",
        rounded: "rounded-md",
        pill: "rounded-full"
      }
    },
    defaultVariants: {
      variant: "outline",
      size: "md",
      shape: "rounded"
    }
  }
);

export interface RatingBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof ratingBadgeVariants> {
  rating: number;
  maxRating?: number;
  showIcon?: boolean;
  count?: number;
}

export function RatingBadge({
  rating,
  maxRating = 5,
  showIcon = true,
  count,
  variant,
  size,
  shape,
  className,
  ...props
}: RatingBadgeProps) {
  // Ensure rating doesn't exceed max
  const displayRating = Math.min(rating, maxRating).toFixed(1);

  return (
    <div className="flex items-center gap-1.5">
      <div className={cn(ratingBadgeVariants({ variant, size, shape }), className)} {...props}>
        {showIcon && <Star aria-hidden="true" className="fill-current" />}
        <span className="tabular-nums">
          <span className="sr-only">Đánh giá </span>
          {displayRating}
          <span className="sr-only">/{maxRating}</span>
        </span>
      </div>

      {count !== undefined && (
        <span className="text-muted-foreground text-[10px] font-light italic">
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}
