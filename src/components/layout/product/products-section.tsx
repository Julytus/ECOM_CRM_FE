"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ProductDetailsDTO } from "@/lib/types/product";
import { ProductCard } from "@/components/shop/product/product-card";
import { QueryBoundary, type QueryStatus } from "@/components/boundary";

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

const headerVariants = cva("mb-8", {
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
    return (
      <section ref={ref} className={cn(sectionVariants({ spacing, className }))} {...props}>
        <div className={cn(headerVariants({ align: headerAlign }))}>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
          {subtitle && (
            <p className="text-muted-foreground mt-2 text-sm md:text-base">{subtitle}</p>
          )}
        </div>

        <QueryBoundary
          data={products}
          status={status}
          emptyFallback={emptyFallback}
          error={error}
          onRetry={onRetry}
          loadingFallback={loadingFallback}
        >
          {(data) => {
            const displayedProducts = limit ? data.slice(0, limit) : data;

            return (
              <>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {displayedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      showVariantPicker={showVariantPicker}
                    />
                  ))}
                </div>

                {viewAllText && (
                  <div className={cn("mt-8", headerVariants({ align: headerAlign }))}>
                    <p
                      onClick={onViewAllClick}
                      className="text-primary inline-block cursor-pointer text-sm font-medium hover:underline"
                    >
                      {viewAllText}
                    </p>
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

export { ProductGridSection };
