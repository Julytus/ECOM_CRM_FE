"use client";

import * as React from "react";
import { RotateCcw, Filter, Check, ChevronRight, Star } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MotionButton } from "@/components/motion-ui";
import { AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface ProductFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  minRating: number;
  onMinRatingChange: (rating: number) => void;
  onReset: () => void;
}

export function ProductFilterSheet({
  open,
  onOpenChange,
  priceRange,
  onPriceRangeChange,
  minRating,
  onMinRatingChange,
  onReset
}: ProductFilterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex h-full w-full flex-col border-r p-0 sm:max-w-md">
        {/* Fixed Header */}
        <div className="shrink-0 space-y-3 px-8 pt-12 pb-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-full p-2">
              <Filter className="text-primary-foreground h-4 w-4" />
            </div>
            <SheetTitle className="text-foreground text-2xl font-light tracking-[0.3em] uppercase">
              Bộ lọc
            </SheetTitle>
          </div>
          <SheetDescription className="text-muted-foreground text-sm font-light italic">
            Tinh chọn không gian sống đẳng cấp.
          </SheetDescription>
        </div>

        <Separator className="mx-8 w-auto opacity-50" />

        <div className="relative flex-1 overflow-hidden">
          <div className="from-background pointer-events-none absolute top-0 z-20 h-4 w-full bg-gradient-to-b to-transparent" />

          <ScrollArea className="h-full px-8">
            <div className="space-y-12 py-10">
              <FilterSection title="Khoảng giá" subtitle="Lọc theo ngân sách đầu tư">
                <div className="space-y-8 pt-4">
                  <Slider
                    min={0}
                    max={100000000}
                    step={1000000}
                    value={priceRange}
                    onValueChange={(val) => onPriceRangeChange(val as [number, number])}
                    className="cursor-pointer"
                  />
                  <div className="grid grid-cols-2 gap-6">
                    <PriceInput
                      label="Tối thiểu"
                      value={priceRange[0]}
                      onChange={(val) => onPriceRangeChange([val, priceRange[1]])}
                    />
                    <PriceInput
                      label="Tối đa"
                      value={priceRange[1]}
                      onChange={(val) => onPriceRangeChange([priceRange[0], val])}
                    />
                  </div>
                </div>
              </FilterSection>

              <FilterSection title="Đánh giá" subtitle="Tiêu chuẩn chất lượng">
                <div className="flex flex-col gap-2 pt-2">
                  {[5, 4, 3, 2, 1].map((starCount) => (
                    <button
                      key={starCount}
                      onClick={() => onMinRatingChange(starCount)}
                      className="group flex items-center justify-between rounded-md py-2 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-4 w-4 transition-all duration-300",
                                i < starCount
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-muted/40 fill-muted/20"
                              )}
                            />
                          ))}
                        </div>
                        <span
                          className={cn(
                            "text-[11px] tracking-widest uppercase transition-colors",
                            minRating === starCount
                              ? "text-foreground font-bold"
                              : "text-muted-foreground font-light"
                          )}
                        >
                          {starCount === 5 ? "Tuyệt vời" : `Từ ${starCount} sao`}
                        </span>
                      </div>

                      <AnimatePresence>
                        {minRating === starCount && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="bg-primary flex h-4 w-4 items-center justify-center rounded-full"
                          >
                            <Check className="text-primary-foreground h-2.5 w-2.5" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Added more mock sections to demonstrate scrolling */}
              {/* <FilterSection title="Chất liệu" subtitle="Gỗ Sồi, Da bò Ý..." isLocked /> */}
              {/* <FilterSection title="Nhà thiết kế" subtitle="Bộ sưu tập giới hạn" isLocked /> */}
              {/* <FilterSection title="Màu sắc" subtitle="Tone màu chủ đạo" isLocked /> */}
              {/* <FilterSection title="Kích thước" subtitle="Tương thích không gian" isLocked /> */}
            </div>
          </ScrollArea>

          {/* Bottom Gradient Fade */}
          <div className="from-background pointer-events-none absolute bottom-0 z-20 h-4 w-full bg-linear-to-t to-transparent" />
        </div>

        {/* Fixed Footer */}
        <SheetFooter className="bg-background shrink-0 border-t p-6">
          <div className="flex w-full gap-4">
            <MotionButton
              variant="outline"
              whileTap={{ scale: 0.95 }}
              className="hover:bg-secondary h-12 flex-1 rounded-md text-[10px] font-light tracking-widest uppercase transition-colors"
              onClick={onReset}
            >
              <RotateCcw className="mr-2 h-3 w-3" />
              Làm mới
            </MotionButton>

            <MotionButton
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-primary-foreground h-12 flex-[2] rounded-md text-[10px] font-bold tracking-widest uppercase shadow-sm hover:opacity-90"
              onClick={() => onOpenChange(false)}
            >
              <Check className="mr-2 h-3 w-3" />
              Áp dụng
            </MotionButton>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/** * Sub-components for Scalability
 */

function FilterSection({
  title,
  subtitle,
  children,
  isLocked = false
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  isLocked?: boolean;
}) {
  return (
    <div className={isLocked ? "cursor-not-allowed opacity-30 grayscale" : ""}>
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-foreground text-xs font-semibold tracking-[0.2em] uppercase">
            {title}
          </h4>
          {subtitle && (
            <p className="text-muted-foreground text-[11px] font-light italic">{subtitle}</p>
          )}
        </div>
        {isLocked && <ChevronRight className="text-muted-foreground h-3 w-3" />}
      </div>
      {children}
    </div>
  );
}

function PriceInput({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <div className="w-full max-w-[120px] space-y-2">
      <Label className="text-muted-foreground ml-1 text-[10px] font-medium tracking-widest uppercase">
        {label}
      </Label>
      <div className="group relative">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="border-input focus-visible:ring-primary h-10 rounded-md bg-transparent pr-8 text-xs font-light tabular-nums"
        />
        <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-[10px] font-medium">
          ₫
        </span>
      </div>
    </div>
  );
}
