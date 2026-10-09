"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProductImageGalleryScrollProps = {
  images: string[];
  className?: string;
  aspectRatio?: number;
};

/** Product gallery with a bounded, vertically scrollable thumbnail rail. */
export function ProductImageGalleryScroll({
  images,
  className,
  aspectRatio = 4 / 5,
}: ProductImageGalleryScrollProps) {
  const uniqueImages = React.useMemo(
    () => [...new Set(images.filter((image) => image?.trim()))],
    [images],
  );
  const [selectedImage, setSelectedImage] = React.useState(uniqueImages[0] ?? "");
  const thumbnailViewportRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setSelectedImage(uniqueImages[0] ?? "");
  }, [uniqueImages]);

  const scrollThumbnails = (direction: "up" | "down") => {
    thumbnailViewportRef.current?.scrollBy({
      top: direction === "up" ? -240 : 240,
      behavior: "smooth",
    });
  };

  if (!uniqueImages.length) {
    return <div className={cn("aspect-[4/5] rounded-xl bg-neutral-50", className)} />;
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[64px_minmax(0,1fr)] lg:grid-cols-[64px_minmax(0,1fr)]">
        {/* Desktop: bounded thumbnail rail with shadcn controls */}
        <div className="hidden min-h-0 sm:flex sm:flex-col sm:items-center sm:gap-2">
          {uniqueImages.length > 5 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Cuộn ảnh lên"
              className="size-8 shrink-0 rounded-full bg-background"
              onClick={() => scrollThumbnails("up")}
            >
              <ChevronUp className="size-4" />
            </Button>
          )}

          <div
            ref={thumbnailViewportRef}
            className="flex max-h-[500px] min-h-0 w-full flex-col items-center gap-2 overflow-y-auto overscroll-contain scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {uniqueImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                aria-label={`Xem ảnh ${index + 1}`}
                aria-pressed={selectedImage === image}
                onClick={() => setSelectedImage(image)}
                className={cn(
                  "relative aspect-[4/5] w-12 shrink-0 overflow-hidden rounded-lg border-2 bg-neutral-50 transition-all",
                  selectedImage === image
                    ? "border-neutral-900 opacity-100"
                    : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <img src={image} alt={`Ảnh sản phẩm ${index + 1}`} className="size-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>

          {uniqueImages.length > 5 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Cuộn ảnh xuống"
              className="size-8 shrink-0 rounded-full bg-background"
              onClick={() => scrollThumbnails("down")}
            >
              <ChevronDown className="size-4" />
            </Button>
          )}
        </div>

        {/* Main image */}
        <div
          className="relative min-w-0 overflow-hidden rounded-xl bg-neutral-50"
          style={{ aspectRatio }}
        >
          <img
            key={selectedImage}
            src={selectedImage}
            alt="Ảnh sản phẩm đang chọn"
            className="size-full object-contain transition-opacity duration-200"
          />
        </div>

        {/* Mobile: horizontal thumbnail scroller */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:hidden [scrollbar-width:thin]">
          {uniqueImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              aria-label={`Xem ảnh ${index + 1}`}
              aria-pressed={selectedImage === image}
              onClick={() => setSelectedImage(image)}
              className={cn(
                "size-16 shrink-0 overflow-hidden rounded-lg border-2 bg-neutral-50",
                selectedImage === image ? "border-neutral-900" : "border-transparent opacity-70",
              )}
            >
              <img src={image} alt={`Ảnh sản phẩm ${index + 1}`} className="size-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
