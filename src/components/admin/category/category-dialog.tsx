"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormDialog } from "@/components/ui/form-dialog";
import type { CategoryDTO } from "@/lib/types/category";

export function CategoryFormDialog({
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
  const [featured, setFeatured] = React.useState("");

  React.useEffect(() => {
    setName(category?.name ?? "");
    setFeatured(category?.featured ?? "");
  }, [category, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ id: category?.id, name, featured });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={category ? "Chỉnh sửa danh mục" : "Tạo mới danh mục"}
      featured={
        category ? "Cập nhật thông tin danh mục sản phẩm" : "Tạo danh mục mới để phân loại sản phẩm"
      }
      onSubmit={handleSubmit}
      submitLabel={category ? "Cập nhật" : "Tạo mới"}
    >
      <div className="space-y-2">
        <Label htmlFor="category-name">Tên danh mục</Label>
        <Input
          id="category-name"
          name="name"
          placeholder="VD: Nội thất phòng khách"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category-featured">Mô tả</Label>
        <Textarea
          id="category-featured"
          name="featured"
          placeholder="Mô tả ngắn gọn về nhóm sản phẩm này..."
          value={featured}
          onChange={(e) => setFeatured(e.target.value)}
          className="min-h-[100px]"
        />
        <p className="text-muted-foreground text-xs text-pretty">
          Mô tả chi tiết giúp khách hàng hiểu rõ hơn về danh mục sản phẩm.
        </p>
      </div>
    </FormDialog>
  );
}
