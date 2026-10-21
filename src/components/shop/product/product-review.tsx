"use client";

import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { Star, MessageSquare, ChevronDown, User } from "lucide-react";
import { useInView } from "react-intersection-observer";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
  <div className="flex gap-1" role="img" aria-label={`${rating} trên 5 sao`}>
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={cn("size-3", s <= rating ? "fill-warning text-warning" : "text-border")}
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
    <section className="bg-background border-border border-t py-16 md:py-24">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-20">
          {/* LEFT: Summary & Stats */}
          <div className="space-y-10 lg:col-span-4">
            <div className="lg:sticky lg:top-40">
              <span className="text-muted-foreground mb-4 block text-xs font-semibold tracking-[0.3em] uppercase">
                Xếp hạng & Nhận xét
              </span>
              <div className="mb-8 flex items-baseline gap-4">
                <h2 className="text-foreground text-6xl font-light tracking-tighter tabular-nums md:text-7xl">
                  {avgRating.toFixed(1)}
                </h2>
                <div className="space-y-1">
                  <RatingStars rating={Math.round(avgRating)} />
                  <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                    {totalCount} Đánh giá
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-4">
                    <span className="text-foreground w-3 text-xs font-semibold tabular-nums">
                      {star}
                    </span>
                    <Progress
                      value={star === 5 ? 70 : star === 4 ? 20 : 5}
                      aria-label={`Tỷ lệ ${star} sao`}
                      className="bg-muted [&>div]:bg-foreground h-1"
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
            <div className="border-border mb-10 flex items-center justify-between border-b pb-6">
              <h3 className="text-foreground text-sm font-semibold tracking-[0.15em] uppercase">
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

            <div className="space-y-10">
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
                          <div className="border-border bg-muted flex size-10 items-center justify-center rounded-full border">
                            <User aria-hidden="true" className="text-muted-foreground size-4" />
                          </div>
                          <div>
                            <span className="text-foreground block text-sm font-semibold">
                              Người dùng #{review.userId}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        </div>
                        <RatingStars rating={review.rating} />
                      </div>

                      <div className="pl-13">
                        <p className="text-foreground/85 mb-6 text-sm leading-relaxed">
                          {review.comment || "Không có nội dung bình luận."}
                        </p>

                        {images.length > 0 && (
                          <div className="mb-6 flex gap-2">
                            {images.map((img, idx) => (
                              <div
                                key={idx}
                                className="border-border bg-muted size-20 overflow-hidden rounded-lg border"
                              >
                                <img
                                  src={img}
                                  alt={`Ảnh đính kèm ${idx + 1} của đánh giá`}
                                  loading="lazy"
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Separator />
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
                    <MessageSquare
                      aria-label="Đang tải đánh giá"
                      className="text-muted-foreground size-5"
                    />
                  </motion.div>
                ) : hasNextPage ? (
                  <Button
                    variant="ghost"
                    onClick={() => fetchNextPage()}
                    className="text-muted-foreground hover:text-foreground text-xs font-semibold tracking-[0.2em] uppercase"
                  >
                    Xem thêm <ChevronDown className="ml-2 size-3" />
                  </Button>
                ) : (
                  <span className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
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
