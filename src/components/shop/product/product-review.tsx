"use client";

import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { Star, MessageSquare, ChevronDown, Filter, User } from "lucide-react";
import { useInView } from "react-intersection-observer";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createInfiniteProductReviewsQueryOptions } from "@/lib/tanstack/options/review";

// --- Types based on your provided schema ---
interface ReviewItemDTO {
  id: number;
  orderId: number;
  orderItemId: number;
  productId: number;
  productVariantId: number;
  userId: number;
  rating: number;
  comment: string | null;
  files: string | null; // Assuming comma-separated or JSON string
  createdAt: string;
}

const RatingStars = ({ rating }: { rating: number }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={cn(
          "size-3",
          s <= rating ? "fill-neutral-900 text-neutral-900" : "text-neutral-200"
        )}
      />
    ))}
  </div>
);

export function ProductReviews({
  productId,
  avgRating = 0
}: {
  productId: number;
  avgRating?: number;
}) {
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    createInfiniteProductReviewsQueryOptions({
      opts: { productId, paging: { limit: 5 } }
    })
  );

  React.useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView, hasNextPage, fetchNextPage]);

  const allReviews = data?.pages.flatMap((page) => page.items) ?? [];
  const totalCount = data?.pages[0]?.total ?? 0;

  return (
    <section className="bg-background border-t border-neutral-100 py-24">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-20 lg:grid-cols-12">
          {/* LEFT: Summary & Stats */}
          <div className="space-y-10 lg:col-span-4">
            <div className="sticky top-40">
              <span className="mb-4 block text-[10px] font-bold tracking-[0.4em] text-neutral-400 uppercase">
                Xếp hạng & Nhận xét
              </span>
              <div className="mb-8 flex items-baseline gap-4">
                <h2 className="text-7xl font-light tracking-tighter text-neutral-900">
                  {avgRating.toFixed(1)}
                </h2>
                <div className="space-y-1">
                  <RatingStars rating={Math.round(avgRating)} />
                  <p className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                    {totalCount} Đánh giá
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-4">
                    <span className="w-2 text-[10px] font-bold text-neutral-900">{star}</span>
                    <Progress
                      value={star === 5 ? 70 : star === 4 ? 20 : 5}
                      className="h-[2px] bg-neutral-100 [&>div]:bg-neutral-900"
                    />
                  </div>
                ))}
              </div>

              {/* <Button className="mt-12 h-14 w-full rounded-none bg-neutral-900 text-[10px] font-bold tracking-[0.2em] uppercase transition-all hover:bg-neutral-800">
                Viết nhận xét của bạn
              </Button> */}
            </div>
          </div>

          {/* RIGHT: Review List */}
          <div className="lg:col-span-8">
            <div className="mb-12 flex items-center justify-between border-b border-neutral-100 pb-8">
              <h3 className="text-[11px] font-bold tracking-[0.2em] text-neutral-900 uppercase">
                Tất cả đánh giá ({totalCount})
              </h3>
              {/* <Select defaultValue="latest">
                <SelectTrigger className="w-[140px] border-none bg-transparent text-[10px] font-bold tracking-widest uppercase focus:ring-0">
                  <Filter className="mr-2 size-3" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Mới nhất</SelectItem>
                  <SelectItem value="highest">Cao nhất</SelectItem>
                  <SelectItem value="lowest">Thấp nhất</SelectItem>
                </SelectContent>
              </Select> */}
            </div>

            <div className="space-y-16">
              <AnimatePresence mode="popLayout">
                {allReviews.map((review: ReviewItemDTO, i) => {
                  const images = review.files ? review.files.split(",") : [];

                  return (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (i % 5) * 0.1 }}
                      className="group"
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-full border border-neutral-100 bg-neutral-50">
                            <User className="size-4 text-neutral-400" />
                          </div>
                          <div>
                            <span className="block text-[11px] font-bold tracking-tight text-neutral-900 uppercase">
                              Người dùng #{review.userId}
                            </span>
                            <span className="text-[9px] tracking-wider text-neutral-400 uppercase">
                              {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        </div>
                        <RatingStars rating={review.rating} />
                      </div>

                      <div className="pl-13">
                        <p className="mb-6 text-sm leading-relaxed font-light text-neutral-600">
                          {review.comment || "Không có nội dung bình luận."}
                        </p>

                        {images.length > 0 && (
                          <div className="mb-6 flex gap-2">
                            {images.map((img, idx) => (
                              <div
                                key={idx}
                                className="size-20 overflow-hidden border border-neutral-100 bg-neutral-50"
                              >
                                <img
                                  src={img}
                                  alt="Review attachment"
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Separator className="bg-neutral-50" />
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Infinite Scroll Trigger */}
              <div ref={ref} className="flex flex-col items-center pt-10">
                {isFetchingNextPage ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <MessageSquare className="size-5 text-neutral-300" />
                  </motion.div>
                ) : hasNextPage ? (
                  <Button
                    variant="ghost"
                    onClick={() => fetchNextPage()}
                    className="text-[10px] font-bold tracking-[0.2em] text-neutral-400 uppercase hover:text-neutral-900"
                  >
                    Xem thêm <ChevronDown className="ml-2 size-3" />
                  </Button>
                ) : (
                  <span className="text-[9px] font-bold tracking-[0.3em] text-neutral-200 uppercase">
                    Hết danh sách đánh giá
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
