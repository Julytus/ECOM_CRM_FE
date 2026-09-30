"use client";

import * as React from "react";
import { useAtom } from "jotai";
import { ShoppingBag, X, ArrowRight, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "@tanstack/react-query";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

import { cartOpenAtom } from "@/lib/atom/cart";
import { useCartStore } from "@/lib/stores/cart";
import { Price, PriceGroup } from "@/components/shop/price";
import { ImageWithFallback } from "@/components/image/image-with-fallback";
import { createProductVariantDetailByIdsQueryOptions } from "@/lib/tanstack/options/product";
import { QueryBoundary } from "@/components/boundary";
import type { ProductVariantDetailDTO } from "@/lib/types/product";
import { QuantityInput } from "@/components/shop/quantity-input";
import { cn } from "@/lib/utils";
import { MotionButton } from "@/components/motion-ui";
import { COLOR_MAP } from "@/lib/color";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import { useNavigate } from "@tanstack/react-router";

export function CartSheet() {
  const [open, setOpen] = useAtom(cartOpenAtom);
  const navigate = useNavigate();
  const {
    items,
    removeFromCart,
    updateQuantity,
    getTotalItems,
    updateSelect,
    getSelectedTotalItems
  } = useCartStore();

  const variantIds = React.useMemo(() => items.map((i) => i.variantId), [items]);

  const query = useQuery({
    ...createProductVariantDetailByIdsQueryOptions({ ids: variantIds }),
    enabled: !!open && variantIds.length > 0
  });

  const cartDetails = React.useMemo(() => {
    if (!query.data) return [];
    return items.map((item) => {
      const detail = query.data?.find((d) => d.id === item.variantId);
      return { ...item, detail };
    });
  }, [items, query.data]);

  const subtotal = React.useMemo(() => {
    return cartDetails.reduce((acc, item) => {
      if (!item.selected) return acc;
      return acc + (item.detail?.price || 0) * item.quantity;
    }, 0);
  }, [cartDetails]);

  const isEmpty = items.length === 0;
  const selectedCount = getSelectedTotalItems();
  const hasSelection = selectedCount > 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="px-6 py-4">
          <SheetTitle className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <ShoppingBag className="size-5" />
            Giỏ hàng ({getTotalItems()})
          </SheetTitle>
        </SheetHeader>

        <Separator />

        <div className="flex flex-1 flex-col overflow-hidden">
          <QueryBoundary
            className="h-full"
            data={cartDetails}
            status={isEmpty ? "success" : query.status}
            error={query.error}
            onRetry={query.refetch}
            loadingFallback={<CartLoadingSkeleton />}
            emptyFallback={<EmptyCartView onClose={() => setOpen(false)} />}
          >
            {(mergedItems) => (
              <ScrollArea className="h-full flex-1">
                <div className="space-y-6 px-4 py-3">
                  <AnimatePresence initial={false} mode="popLayout">
                    {mergedItems.map((item) => (
                      <CartItem
                        key={`${item.productId}-${item.variantId}`}
                        item={item}
                        onRemove={() => removeFromCart(item.productId, item.variantId)}
                        onUpdateQty={(qty) => updateQuantity(item.productId, item.variantId, qty)}
                        onUpdateSelect={(value) =>
                          updateSelect(item.productId, item.variantId, value)
                        }
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            )}
          </QueryBoundary>
        </div>

        {!isEmpty && (
          <div className="bg-background border-t p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-base font-medium">
                <span className="text-sm font-semibold tracking-wider text-neutral-500 uppercase">
                  Tạm tính {hasSelection && `(${selectedCount} món)`}
                </span>
                <Price
                  value={query.isLoading ? 0 : subtotal}
                  size="md"
                  className={cn("font-bold transition-opacity", query.isLoading && "opacity-50")}
                />
              </div>

              <p className="text-[11px] leading-relaxed text-neutral-400 italic">
                * Phí vận chuyển và thuế sẽ được tính khi thanh toán.
              </p>

              <div className="flex flex-col gap-2 pt-2">
                <MotionButton
                  onTap={() => {
                    if (!query.isLoading && !query.isError && hasSelection) {
                      navigate({ to: "/checkout" });
                      setOpen(false);
                    }
                  }}
                  whileHover={
                    hasSelection ? { scale: 1.0, backgroundColor: "rgb(23, 23, 23)" } : {}
                  }
                  whileTap={hasSelection ? { scale: 0.98 } : {}}
                  className="w-full rounded-xl py-7 text-xs font-bold tracking-[0.2em] uppercase shadow-lg shadow-neutral-200"
                  size="lg"
                  disabled={query.isLoading || query.isError || !hasSelection}
                >
                  Thanh toán ngay {hasSelection && `(${selectedCount})`}
                  <ArrowRight className="ml-2 size-4" />
                </MotionButton>

                <Button
                  variant="ghost"
                  className="w-full text-xs font-bold tracking-widest text-neutral-500 uppercase hover:text-black"
                  onClick={() => setOpen(false)}
                >
                  Tiếp tục mua sắm
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CartItem({
  item,
  onRemove,
  onUpdateQty,
  onUpdateSelect
}: {
  item: { detail: ProductVariantDetailDTO | undefined; quantity: number; selected: boolean };
  onRemove: () => void;
  onUpdateQty: (qty: number) => void;
  onUpdateSelect: (value: boolean) => void;
}) {
  const { detail, quantity, selected } = item;

  const isOutOfStock = detail ? quantity > detail.stock : false;

  const handleToggle = () => {
    if (isOutOfStock) return;
    onUpdateSelect(!selected);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        "flex gap-4 transition-all duration-300",
        (!selected || isOutOfStock) && "opacity-60"
      )}
    >
      <div
        onClick={handleToggle}
        className={cn(
          "group relative size-20 overflow-hidden rounded-lg sm:size-24",
          isOutOfStock ? "cursor-not-allowed" : "cursor-pointer"
        )}
      >
        <ImageWithFallback
          src={detail?.image || undefined}
          alt={detail?.productName}
          className="h-full w-full object-cover"
        />

        <div
          className={cn(
            "absolute inset-0 flex items-start justify-start p-1.5 transition-colors",
            selected && !isOutOfStock ? "bg-black/5" : "bg-white/20"
          )}
        >
          <div
            className={cn(
              "flex size-4 items-center justify-center rounded-sm border transition-all",
              selected && !isOutOfStock
                ? "scale-100 border-black bg-black shadow-sm"
                : "scale-90 border-neutral-300 bg-white/80"
            )}
          >
            {selected && !isOutOfStock && <Check className="size-3 stroke-3 text-white" />}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between py-0.5">
        <div className="space-y-1">
          <div className="flex justify-between gap-2">
            <h4 className="line-clamp-1 text-sm font-bold sm:text-base">
              {detail?.productName || "Đang tải..."}
            </h4>
            <button
              onClick={onRemove}
              className="text-muted-foreground/40 hover:text-destructive transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Stock Warning Logic */}
          {isOutOfStock && (
            <div className="text-destructive animate-in fade-in slide-in-from-left-1 flex items-center gap-1 text-[10px] font-bold uppercase">
              <AlertCircle className="size-3" />
              Chỉ còn {detail?.stock} sản phẩm
            </div>
          )}

          <div className="mt-1 flex flex-wrap items-center gap-3">
            {detail && (
              <>
                <div className="flex items-center gap-1.5">
                  <div
                    className="size-3 rounded-full border border-neutral-200"
                    style={{ backgroundColor: COLOR_MAP[detail.options.color] || "#D1D5DB" }}
                  />
                  <span className="text-[10px] font-bold text-neutral-600 uppercase">
                    {detail.options.color}
                  </span>
                </div>
                <span className="size-1 rounded-full bg-neutral-300" />
                <div className="flex items-center">
                  <span className="mr-1 text-[10px] font-bold text-neutral-400 uppercase">
                    Size:
                  </span>
                  <span className="text-[10px] font-black text-neutral-900 uppercase">
                    {detail.options.size}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-end justify-between">
          <QuantityInput
            value={quantity}
            onQuantityChange={onUpdateQty}
            maxStock={detail?.stock ?? 0}
            className="py-2"
            size="compact"
            showLabel={false}
            roundness="lg"
          />
          <PriceGroup
            current={(detail?.price || 0) * quantity}
            original={(detail?.originalPrice || 0) * quantity}
            size="sm"
            className="font-bold"
          />
        </div>
      </div>
    </motion.div>
  );
}

function EmptyCartView({ onClose }: { onClose: () => void }) {
  return (
    <Empty className="border-none">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-secondary/20 size-20 rounded-full">
          <ShoppingBag className="text-muted-foreground size-10" />
        </EmptyMedia>

        <EmptyTitle className="tracking-tight uppercase">Giỏ hàng trống</EmptyTitle>

        <EmptyDescription>Hãy chọn cho mình những phong cách yêu thích nhất.</EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        <Button
          variant="outline"
          onClick={onClose}
          className="mt-2 rounded-full px-8 text-[10px] font-bold tracking-widest uppercase"
        >
          Khám phá ngay
        </Button>
      </EmptyContent>
    </Empty>
  );
}

function CartLoadingSkeleton() {
  return (
    <div className="space-y-6 px-6 py-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="size-20 rounded-lg sm:size-24" />
          <div className="flex flex-1 flex-col justify-between py-1">
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
