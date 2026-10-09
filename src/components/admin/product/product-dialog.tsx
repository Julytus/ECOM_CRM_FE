"use client";

import * as React from "react";
import { useAtom } from "jotai";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

import { productSheetOpenAtom, selectedProductIdAtom } from "./atoms";
import { createProductDetailsQueryOptions } from "@/lib/tanstack/options/product";
import { ProductForm } from "@/components/admin/product/product-form";

export function ProductDialog({ onSaved }: { onSaved?: () => void }) {
  const [open, setOpen] = useAtom(productSheetOpenAtom);
  const [id] = useAtom(selectedProductIdAtom);

  const { data, isLoading } = useQuery({
    ...createProductDetailsQueryOptions({ id: id ?? 0 }),
    enabled: !!id && open
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex h-[100dvh] max-h-[100dvh] w-full max-w-none flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-auto sm:max-h-[95vh] sm:w-[95vw] sm:max-w-[1400px] sm:rounded-lg">
        <DialogHeader className="flex-shrink-0 space-y-1 px-4 pt-5 pb-4 sm:px-6 sm:pt-6">
          <div className="flex items-center gap-2">
            {id ? <span className="text-[10px] font-medium text-stone-400">ID: #{id}</span> : null}
          </div>
          <DialogTitle className="font-serif text-2xl font-bold tracking-tight">
            {id ? "Chỉnh sửa sản phẩm" : "Tạo sản phẩm mới"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {id
              ? "Cập nhật thông tin cho sản phẩm đang chọn."
              : "Nhập thông tin để tạo sản phẩm mới."}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 sm:px-6">
          {isLoading ? (
            <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4 text-stone-400">
              <div className="relative">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-stone-200 border-t-amber-600" />
                <Sparkles className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-amber-600" />
              </div>
              <p className="font-serif text-sm italic">Đang tải dữ liệu sản phẩm...</p>
            </div>
          ) : (
            <ProductForm
              key={id ?? "new-product"}
              product={data}
              onClose={() => setOpen(false)}
              onSaved={onSaved}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
