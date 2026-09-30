"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const infoFeatureVariants = cva(
  "flex shrink-0 items-center justify-center transition-all duration-300",
  {
    variants: {
      theme: {
        neutral: "bg-neutral-50 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400",
        luxury:
          "bg-white border border-neutral-100 text-neutral-900 shadow-sm group-hover:border-neutral-900",
        emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
      },
      size: {
        sm: "size-8",
        md: "size-10",
        lg: "size-12"
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-none"
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
        <Icon className={cn(size === "sm" ? "size-3" : size === "lg" ? "size-5" : "size-4")} />
      </div>

      {/* Text Content */}
      <div className="flex flex-col space-y-0.5">
        <span className="text-[10px] leading-none font-bold tracking-[0.15em] text-neutral-900 uppercase dark:text-neutral-100">
          {title}
        </span>
        <span className="text-[11px] leading-tight font-light text-neutral-500">{subtitle}</span>
      </div>
    </div>
  );
}
