"use client";

import { ProductCard } from "@/components/shop/product/product-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Lens } from "@/components/ui/lens";
import { createInfiniteProductDetailsQueryOptions } from "@/lib/tanstack/options/product";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

interface LookbookSectionProps {
  placeholder: null;
}

export function LookbookSection() {
  const [currentImage, setCurrentImage] = useState(0);
  const { data: productsPages } = useInfiniteQuery({
    ...createInfiniteProductDetailsQueryOptions({ opts: {} })
  });

  const products = useMemo(() => {
    return productsPages?.pages.flatMap((page) => page.items) ?? [];
  }, [productsPages]);

  const lookbookImages = [
    {
      url: "https://images.unsplash.com/photo-1617104678098-de229db51175?w=1200&h=900&fit=crop",
      title: "Không gian làm việc hiện đại"
    },
    {
      url: "https://images.unsplash.com/photo-1600494603989-9650cf6ddd3d?w=1200&h=900&fit=crop",
      title: "Phong cách sống tối giản"
    }
  ];

  return (
    <section className="to-background relative bg-gradient-to-b from-gray-100 py-20">
      <div className="bg-border/40 pointer-events-none absolute inset-x-0 top-0 h-px" />
      <div className="bg-border/40 pointer-events-none absolute inset-x-0 bottom-0 h-px" />
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <Badge className="mb-4">Mua theo phong cách</Badge>
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            Khám phá không gian được tuyển chọn
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Sự kết hợp hoàn hảo giữa tiện nghi và phong cách sống hiện đại dành cho bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3 lg:gap-12">
          {/* Lookbook Image */}
          <div className="relative lg:col-span-2">
            <Card className="overflow-hidden rounded-3xl py-0">
              <div className="relative h-full w-full">
                <Lens zoomFactor={2} lensSize={180} isStatic={false} ariaLabel="Zoom Area">
                  <img
                    key={currentImage}
                    src={lookbookImages[currentImage].url || "/placeholder.svg"}
                    alt={lookbookImages[currentImage].title}
                    className="animate-in fade-in zoom-in-105 h-full w-full object-cover transition-all duration-700 ease-out"
                  />
                  <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between">
                    <Card className="px-4 py-2">
                      <span className="text-sm font-medium">
                        {lookbookImages[currentImage].title}
                      </span>
                    </Card>

                    <div className="flex gap-2">
                      {lookbookImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImage(idx)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            currentImage === idx ? "bg-primary w-8" : "bg-muted w-2"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </Lens>
              </div>
            </Card>
          </div>

          {/* Products */}
          <div className="space-y-6 px-0 lg:px-12">
            <div>
              <h3 className="text-3xl leading-tight font-semibold">
                Bắt đầu với những <br /> không gian được chọn lọc
              </h3>
              <p className="text-muted-foreground mt-2">
                Sự giao thoa giữa tiện nghi và phong cách sống hiện đại
              </p>
            </div>

            <Carousel opts={{ align: "start" }} className="relative">
              <CarouselContent className="-ml-4 flex">
                {products.map((p) => (
                  <CarouselItem key={p.id} className="w-1/2 flex-none pl-4 md:w-full">
                    <ProductCard showVariantPicker={false} product={p} />
                  </CarouselItem>
                ))}
              </CarouselContent>

              <div className="mt-4 flex justify-center gap-2">
                {products.map((_, i) => (
                  <span
                    key={i}
                    className="bg-muted data-[active=true]:bg-primary h-2 w-2 rounded-full"
                  />
                ))}
              </div>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
}
