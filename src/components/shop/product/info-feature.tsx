"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const infoFeatureVariants = cva(
  "flex shrink-0 items-center justify-center transition-all duration-300",
  {
    variants: {
      theme: {
        neutral: "bg-muted text-foreground",
        luxury:
          "bg-card border border-border text-foreground shadow-xs group-hover:border-foreground",
        emerald: "bg-success/10 text-success",
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
      },
      size: {
        sm: "size-8",
        md: "size-10",
        lg: "size-12"
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-lg"
      }
    },
    defaultVariants: {
      theme: "luxury",
      size: "md",
      shape: "square"
    }
  }
);

interface InfoFeatureProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof infoFeatureVariants> {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}

export function InfoFeature({
  icon: Icon,
  title,
  subtitle,
  theme,
  size,
  shape,
  className,
  ...props
}: InfoFeatureProps) {
  return (
    <div className={cn("group flex items-center gap-4", className)} {...props}>
      {/* Icon Container */}
      <div className={cn(infoFeatureVariants({ theme, size, shape }))}>
        <Icon
          aria-hidden="true"
          className={cn(size === "sm" ? "size-3" : size === "lg" ? "size-5" : "size-4")}
        />
      </div>

      {/* Text Content */}
      <div className="flex flex-col gap-1">
        <span className="text-foreground text-xs leading-tight font-semibold tracking-[0.08em] uppercase">
          {title}
        </span>
        <span className="text-muted-foreground text-xs leading-snug">{subtitle}</span>
      </div>
    </div>
  );
}
