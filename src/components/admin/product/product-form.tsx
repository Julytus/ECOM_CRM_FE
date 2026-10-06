"use client";

import * as React from "react";
import { z } from "zod";
import { Plus, Trash2, Package, Layers, Settings2, Wand2, ImageIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { useAppForm } from "@/components/form/hooks";
import { FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { ImageUploader, MultiImageUploader } from "@/components/image/image-upload";
import { VerticalStepper } from "./vertical-stepper";
import { ProductVariantTable } from "./product-variant-table";
import type { ProductVariant } from "./product-variant-table";

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
   Helper: Generate Variants
======================= */

function generateVariants(attributes: ProductFormData["attributes"]): ProductVariant[] {
  if (attributes.length === 0) return [];

  // Generate all combinations of attribute options
  function cartesian(arrays: string[][]): string[][] {
    return arrays.reduce((acc, curr) => acc.flatMap((a) => curr.map((b) => [...a, b])), [
      []
    ] as string[][]);
  }

  const optionArrays = attributes.map((attr) => attr.options.map((opt) => opt.value));
  const combinations = cartesian(optionArrays);

  return combinations.map((combo, index) => {
    const options: Record<string, string> = {};
    attributes.forEach((attr, i) => {
      options[attr.fieldName] = combo[i];
    });

    const optionsLabel = combo.join(" / ");
    const sku = `SKU-${Date.now()}-${index + 1}`;

    return {
      id: null,
      sku,
      price: 0,
      originalPrice: 0,
      stock: 0,
      image: null,
      options,
      optionsLabel
    };
  });
}

/* =======================
   Main Component
======================= */

export function ProductForm({ product, onClose }: ProductFormProps) {
  const isEdit = !!product?.id;
  const [currentStep, setCurrentStep] = React.useState(1);
  const [generatedVariants, setGeneratedVariants] = React.useState<ProductVariant[]>([]);

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

  const addEmptyAttribute = () => {
    form.pushFieldValue("attributes", {
      id: null,
      name: "",
      fieldName: "",
      options: [{ value: "" }]
    });
  };

  const handleGenerateVariants = () => {
    const attributes = form.getFieldValue("attributes") || [];

    if (attributes.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 thuộc tính");
      return;
    }

    const hasEmptyOptions = attributes.some(
      (attr) =>
        !attr.options || attr.options.length === 0 || attr.options.some((opt) => !opt.value.trim())
    );

    if (hasEmptyOptions) {
      toast.error("Vui lòng điền đầy đủ giá trị thuộc tính");
      return;
    }

    const variants = generateVariants(attributes);
    setGeneratedVariants(variants);
    form.setFieldValue("variants", variants);
    toast.success(`Đã tạo ${variants.length} biến thể`);
    setCurrentStep(4);
  };

  const steps = [
    {
      id: 1,
      title: "Thông tin cơ bản",
      description: "Tên, danh mục, mô tả",
      completed: currentStep > 1
    },
    { id: 2, title: "Hình ảnh", description: "Thumbnail và gallery", completed: currentStep > 2 },
    {
      id: 3,
      title: "Thuộc tính",
      description: "Màu sắc, kích thước, ...",
      completed: currentStep > 3
    },
    { id: 4, title: "Biến thể", description: "Giá, kho, SKU", completed: false }
  ];

  /* =======================
     Render
  ======================= */

  /* Render Step 1: Basic Info */
  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
          <Package className="text-primary h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold">Thông tin cơ bản</h3>
          <p className="text-muted-foreground text-xs">Tên, danh mục và trạng thái</p>
        </div>
      </div>

      <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

      <div className="flex justify-end pt-4">
        <Button type="button" onClick={() => setCurrentStep(2)}>
          Tiếp theo →
        </Button>
      </div>
    </div>
  );

  /* Render Step 2: Images */
  const renderImages = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
          <ImageIcon className="text-primary h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold">Hình ảnh & Truyền thông</h3>
          <p className="text-muted-foreground text-xs">Thumbnail và gallery</p>
        </div>
      </div>

      <div className="space-y-6">
        <form.AppField name="thumbnail">
          {(field) => (
            <ImageUploader
              value={field.state.value || ""}
              onChange={(url) => field.handleChange(url)}
              label="Ảnh đại diện"
            />
          )}
        </form.AppField>

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

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
          ← Quay lại
        </Button>
        <Button type="button" onClick={() => setCurrentStep(3)}>
          Tiếp theo →
        </Button>
      </div>
    </div>
  );

  /* Render Step 3: Attributes */
  const renderAttributes = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
          <Layers className="text-primary h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold">Thuộc tính sản phẩm</h3>
          <p className="text-muted-foreground text-xs">Định nghĩa màu sắc, kích thước, chất liệu</p>
        </div>
      </div>

      <form.AppField name="attributes">
        {(field) => (
          <div className="space-y-3">
            {field.state.value.map((_, i) => (
              <div key={i} className="bg-muted/30 rounded-lg border p-4">
                <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <form.AppField name={`attributes[${i}].name`}>
                    {(f) => <f.Input label="Tên hiển thị" placeholder="Ví dụ: Màu sắc" />}
                  </form.AppField>
                  <form.AppField name={`attributes[${i}].fieldName`}>
                    {(f) => <f.Input label="Mã field (slug)" placeholder="Ví dụ: color" />}
                  </form.AppField>
                </div>

                <form.AppField name={`attributes[${i}].options`}>
                  {(optField) => (
                    <div className="space-y-2">
                      <p className="text-muted-foreground text-xs font-medium">
                        Giá trị thuộc tính
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {optField.state.value.map((_, j) => (
                          <div
                            key={j}
                            className="bg-background flex items-center gap-1.5 rounded-md border px-2 py-1"
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
                                  placeholder="Giá trị"
                                  className="w-16 bg-transparent text-sm outline-none"
                                />
                              )}
                            </form.AppField>
                            <button
                              type="button"
                              onClick={() => optField.removeValue(j)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => optField.pushValue({ value: "" })}
                          className="h-7"
                        >
                          <Plus className="mr-1 h-3 w-3" /> Thêm
                        </Button>
                      </div>
                    </div>
                  )}
                </form.AppField>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => field.removeValue(i)}
                  className="text-destructive hover:text-destructive mt-3"
                >
                  <Trash2 className="mr-1 h-3 w-3" /> Xóa thuộc tính
                </Button>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addEmptyAttribute} className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Thêm thuộc tính mới
            </Button>
          </div>
        )}
      </form.AppField>

      {/* Generate Variants Button */}
      <div className="border-primary/20 bg-primary/5 rounded-lg border-2 border-dashed p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-md">
            <Sparkles className="text-primary h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Tự động tạo biến thể</p>
            <p className="text-muted-foreground text-xs">
              Tạo tất cả tổ hợp từ các thuộc tính đã định nghĩa
            </p>
          </div>
        </div>
        <Button type="button" onClick={handleGenerateVariants} className="w-full">
          <Wand2 className="mr-2 h-4 w-4" />
          Tạo biến thể tự động
        </Button>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
          ← Quay lại
        </Button>
      </div>
    </div>
  );

  /* Render Step 4: Variants Table */
  const renderVariants = () => {
    const attributes = form.getFieldValue("attributes") || [];

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <Settings2 className="text-primary h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold">Quản lý Biến thể</h3>
            <p className="text-muted-foreground text-xs">
              Chỉnh sửa giá, kho, SKU cho từng biến thể
            </p>
          </div>
        </div>

        {/* Subscribe trực tiếp vào field variants để table re-render ngay sau khi edit. */}
        <form.AppField name="variants">
          {(field) => {
            const variants: ProductVariant[] = (field.state.value || []).map((variant) => ({
              ...variant,
              price: Number(variant.price),
              originalPrice: Number(variant.originalPrice),
              stock: Number(variant.stock)
            }));

            return variants.length === 0 ? (
              <div className="bg-muted/20 rounded-lg border-2 border-dashed p-12 text-center">
                <Settings2 className="text-muted-foreground/50 mx-auto mb-4 h-12 w-12" />
                <p className="mb-2 font-medium">Chưa có biến thể nào</p>
                <p className="text-muted-foreground mb-4 text-sm">
                  Quay lại bước 3 để định nghĩa thuộc tính và tạo biến thể
                </p>
                <Button type="button" variant="outline" onClick={() => setCurrentStep(3)}>
                  ← Quay lại bước 3
                </Button>
              </div>
            ) : (
              <ProductVariantTable
                variants={variants}
                attributes={attributes.map((a) => ({
                  name: a.name,
                  fieldName: a.fieldName
                }))}
                onVariantsChange={(newVariants) => field.handleChange(newVariants)}
              />
            );
          }}
        </form.AppField>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={() => setCurrentStep(3)}>
            ← Quay lại
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-w-0 flex-col gap-6 lg:flex-row">
      {/* Left: Stepper */}
      <div className="w-full shrink-0 lg:w-52">
        <VerticalStepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={(stepId) => setCurrentStep(stepId)}
        />
      </div>

      {/* Right: Content */}
      <div className="min-w-0 flex-1">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          {currentStep === 1 && renderBasicInfo()}
          {currentStep === 2 && renderImages()}
          {currentStep === 3 && renderAttributes()}
          {currentStep === 4 && renderVariants()}

          <div className="mt-6 flex flex-col-reverse items-stretch gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Hủy bỏ
            </Button>

            <Button type="submit" disabled={form.state.isSubmitting} className="w-full sm:w-auto">
              {form.state.isSubmitting ? "Đang xử lý..." : "Lưu sản phẩm"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
