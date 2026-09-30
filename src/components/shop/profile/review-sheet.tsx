"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Star, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/image/image-with-fallback";
import { cn } from "@/lib/utils";
import { createProductReviewMutationOptions } from "@/lib/tanstack/options/review";
import type { OrderItemDTO } from "@/lib/types/order";
import { meQueryOptions } from "@/lib/tanstack/options/auth";

const reviewSchema = z.object({
  reviews: z.array(
    z.object({
      orderItemId: z.number(),
      rating: z.number().min(1).max(5),
      comment: z.string().min(1, "Vui lòng nhập nhận xét").max(1000)
    })
  )
});

type FormValues = z.infer<typeof reviewSchema>;

interface ReviewSheetProps {
  items: OrderItemDTO[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewSubmitted?: () => void;
  orderId: number;
}

export function ReviewSheet({
  items,
  open,
  onOpenChange,
  onReviewSubmitted,
  orderId
}: ReviewSheetProps) {
  const queryClient = useQueryClient();
  const createMutation = useMutation(createProductReviewMutationOptions());
  const { data: me } = useQuery(meQueryOptions);

  const form = useForm({
    defaultValues: {
      reviews: items.map((item) => ({
        orderItemId: item.id,
        rating: 5,
        comment: ""
      }))
    } as FormValues,
    validators: {
      onChange: reviewSchema
    },
    onSubmit: async ({ value }) => {
      try {
        const promises = value.reviews.map((review) => {
          const item = items.find((i) => i.id === review.orderItemId);
          if (!item) return Promise.resolve();

          return createMutation.mutateAsync({
            userId: me?.id,
            orderId: orderId,
            orderItemId: item.id,
            productId: item.productId,
            productVariantId: item.productVariantId,
            rating: review.rating,
            comment: review.comment,
            files: null
          });
        });

        await Promise.all(promises);
        toast.success("Cảm ơn bạn đã gửi đánh giá!");

        queryClient.invalidateQueries({ queryKey: ["orders"] });
        onReviewSubmitted?.();

        setTimeout(() => {
          onOpenChange(false);
        }, 400);
      } catch (error) {
        toast.error("Có lỗi xảy ra khi gửi đánh giá.");
      }
    }
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-screen w-full flex-col gap-0 border-l border-stone-200 bg-stone-50/95 p-0 backdrop-blur-xl sm:max-w-md"
      >
        <div className="border-b border-stone-200 bg-white/50 px-6 py-8">
          <SheetHeader className="text-left">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 text-white">
              <Star className="h-4 w-4 fill-current" />
            </div>
            <SheetTitle className="font-serif text-3xl font-normal tracking-tight text-stone-900">
              Đánh giá sản phẩm
            </SheetTitle>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="space-y-10">
            {items.map((item, index) => (
              <div key={item.id} className="group relative space-y-4">
                {/* Header info */}
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-stone-200">
                    <ImageWithFallback
                      src={item.productVariantImage ?? ""}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">
                      Sản phẩm #{index + 1}
                    </p>
                    <p className="truncate font-serif text-sm text-stone-900">{item.productName}</p>
                  </div>
                </div>

                <div className="space-y-4 rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm">
                  {/* FIX: Use array index syntax [index] instead of .index */}
                  <form.Field
                    name={`reviews[${index}].rating` as any}
                    children={(field) => (
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">
                          Mức độ hài lòng
                        </label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => field.handleChange(star as any)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={cn(
                                  "h-6 w-6 transition-colors",
                                  star <= field.state.value
                                    ? "fill-stone-900 text-stone-900"
                                    : "text-stone-200"
                                )}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  />

                  {/* FIX: Use array index syntax [index] instead of .index */}
                  <form.Field
                    name={`reviews[${index}].comment` as any}
                    children={(field) => (
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">
                          Nhận xét chi tiết
                        </label>
                        <Textarea
                          placeholder="Sản phẩm rất tuyệt vời..."
                          className="min-h-[100px] resize-none border-stone-100 bg-stone-50/50 p-4 text-sm"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value as any)}
                        />
                      </div>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-stone-100 bg-white/30 px-6 py-6 backdrop-blur-md">
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                type="button"
                onClick={() => form.handleSubmit()}
                disabled={!canSubmit || isSubmitting}
                className="h-14 w-full rounded-full bg-stone-900 font-bold tracking-[0.2em] text-white uppercase shadow-xl"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Gửi tất cả đánh giá <CheckCircle2 className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
