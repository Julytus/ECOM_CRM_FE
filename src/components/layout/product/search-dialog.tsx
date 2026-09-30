"use client";

import * as React from "react";
import { Search, X, ShoppingBag } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";

import { createInfiniteProductDetailsQueryOptions } from "@/lib/tanstack/options/product";
import { ProductCard } from "@/components/shop/product/product-card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { searchOpenAtom } from "@/lib/atom/search";
import { cn } from "@/lib/utils";

const FEATURED_KEYWORDS = [
  "Nội thất",
  "Bàn ghế",
  "Sofa",
  "Giường ngủ",
  "Tủ quần áo",
  "Kệ tivi",
  "Bàn làm việc",
  "Trang trí nhà"
];

export function SearchDialog() {
  const [open, setOpen] = useAtom(searchOpenAtom);
  const [keyword, setKeyword] = React.useState("");
  const [debouncedKeyword] = useDebounceValue(keyword, 500);

  const inputRef = React.useRef<HTMLInputElement>(null);

  const { data: productsPages, isLoading } = useInfiniteQuery({
    ...createInfiniteProductDetailsQueryOptions({
      opts: { keyword: debouncedKeyword }
    }),
    enabled: open
  });

  const products = React.useMemo(() => {
    return productsPages?.pages.flatMap((page) => page.items).slice(0, 8) ?? [];
  }, [productsPages]);

  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setKeyword("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className={cn(
          "bg-background overflow-hidden border-none p-0 shadow-2xl",
          "sm:rounded-3xl",
          "w-[95vw] md:w-[90vw] lg:max-w-5xl",
          "h-[90vh] md:h-[85vh]"
        )}
      >
        <div className="flex h-[90vh] flex-col">
          <div className="shrink-0 border-b border-neutral-100 p-6 sm:p-8">
            <div className="justify-between2 mb-6 flex items-center">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 rounded-lg p-2">
                  <ShoppingBag className="text-primary size-5" />
                </div>
                <DialogTitle className="text-xl font-black tracking-tighter uppercase sm:text-2xl">
                  Tìm kiếm
                </DialogTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="hover:bg-secondary rounded-full"
              >
                <X className="size-5" />
              </Button>
            </div>

            <div className="relative">
              <Search className="text-muted-foreground/60 absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2" />
              <Input
                ref={inputRef}
                placeholder="Bạn đang tìm sản phẩm gì?..."
                className="bg-secondary/40 focus-visible:ring-primary h-14 rounded-2xl border-none pr-14 pl-14 text-base font-medium transition-all focus-visible:ring-2"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              {keyword && (
                <button
                  onClick={() => setKeyword("")}
                  className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-neutral-200 p-1 transition-colors hover:bg-neutral-300"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          </div>

          <ScrollArea className="h-full flex-1 px-6 sm:px-8">
            <div className="space-y-10 py-6 pb-68">
              {!keyword && (
                <div className="space-y-4">
                  <h5 className="text-muted-foreground/60 text-[10px] font-bold tracking-[0.2em] uppercase">
                    Từ khóa phổ biến
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {FEATURED_KEYWORDS.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-secondary/60 hover:bg-primary cursor-pointer rounded-full border-none px-4 py-2 text-xs font-semibold transition-all hover:text-white"
                        onClick={() => setKeyword(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <h5 className="text-muted-foreground/60 border-b border-neutral-100 pb-2 text-[10px] font-bold tracking-[0.2em] uppercase">
                  {debouncedKeyword ? `Kết quả cho "${debouncedKeyword}"` : "Gợi ý cho bạn"}
                </h5>

                {isLoading ? (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-3">
                        <div className="bg-secondary/50 aspect-square animate-pulse rounded-2xl" />
                        <div className="bg-secondary/50 h-4 w-2/3 animate-pulse rounded" />
                        <div className="bg-secondary/50 h-4 w-1/4 animate-pulse rounded" />
                      </div>
                    ))}
                  </div>
                ) : products.length > 0 ? (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-10 overflow-visible md:grid-cols-2 lg:grid-cols-4 lg:gap-x-6">
                    {products.map((product) => (
                      <ProductCard
                        showVariantPicker={false}
                        key={product.id}
                        product={product}
                        className="w-full"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-muted-foreground text-sm italic">
                      Không tìm thấy sản phẩm phù hợp.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
        <div className="from-background pointer-events-none absolute inset-x-0 bottom-0 z-50 h-10 bg-gradient-to-t to-transparent" />
      </DialogContent>
    </Dialog>
  );
}
