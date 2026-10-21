"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ProductDetailsDTO } from "@/lib/types/product";
import { ProductCard } from "@/components/shop/product/product-card";
import { QueryBoundary, type QueryStatus } from "@/components/boundary";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";

const sectionVariants = cva(
  "bg-background container mx-auto my-12 px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24",
  {
    variants: {
      spacing: {
        default: "my-12",
        compact: "my-6",
        large: "my-20"
      }
    },
    defaultVariants: {
      spacing: "default"
    }
  }
);

const headerVariants = cva("mb-8 md:mb-12", {
  variants: {
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right"
    }
  },
  defaultVariants: {
    align: "center"
  }
});

interface ProductGridSectionProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof sectionVariants> {
  title: string;
  subtitle?: string;
  // --- Query Props ---
  products: ProductDetailsDTO[] | undefined;
  status: QueryStatus;
  error?: any;
  onRetry?: () => void;
  // -------------------
  limit?: number;
  viewAllText?: string;
  onViewAllClick?: () => void;
  showVariantPicker?: boolean;
  headerAlign?: "left" | "center" | "right";
  loadingFallback?: React.ReactNode;
  emptyFallback?: React.ReactNode;
}

const ProductGridSection = React.forwardRef<HTMLElement, ProductGridSectionProps>(
  (
    {
      title,
      subtitle,
      products,
      status,
      error,
      onRetry,
      limit,
      viewAllText,
      onViewAllClick,
      showVariantPicker = false,
      headerAlign = "center",
      className,
      spacing,
      loadingFallback,
      emptyFallback,
      ...props
    },
    ref
  ) => {
    const headingId = React.useId();

    return (
      <section
        ref={ref}
        aria-labelledby={title ? headingId : undefined}
        className={cn(sectionVariants({ spacing, className }))}
        {...props}
      >
        {title && (
          <div className={cn(headerVariants({ align: headerAlign }))}>
            <h2
              id={headingId}
              className="font-display text-foreground text-3xl leading-tight font-semibold tracking-tight text-balance md:text-4xl"
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className={cn(
                  "text-muted-foreground mt-3 max-w-2xl text-sm leading-relaxed md:text-base",
                  headerAlign === "center" && "mx-auto",
                  headerAlign === "right" && "ml-auto"
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}

        <QueryBoundary
          data={products}
          status={status}
          emptyFallback={emptyFallback}
          error={error}
          onRetry={onRetry}
          loadingFallback={
            loadingFallback ?? <ProductGridSkeleton count={limit ? Math.min(limit, 8) : 8} />
          }
        >
          {(data) => {
            const displayedProducts = limit ? data.slice(0, limit) : data;

            return (
              <>
                <ul role="list" className={productGridClassName}>
                  {displayedProducts.map((product) => (
                    <li key={product.id} className="flex">
                      <ProductCard product={product} showVariantPicker={showVariantPicker} />
                    </li>
                  ))}
                </ul>

                {viewAllText && (
                  <div className={cn("mt-10 md:mt-12", headerVariants({ align: headerAlign }))}>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={onViewAllClick}
                      className="group h-11 rounded-full px-7"
                    >
                      {viewAllText}
                      <ArrowRight
                        aria-hidden="true"
                        className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                      />
                    </Button>
                  </div>
                )}
              </>
            );
          }}
        </QueryBoundary>
      </section>
    );
  }
);

ProductGridSection.displayName = "ProductGridSection";

/** Shared grid rhythm so cards and skeletons line up across home, search and wishlist. */
const productGridClassName =
  "grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 md:gap-y-10 lg:grid-cols-4 lg:gap-x-6";

function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div role="status" aria-label="Đang tải sản phẩm" className={productGridClassName}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-4/5 w-full rounded-xl sm:rounded-2xl" />
          <div className="space-y-2 px-1">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export { ProductGridSection, ProductGridSkeleton };
