"use client";

import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Search, X, Loader2, SearchX, RotateCcw, SlidersHorizontal } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { createFileRoute } from "@tanstack/react-router";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { PageWrapper } from "@/components/layout/page-warper";
import { ProductGridSection } from "@/components/layout/product/products-section";
import { createInfiniteProductDetailsQueryOptions } from "@/lib/tanstack/options/product";
import type {
  ProductListDetailsApiRequest,
  ProductSortField,
  SortDirection
} from "@/lib/types/product";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { ProductFilterSheet } from "@/components/layout/search/filter-sheet";

export const Route = createFileRoute("/_shop/search")({
  component: ProductSearchPage
});

function ProductSearchPage() {
  const [keyword, setKeyword] = React.useState("");
  const [debouncedKeyword] = useDebounceValue(keyword, 500);
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 50000000]);
  const [minRating, setMinRating] = React.useState<number>(0);

  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  const [filters, setFilters] = React.useState<ProductListDetailsApiRequest>({
    active: 1,
    sortBy: "id",
    sortDir: "desc",
    paging: { limit: 12 }
  });

  const queryOptions = React.useMemo(
    () => ({
      ...filters,
      keyword: debouncedKeyword,
      priceFrom: priceRange[0],
      priceTo: priceRange[1],
      avgRatingFrom: minRating > 0 ? minRating : undefined,
      avgRatingTo: 5
    }),
    [filters, debouncedKeyword, priceRange, minRating]
  );

  const {
    data: productsPages,
    status,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    ...createInfiniteProductDetailsQueryOptions({ opts: queryOptions })
  });

  const { ref: loadMoreRef, inView } = useInView();

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const products = React.useMemo(() => {
    return productsPages?.pages.flatMap((page) => page.items) ?? [];
  }, [productsPages]);

  const totalResults = productsPages?.pages[0]?.total ?? 0;

  const handleFilterChange = (updates: Partial<ProductListDetailsApiRequest>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const resetAllFilters = () => {
    setKeyword("");
    setPriceRange([0, 50000000]);
    setMinRating(0);
    setFilters({
      sortBy: "id",
      sortDir: "desc",
      active: 1,
      paging: { limit: 12 }
    });
  };

  return (
    <PageWrapper
      title="Cửa hàng"
      image="/page-title/page-title-6.jpg"
      breadcrumbItems={[{ label: "Trang chủ", href: "/" }, { label: "Sản phẩm" }]}
    >
      <div className="bg-background container mx-auto px-4 py-8 md:px-12 lg:px-16">
        {/* --- Toolbar --- */}
        <div className="mb-8 flex flex-col gap-4 border-b pb-6 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              className="bg-muted/40 h-11 pl-10"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            {keyword && (
              <button
                onClick={() => setKeyword("")}
                className="hover:text-destructive absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
              >
                <X className="text-muted-foreground h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={`${filters.sortBy}-${filters.sortDir}`}
              onValueChange={(val) => {
                const [sortBy, sortDir] = val.split("-") as [ProductSortField, SortDirection];
                handleFilterChange({ sortBy, sortDir });
              }}
            >
              <SelectTrigger className="h-11! w-[180px]">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id-desc">Mới nhất</SelectItem>
                <SelectItem value="name-asc">Tên: A-Z</SelectItem>
                <SelectGroup>
                  <SelectLabel>Giá</SelectLabel>
                  <SelectItem value="minPrice-asc">Thấp → Cao</SelectItem>
                  <SelectItem value="maxPrice-desc">Cao → Thấp</SelectItem>
                </SelectGroup>

                <SelectGroup>
                  <SelectLabel>Đánh giá</SelectLabel>
                  <SelectItem value="avgRating-desc">Cao → Thấp</SelectItem>
                  <SelectItem value="avgRating-asc">Thấp → Cao</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button variant="outline" className="h-11 gap-2" onClick={() => setIsFilterOpen(true)}>
              <SlidersHorizontal className="h-4 w-4" />
              Bộ lọc
            </Button>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Tìm thấy <span className="text-foreground font-semibold">{totalResults}</span> sản phẩm
          </p>
        </div>

        <ProductGridSection
          title=""
          products={products}
          status={status}
          error={error}
          onRetry={refetch}
          emptyFallback={<SearchEmptyState onReset={resetAllFilters} />}
          className="my-0 px-0 md:px-0 lg:px-0 xl:px-0"
        />

        <div
          ref={loadMoreRef}
          className="mt-12 flex min-h-[120px] flex-col items-center justify-center"
        >
          {isFetchingNextPage ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
              <p className="text-muted-foreground animate-pulse text-sm">Đang tải thêm...</p>
            </div>
          ) : !hasNextPage && products.length > 0 ? (
            <div className="flex w-full items-center gap-4 opacity-50">
              <div className="bg-border h-px flex-1" />
              <p className="text-sm font-medium italic">Bạn đã khám phá hết sản phẩm</p>
              <div className="bg-border h-px flex-1" />
            </div>
          ) : null}
        </div>
      </div>
      <ProductFilterSheet
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        minRating={minRating}
        onMinRatingChange={setMinRating}
        onReset={resetAllFilters}
      />
    </PageWrapper>
  );
}

function SearchEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <Empty className="animate-in fade-in zoom-in duration-300">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX />
        </EmptyMedia>
        <EmptyTitle>Không tìm thấy sản phẩm</EmptyTitle>
        <EmptyDescription>
          Rất tiếc, chúng tôi không tìm thấy sản phẩm nào khớp với lựa chọn của bạn. Vui lòng thử
          thay đổi bộ lọc hoặc từ khóa.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={onReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Thiết lập lại bộ lọc
        </Button>
      </EmptyContent>
    </Empty>
  );
}
