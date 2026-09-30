"use client";

import * as React from "react";
import { z } from "zod";
import {
  ChevronDown,
  Plus,
  Trash2,
  Package,
  Layers,
  Settings2,
  Info,
  Wand2,
  ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { useAppForm } from "@/components/form/hooks";
import { FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ImageUploader, MultiImageUploader } from "@/components/image/image-upload";

import {
  createCategoriesQueryOptions,
  createProductMutationOptions,
  updateProductMutationOptions,
  createProductAttributeMutationOptions,
  createProductAttributeOptionMutationOptions,
  createProductVariantMutationOptions,
  updateProductVariantMutationOptions
} from "@/lib/tanstack/options/product";

import type { CreateProductDTO, ProductDetailsDTO, ProductStatus } from "@/lib/types/product";
import { normalizeImages } from "@/lib/format";
import { SelectItem } from "@/components/ui/select";

/* =======================
   Validation Schema
======================= */

const optionSchema = z.object({
  id: z.number().optional(),
  attributeId: z.number().optional(),
  value: z.string().min(1, "Giá trị không được trống")
});

const zFormNumber = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === "number" ? v : Number(v)))
  .refine((v) => !Number.isNaN(v), "Must be a number")
  .refine((v) => v >= 0, "Must be >= 0");

const productFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Tên sản phẩm bắt buộc"),
  description: z.string(),
  categoryId: z.string().nullable(),
  active: z.boolean(),
  thumbnail: z.string().optional(),
  image: z.array(z.string()).optional(),
  attributes: z.array(
    z.object({
      id: z.number().nullish(),
      name: z.string().min(1, "Tên hiển thị bắt buộc"),
      fieldName: z.string().min(1, "Mã field bắt buộc"),
      options: z.array(optionSchema).min(1, "Phải có ít nhất 1 option")
    })
  ),
  variants: z.array(
    z.object({
      id: z.number().nullish(),
      sku: z.string().min(1, "SKU bắt buộc"),
      price: zFormNumber,
      originalPrice: zFormNumber,
      stock: zFormNumber,
      image: z.string().nullish(),
      options: z.record(z.string(), z.string())
    })
  )
});

type ProductFormData = z.input<typeof productFormSchema>;

interface ProductFormProps {
  product?: ProductDetailsDTO;
  onClose: () => void;
}

/* =======================
   Helper resolve options
======================= */

function resolveVariantOptions(
  variantOptions: Record<string, string>,
  attributes: ProductFormData["attributes"]
): number[] {
  return Object.entries(variantOptions).map(([fieldName, value]) => {
    const attr = attributes.find((a) => a.fieldName === fieldName);
    if (!attr || !attr.id) throw new Error(`Attribute not found: ${fieldName}`);

    const opt = attr.options.find((o) => o.value === value && o.id);
    if (!opt || !opt.id) throw new Error(`Option not found: ${fieldName}=${value}`);

    return opt.id;
  });
}

/* =======================
   Main Component
======================= */

export function ProductForm({ product, onClose }: ProductFormProps) {
  const isEdit = !!product?.id;
  const [openSection, setOpenSection] = React.useState<string | null>("base");

  const { data: categories = [] } = useQuery(createCategoriesQueryOptions());

  const createProduct = useMutation(createProductMutationOptions());
  const updateProduct = useMutation(updateProductMutationOptions());
  const createAttr = useMutation(createProductAttributeMutationOptions());
  const createOpt = useMutation(createProductAttributeOptionMutationOptions());
  const createVar = useMutation(createProductVariantMutationOptions());
  const updateVar = useMutation(updateProductVariantMutationOptions());

  const form = useAppForm({
    defaultValues: {
      id: product?.id,
      name: product?.name ?? "",
      description: product?.description ?? "",
      categoryId: product?.categoryId ? String(product.categoryId) : null,
      active: product?.active === 1,
      thumbnail: product?.thumbnail ?? "",
      image: (() => {
        if (!product?.image) return [];
        if (Array.isArray(product.image)) return product.image;
        if (typeof product.image === "string") {
          try {
            const parsed = JSON.parse(product.image);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }
        return [];
      })(),
      attributes:
        product?.attributes.map((a) => ({
          id: a.id,
          name: a.name,
          fieldName: a.fieldName,
          options: a.options.map((o) => ({ id: o.id, attributeId: o.attributeId, value: o.value }))
        })) ?? [],
      variants:
        product?.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          price: v.price,
          originalPrice: v.originalPrice,
          stock: v.stock,
          image: v.image,
          options: v.options
        })) ?? []
    } as ProductFormData,
    validators: { onSubmit: productFormSchema },
    onSubmit: async ({ value }) => {
      console.log("onSubmit triggered with value:", value);
      const loading = toast.loading("Đang lưu...");
      try {
        let productId = product?.id;
        const status: ProductStatus = value.active ? 1 : 0;

        const productPayload = {
          id: productId,
          name: value.name,
          description: value.description,
          categoryId: value.categoryId ? Number(value.categoryId) : null,
          active: status,
          thumbnail: value.thumbnail,
          image: normalizeImages(value.image).toString()
        };

        if (isEdit && productId) {
          await updateProduct.mutateAsync(productPayload);
        } else {
          const res = await createProduct.mutateAsync(productPayload);
          productId = res.id;
        }

        if (!productId) throw new Error("Missing productId");

        for (const attr of value.attributes) {
          const attrRes = await createAttr.mutateAsync({
            id: attr.id,
            productId,
            name: attr.name,
            fieldName: attr.fieldName
          });

          const attrId = attrRes.id;

          for (const opt of attr.options) {
            await createOpt.mutateAsync({
              id: opt.id,
              attributeId: attrId as number,
              value: opt.value
            });
          }
        }

        for (const variant of value.variants) {
          const resolvedOptions = resolveVariantOptions(variant.options, value.attributes);

          const varPayload = {
            productId,
            sku: variant.sku,
            price: Number(variant.price),
            stock: Number(variant.stock),
            image: variant.image,
            attributeValueIds: resolvedOptions
          };

          if (variant.id) {
            await updateVar.mutateAsync({ id: variant.id, ...varPayload });
          } else {
            await createVar.mutateAsync(varPayload);
          }
        }

        toast.success("Đã lưu", { id: loading });
        onClose();
      } catch (e: any) {
        toast.error(e.message || "Không thể lưu dữ liệu", { id: loading });
      }
    }
  });

  const addEmptyVariant = () => {
    form.pushFieldValue("variants", {
      sku: "",
      price: 0,
      originalPrice: 0,
      stock: 0,
      image: undefined,
      options: {}
    });
  };

  /* =======================
     Render
  ======================= */

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-28">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <FormSection
          title="Thông tin cơ bản"
          description="Định danh tên, danh mục và trạng thái hiển thị."
          icon={<Package className="h-5 w-5" />}
          isOpen={openSection === "base"}
          onOpenChange={() => setOpenSection(openSection === "base" ? null : "base")}
        >
          <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <form.AppField name="name">
              {(field) => (
                <field.Input label="Tên sản phẩm*" placeholder="Ví dụ: Tủ Áo Crystal 6 Cánh" />
              )}
            </form.AppField>

            <form.AppField name="categoryId">
              {(field) => {
                const selected = categories.find((c) => String(c.id) === field.state.value);

                return (
                  <field.Select
                    label="Danh mục"
                    placeholder={selected ? selected.name : "Chọn danh mục"}
                  >
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </field.Select>
                );
              }}
            </form.AppField>

            <div className="md:col-span-2">
              <form.AppField name="description">
                {(field) => (
                  <field.Textarea
                    label="Mô tả chi tiết"
                    placeholder="Mô tả tính năng, chất liệu nghệ thuật..."
                  />
                )}
              </form.AppField>
            </div>

            <form.AppField name="active">
              {(field) => <field.Checkbox label="Kích hoạt kinh doanh (Hiển thị ngay)" />}
            </form.AppField>
          </FieldGroup>
        </FormSection>

        {/* SECTION 2: IMAGES & MEDIA */}
        <FormSection
          title="Hình ảnh & Truyền thông"
          description="Quản lý ảnh Thumbnail và Bộ sưu tập ảnh sản phẩm."
          icon={<ImageIcon className="h-5 w-5" />}
          isOpen={openSection === "media"}
          onOpenChange={() => setOpenSection(openSection === "media" ? null : "media")}
        >
          <div className="space-y-8">
            {/* Thumbnail Uploader */}
            <form.AppField name="thumbnail">
              {(field) => (
                <ImageUploader
                  value={field.state.value || ""}
                  onChange={(url) => field.handleChange(url)}
                  label="Ảnh đại diện"
                  // error={field.state.meta.errors?.[0]}
                />
              )}
            </form.AppField>

            {/* Gallery Uploader */}
            <form.AppField name="image">
              {(field) => (
                <MultiImageUploader
                  values={field.state.value || []}
                  onChange={(urls) => field.handleChange(urls)}
                  label="Bộ sưu tập (Gallery)"
                  maxImages={10}
                />
              )}
            </form.AppField>
          </div>
        </FormSection>

        {/* SECTION 3: ATTRIBUTES */}
        {isEdit && (
          <FormSection
            title="Thuộc tính sản phẩm"
            description="Định nghĩa Màu sắc, Kích thước hoặc Chất liệu riêng."
            icon={<Layers className="h-5 w-5" />}
            isOpen={openSection === "attr"}
            onOpenChange={() => setOpenSection(openSection === "attr" ? null : "attr")}
          >
            <form.AppField name="attributes">
              {(field) => (
                <div className="space-y-6">
                  {field.state.value.map((_, i) => (
                    <div
                      key={i}
                      className="relative space-y-4 rounded-2xl border bg-stone-50/30 p-8"
                    >
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <form.AppField name={`attributes[${i}].name`}>
                          {(f) => <f.Input label="Tên hiển thị" placeholder="Ví dụ: Màu sắc" />}
                        </form.AppField>
                        <form.AppField name={`attributes[${i}].fieldName`}>
                          {(f) => <f.Input label="Mã field (slug)" placeholder="Ví dụ: color" />}
                        </form.AppField>
                      </div>

                      <form.AppField name={`attributes[${i}].options`}>
                        {(optField) => (
                          <div className="space-y-3">
                            <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">
                              Giá trị thuộc tính
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {optField.state.value.map((_, j) => (
                                <div
                                  key={j}
                                  className="flex items-center gap-1.5 rounded-xl border border-stone-100 bg-white px-3 py-1.5 shadow-sm"
                                >
                                  <form.AppField name={`attributes[${i}].options[${j}]`}>
                                    {(innerF) => (
                                      <input
                                        value={innerF.state.value.value}
                                        onChange={(e) =>
                                          innerF.setValue({
                                            ...innerF.state.value,
                                            value: e.target.value
                                          })
                                        }
                                        className="w-20 bg-transparent text-sm outline-none"
                                      />
                                    )}
                                  </form.AppField>
                                  {/* <button type="button" onClick={() => optField.removeValue(j)}>
                                  <Trash2 className="h-3 w-3 text-stone-300 hover:text-red-500" />
                                </button> */}
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-9 rounded-xl border-dashed"
                                onClick={() => optField.pushValue({ value: "" })}
                              >
                                <Plus className="mr-1 h-3 w-3" /> Thêm
                              </Button>
                            </div>
                          </div>
                        )}
                      </form.AppField>
                    </div>
                  ))}
                </div>
              )}
            </form.AppField>
          </FormSection>
        )}

        {/* SECTION 4: VARIANTS */}
        {isEdit && (
          <FormSection
            title="Quản lý Biến thể"
            description="Giá, Kho và SKU riêng biệt cho từng loại sản phẩm."
            icon={<Settings2 className="h-5 w-5" />}
            isOpen={openSection === "variants"}
            onOpenChange={() => setOpenSection(openSection === "variants" ? null : "variants")}
          >
            <div className="mb-8 flex items-center justify-between rounded-2xl border-stone-800 bg-stone-900 p-6 text-white shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-white/10 p-3">
                  <Wand2 className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-bold">Quản lý biến thể</p>
                  <p className="text-[10px] font-medium text-stone-400">Thêm thủ công</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addEmptyVariant}
                  className="bg-white text-black hover:bg-stone-200"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Thêm biến thể
                </Button>
              </div>
            </div>

            <form.AppField name="variants">
              {(field) => (
                <div className="space-y-6">
                  {field.state.value.map((v, i) => (
                    <div
                      key={i}
                      className="space-y-6 rounded-3xl border border-stone-100 bg-white p-8 shadow-sm transition-all hover:border-amber-100"
                    >
                      <div className="flex flex-col gap-8 md:flex-row">
                        {/* Variant Image Uploader */}
                        <div className="flex-shrink-0">
                          <form.AppField name={`variants[${i}].image`}>
                            {(imgField) => (
                              <ImageUploader
                                compact
                                value={imgField.state.value || ""}
                                onChange={(url) => imgField.handleChange(url)}
                                className="w-32"
                              />
                            )}
                          </form.AppField>
                        </div>

                        <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-3">
                          <form.AppField name={`variants[${i}].sku`}>
                            {(f) => <f.Input label="Mã SKU" />}
                          </form.AppField>
                          <form.AppField name={`variants[${i}].price`}>
                            {(f) => <f.Input label="Giá bán (VNĐ)" />}
                          </form.AppField>
                          <form.AppField name={`variants[${i}].originalPrice`}>
                            {(f) => <f.Input label="Giá gốc (VNĐ)" />}
                          </form.AppField>
                          <form.AppField name={`variants[${i}].stock`}>
                            {(f) => <f.Input label="Tồn kho" />}
                          </form.AppField>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 p-5">
                        <div className="flex items-center gap-2 border-r border-stone-200 pr-2 text-stone-400">
                          <Info className="h-4 w-4" />
                          <span className="text-[10px] font-bold tracking-widest uppercase">
                            Phân loại
                          </span>
                        </div>
                        {form.state.values.attributes.map((attr, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 rounded-lg border border-stone-100 bg-white px-3 py-1.5 shadow-sm"
                          >
                            <span className="text-xs font-bold text-stone-500">{attr.name}:</span>
                            <select
                              className="bg-transparent text-xs font-semibold text-stone-900 outline-none"
                              value={v.options[attr.fieldName] || ""}
                              onChange={(e) => {
                                const currentVariants = form.getFieldValue("variants") ?? [];
                                const currentVariant = currentVariants[i];
                                const updatedOptions = {
                                  ...currentVariant.options,
                                  [attr.fieldName]: e.target.value
                                };
                                form.setFieldValue(`variants[${i}].options`, updatedOptions);
                              }}
                            >
                              <option value="">Chọn...</option>
                              {attr.options
                                .filter((o) => o.id)
                                .map((o) => (
                                  <option key={o.id} value={o.value}>
                                    {o.value}
                                  </option>
                                ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </form.AppField>
          </FormSection>
        )}

        {/* FLOATING ACTION BAR */}
        <div className="fixed right-10 bottom-10 z-50 flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-14 rounded-full border-stone-200 bg-white/80 px-8 shadow-xl backdrop-blur-md"
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={form.state.isSubmitting}
            className="h-16 rounded-full bg-stone-900 px-12 font-bold tracking-widest text-white uppercase shadow-2xl transition-all hover:scale-105 hover:bg-stone-800"
          >
            {form.state.isSubmitting ? "Đang xử lý..." : "Lưu tác phẩm"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function FormSection({ title, description, icon, children, isOpen, onOpenChange }: any) {
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={onOpenChange}
      className="mb-8 overflow-hidden rounded-[32px] border border-stone-100 bg-white transition-all duration-500 data-[state=open]:border-amber-100 data-[state=open]:shadow-2xl"
    >
      <CollapsibleTrigger asChild>
        <button className="group flex w-full items-center justify-between p-10 text-left transition-colors outline-none hover:bg-stone-50/50">
          <div className="flex items-center gap-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-50 text-stone-400 transition-all duration-300 group-hover:bg-amber-50 group-hover:text-amber-600">
              {React.cloneElement(icon, { className: "h-7 w-7" })}
            </div>
            <div>
              <h4 className="mb-1 text-xl font-bold tracking-tight text-stone-900 uppercase">
                {title}
              </h4>
              <p className="text-sm font-medium text-stone-400 opacity-80">{description}</p>
            </div>
          </div>
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300",
              isOpen ? "rotate-180 bg-stone-900 text-white" : "bg-white text-stone-300"
            )}
          >
            <ChevronDown className="h-5 w-5" />
          </div>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Separator className="mx-10 w-auto opacity-30" />
        <div className="animate-in fade-in slide-in-from-top-4 p-10 pt-8 duration-500">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
