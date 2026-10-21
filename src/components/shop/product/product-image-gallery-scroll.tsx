"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProductImageGalleryScrollProps = {
  images: string[];
  className?: string;
  aspectRatio?: number;
  /** Product name, used to build descriptive alt text. */
  alt?: string;
};

/** Product gallery with a bounded, vertically scrollable thumbnail rail. */
export function ProductImageGalleryScroll({
  images,
  className,
  aspectRatio = 4 / 5,
  alt = "Sản phẩm"
}: ProductImageGalleryScrollProps) {
  const uniqueImages = React.useMemo(
    () => [...new Set(images.filter((image) => image?.trim()))],
    [images]
  );
  const [selectedImage, setSelectedImage] = React.useState(uniqueImages[0] ?? "");
  const thumbnailViewportRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setSelectedImage(uniqueImages[0] ?? "");
  }, [uniqueImages]);

  const scrollThumbnails = (direction: "up" | "down") => {
    thumbnailViewportRef.current?.scrollBy({
      top: direction === "up" ? -240 : 240,
      behavior: "smooth"
    });
  };

  if (!uniqueImages.length) {
    return <div className={cn("bg-muted aspect-[4/5] rounded-xl", className)} />;
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
              className="bg-background size-8 shrink-0 rounded-full"
              onClick={() => scrollThumbnails("up")}
            >
              <ChevronUp className="size-4" />
            </Button>
          )}

          <div
            ref={thumbnailViewportRef}
            className="flex max-h-[500px] min-h-0 w-full flex-col items-center gap-2 overflow-y-auto overscroll-contain scroll-smooth py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {uniqueImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                aria-label={`Xem ảnh ${index + 1} của ${alt}`}
                aria-pressed={selectedImage === image}
                onClick={() => setSelectedImage(image)}
                className={cn(
                  "bg-muted focus-visible:ring-ring/60 focus-visible:ring-offset-background relative aspect-[4/5] w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  selectedImage === image
                    ? "border-foreground opacity-100"
                    : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                <img
                  src={image}
                  alt=""
                  aria-hidden="true"
                  className="size-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>

          {uniqueImages.length > 5 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Cuộn ảnh xuống"
              className="bg-background size-8 shrink-0 rounded-full"
              onClick={() => scrollThumbnails("down")}
            >
              <ChevronDown className="size-4" />
            </Button>
          )}
        </div>

        {/* Main image */}
        <div
          className="bg-muted relative min-w-0 overflow-hidden rounded-xl"
          style={{ aspectRatio }}
        >
          <img
            key={selectedImage}
            src={selectedImage}
            alt={`${alt} – ảnh ${Math.max(uniqueImages.indexOf(selectedImage), 0) + 1}/${uniqueImages.length}`}
            className="size-full object-contain transition-opacity duration-200"
          />
        </div>

        {/* Mobile: horizontal thumbnail scroller */}
        <div className="flex gap-2 overflow-x-auto p-1 pb-2 [scrollbar-width:thin] sm:hidden">
          {uniqueImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              aria-label={`Xem ảnh ${index + 1} của ${alt}`}
              aria-pressed={selectedImage === image}
              onClick={() => setSelectedImage(image)}
              className={cn(
                "bg-muted focus-visible:ring-ring/60 size-16 shrink-0 overflow-hidden rounded-lg border-2 outline-none focus-visible:ring-2",
                selectedImage === image ? "border-foreground" : "border-transparent opacity-70"
              )}
            >
              <img
                src={image}
                alt=""
                aria-hidden="true"
                className="size-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
