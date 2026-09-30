"use client";

import * as React from "react";
import { Tag, AlignLeft, PlusCircle, Settings2, FolderOpen } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { CategoryDTO } from "@/lib/types/category";

export function CategoryFormSheet({
  open,
  category,
  onOpenChange,
  onSubmit
}: {
  open: boolean;
  category: CategoryDTO | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Partial<CategoryDTO>) => void;
}) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");

  React.useEffect(() => {
    setName(category?.name ?? "");
    setDescription(category?.description ?? "");
  }, [category, open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className={cn(
          "w-full gap-0 border-l border-stone-200 p-0 sm:max-w-xl",
          "flex flex-col bg-stone-50/95 backdrop-blur-xl"
        )}
      >
        {/* Header Section */}
        <div className="relative border-b border-stone-200 bg-white/50 px-8 py-10 shadow-sm">
          <div className="space-y-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 items-center justify-center rounded-full bg-stone-900 px-2 text-[10px] font-bold tracking-[0.2em] text-white uppercase">
                Phân loại sản phẩm
              </span>
              {category?.id && (
                <span className="text-[10px] font-medium tracking-tighter text-stone-400 uppercase">
                  ID: {category.id}
                </span>
              )}
            </div>

            <SheetHeader className="space-y-0 text-left">
              <SheetTitle className="font-serif text-4xl font-normal tracking-tight text-stone-900">
                {category ? "Cập nhật" : "Tạo mới"}
              </SheetTitle>
              <SheetDescription className="pt-2 font-medium">
                {category
                  ? `Điều chỉnh thông tin danh mục "${category.name}"`
                  : "Thiết lập danh mục mới để phân loại kho hàng của bạn."}
              </SheetDescription>
            </SheetHeader>
          </div>
          <div className="absolute bottom-0 left-0 h-[2px] w-24 bg-stone-900" />
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto px-8 py-10">
          <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-700">
            {/* Visual Icon */}
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-stone-200 bg-white shadow-sm transition-transform hover:rotate-3">
              {category ? (
                <Settings2 className="h-8 w-8 text-stone-600" />
              ) : (
                <PlusCircle className="h-8 w-8 text-stone-400" />
              )}
            </div>

            <div className="space-y-6">
              {/* Name Input */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-stone-400 uppercase">
                  <Tag className="h-3 w-3" /> Tên danh mục
                </Label>
                <Input
                  placeholder="VD: Nội thất phòng khách"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 rounded-xl border-stone-200 bg-white shadow-sm focus-visible:ring-stone-900"
                />
              </div>

              {/* Description Input */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-stone-400 uppercase">
                  <AlignLeft className="h-3 w-3" /> Mô tả chi tiết
                </Label>
                <Textarea
                  placeholder="Mô tả ngắn gọn về nhóm sản phẩm này..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[120px] resize-none rounded-xl border-stone-200 bg-white shadow-sm focus-visible:ring-stone-900"
                />
              </div>
            </div>

            {/* Hint Box */}
            <div className="flex items-start gap-3 rounded-2xl bg-stone-100/50 p-4 text-xs text-stone-500">
              <FolderOpen className="mt-0.5 h-4 w-4 shrink-0 opacity-60" />
              <p className="leading-relaxed">
                Việc phân loại chính xác giúp khách hàng dễ dàng tìm thấy sản phẩm thông qua bộ lọc
                trên website.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-stone-100 bg-white/30 px-8 py-6">
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-full px-6 text-stone-500 hover:text-stone-900"
            >
              Hủy
            </Button>
            <Button
              onClick={() => onSubmit({ id: category?.id, name, description })}
              className="min-w-[140px] rounded-full bg-stone-900 px-8 font-bold tracking-widest text-white uppercase shadow-lg transition-transform hover:scale-[1.02] hover:bg-stone-800 active:scale-95"
            >
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
