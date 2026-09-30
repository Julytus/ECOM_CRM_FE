"use client";

import * as React from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type QueryStatus = "loading" | "error" | "success" | "pending";

interface QueryBoundaryProps<TData> {
  // Core Data & State
  data: TData | undefined;
  status: QueryStatus;
  error?: any;
  onRetry?: () => void;

  // Render Props (Slots)
  children: (data: TData) => React.ReactNode;
  renderError?: (error: any, retry: () => void) => React.ReactNode;
  renderLoadMore?: (fetchNext: () => void) => React.ReactNode;

  // Layout & Fallbacks
  className?: string;
  loadingFallback?: React.ReactNode;
  emptyFallback?: React.ReactNode;

  // Pagination Logic
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
}

export function QueryBoundary<TData>({
  data,
  status,
  error,
  onRetry,
  children,
  renderError,
  renderLoadMore,
  className,
  loadingFallback,
  emptyFallback,
  hasNextPage,
  fetchNextPage
}: QueryBoundaryProps<TData>) {
  // 1. Loading State: No data yet + loading status
  if (status === "loading" || status === "pending") {
    return (
      <div className={cn("w-full", className)}>{loadingFallback || <DefaultGridSkeleton />}</div>
    );
  }

  // 2. Error State
  if (status === "error") {
    // Use custom error node if provided
    if (renderError && onRetry) {
      return <div className={className}>{renderError(error, onRetry)}</div>;
    }

    // Default Error UI
    return (
      <div className={cn("flex flex-col items-center justify-center py-20 text-center", className)}>
        <div className="bg-destructive/10 text-destructive mb-4 flex size-12 items-center justify-center rounded-full">
          <AlertCircle className="size-6" />
        </div>
        <h3 className="text-lg font-bold tracking-tight uppercase">Lỗi tải dữ liệu</h3>
        <p className="text-muted-foreground mb-6 max-w-xs text-sm">
          {error?.message || "Đã có lỗi xảy ra, vui lòng thử lại sau."}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="rounded-full px-8">
            <RefreshCcw className="mr-2 size-3" />
            Thử lại
          </Button>
        )}
      </div>
    );
  }

  // 3. Success but Empty State
  const isEmpty = !data || (Array.isArray(data) && data.length === 0);
  if (isEmpty && emptyFallback) {
    return <div className={className}>{emptyFallback}</div>;
  }

  // 4. Main Content Render
  return (
    <div className={cn("w-full", className)}>
      {data && children(data)}

      {/* Infinite Scroll / Load More Slot */}
      {hasNextPage && fetchNextPage && renderLoadMore && (
        <div className="mt-12 flex justify-center">{renderLoadMore(fetchNextPage)}</div>
      )}
    </div>
  );
}

function DefaultGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-3/4 w-full rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
