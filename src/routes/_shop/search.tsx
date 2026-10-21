"use client";

import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  ArrowUpDown,
  Search,
  X,
  Loader2,
  SearchX,
  RotateCcw,
  SlidersHorizontal
} from "lucide-react";
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
  // UI-only indicator derived from existing filter state (default price range = [0, 50_000_000]).
  const activeFilterCount =
    (priceRange[0] !== 0 || priceRange[1] !== 50000000 ? 1 : 0) + (minRating > 0 ? 1 : 0);

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
      <div className="container mx-auto px-4 py-8 sm:px-6 md:px-12 md:py-12 lg:px-16">
        {/* --- Toolbar --- */}
        <div
          role="search"
          className="border-border mb-6 flex flex-col gap-3 border-b pb-6 md:flex-row md:items-center md:justify-between md:gap-4"
        >
          <div className="relative w-full md:max-w-md md:flex-1">
            <label htmlFor="shop-search-keyword" className="sr-only">
              Tìm kiếm sản phẩm
            </label>
            <Search
              aria-hidden="true"
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
            />
            <Input
              id="shop-search-keyword"
              type="search"
              autoComplete="off"
              placeholder="Tìm kiếm sản phẩm..."
              className="bg-card h-11 rounded-full pr-11 pl-10 [&::-webkit-search-cancel-button]:hidden"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            {keyword && (
              <button
                type="button"
                aria-label="Xoá từ khoá tìm kiếm"
                onClick={() => setKeyword("")}
                className="text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-ring/60 absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-full transition-colors outline-none focus-visible:ring-2"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
            <Select
              value={`${filters.sortBy}-${filters.sortDir}`}
              onValueChange={(val) => {
                const [sortBy, sortDir] = val.split("-") as [ProductSortField, SortDirection];
                handleFilterChange({ sortBy, sortDir });
              }}
            >
              <SelectTrigger
                aria-label="Sắp xếp sản phẩm"
                className="bg-card h-11! w-full rounded-full px-4 sm:w-[190px]"
              >
                <ArrowUpDown aria-hidden="true" className="text-muted-foreground size-4" />
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

            <Button
              type="button"
              variant="outline"
              className="h-11 gap-2 rounded-full px-5"
              aria-haspopup="dialog"
              aria-expanded={isFilterOpen}
              onClick={() => setIsFilterOpen(true)}
            >
              <SlidersHorizontal aria-hidden="true" className="size-4" />
              Bộ lọc
              {activeFilterCount > 0 && (
                <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums">
                  {activeFilterCount}
                  <span className="sr-only"> bộ lọc đang áp dụng</span>
                </span>
              )}
            </Button>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 md:mb-8">
          <p className="text-muted-foreground text-sm" aria-live="polite">
            Tìm thấy{" "}
            <span className="text-foreground font-semibold tabular-nums">{totalResults}</span> sản
            phẩm
            {debouncedKeyword && (
              <>
                {" "}
                cho “<span className="text-foreground font-medium">{debouncedKeyword}</span>”
              </>
            )}
          </p>
          {(activeFilterCount > 0 || keyword) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetAllFilters}
              className="text-muted-foreground hover:text-foreground h-9 gap-1.5"
            >
              <RotateCcw aria-hidden="true" className="size-3.5" />
              Xoá bộ lọc
            </Button>
          )}
        </div>

        <ProductGridSection
          title=""
          products={products}
          status={status}
          error={error}
          onRetry={refetch}
          emptyFallback={<SearchEmptyState onReset={resetAllFilters} />}
          className="my-0 px-0 sm:px-0 md:px-0 lg:px-0 xl:px-0"
        />

        <div
          ref={loadMoreRef}
          aria-live="polite"
          className="mt-12 flex min-h-[120px] flex-col items-center justify-center"
        >
          {isFetchingNextPage ? (
            <div role="status" className="flex flex-col items-center gap-2">
              <Loader2 aria-hidden="true" className="text-foreground size-6 animate-spin" />
              <p className="text-muted-foreground text-sm">Đang tải thêm...</p>
            </div>
          ) : !hasNextPage && products.length > 0 ? (
            <div className="flex w-full items-center gap-4">
              <div className="bg-border h-px flex-1" />
              <p className="text-muted-foreground text-sm">Bạn đã khám phá hết sản phẩm</p>
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
    <Empty className="animate-in fade-in zoom-in-95 border-border rounded-2xl border border-dashed py-16 duration-300 motion-reduce:animate-none">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="size-14 rounded-full">
          <SearchX aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle className="font-display text-2xl font-semibold">
          Không tìm thấy sản phẩm
        </EmptyTitle>
        <EmptyDescription>
          Rất tiếc, chúng tôi không tìm thấy sản phẩm nào khớp với lựa chọn của bạn. Vui lòng thử
          thay đổi bộ lọc hoặc từ khóa.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          className="h-11 gap-2 rounded-full px-6"
        >
          <RotateCcw aria-hidden="true" className="size-4" />
          Thiết lập lại bộ lọc
        </Button>
      </EmptyContent>
    </Empty>
  );
}
