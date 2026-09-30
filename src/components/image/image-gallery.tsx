"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { ImageWithFallback } from "@/components/image/image-with-fallback";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { BentoGrid, type BentoPattern } from "@/components/bento";

interface ImageGalleryProps {
  images: string[];
  layout?: "editorial" | "carousel" | "bento" | "responsive" | "featured";
  aspectRatio?: number;
  className?: string;
  spacing?: number;
  hoverEffect?: boolean;
  bentoPattern?: BentoPattern;
  scrollbarPosition?: "right" | "left";
  loop?: boolean;
}

export function ImageGallery({
  images,
  layout = "responsive",
  aspectRatio = 4 / 5,
  className,
  spacing = 4,
  hoverEffect = true,
  bentoPattern = "hero",
  scrollbarPosition = "right",
  loop = false
}: ImageGalleryProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  // State for the "featured" layout
  const [mainImage, setMainImage] = React.useState(images[0]);

  // Sync state if images change (e.g., when switching product colors)
  React.useEffect(() => {
    setMainImage(images[0]);
  }, [images]);

  const activeLayout = React.useMemo(() => {
    if (layout !== "responsive") return layout;
    return isMobile ? "carousel" : "editorial";
  }, [layout, isMobile]);

  const renderImage = (
    src: string,
    index: number,
    isBento: boolean = false,
    isThumb: boolean = false
  ) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "group relative h-full w-full overflow-hidden rounded-md bg-neutral-100",
        isThumb && "cursor-pointer ring-offset-2 transition-all hover:opacity-80",
        isThumb && mainImage === src && "shadow-md ring-2 ring-black"
      )}
      onClick={isThumb ? () => setMainImage(src) : undefined}
    >
      {isBento || isThumb ? (
        <ImageWithFallback
          src={src}
          fill
          className={cn(
            "object-cover transition-transform duration-1000",
            hoverEffect && !isThumb && "group-hover:scale-105"
          )}
        />
      ) : (
        <AspectRatio ratio={aspectRatio}>
          <ImageWithFallback
            src={src}
            className={cn(
              "h-full w-full object-cover transition-transform duration-1000",
              hoverEffect && "group-hover:scale-105"
            )}
          />
        </AspectRatio>
      )}
    </motion.div>
  );

  // --- 1. Featured Layout (One big, thumbnails on the side) ---
  if (activeLayout === "featured") {
    return (
      <div className={cn("flex flex-col gap-4 md:flex-row", className)}>
        {/* Thumbnails Sidebar */}
        <ScrollArea className="order-2 md:order-1 md:w-20 lg:w-24">
          <div className="flex flex-row gap-3 p-1 md:flex-col">
            {images.map((img, i) => (
              <div key={`thumb-${i}`} className="h-16 w-16 shrink-0 md:h-20 md:w-full lg:h-24">
                {renderImage(img, i, false, true)}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Main Display */}
        <div className="order-1 flex-1 md:order-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={mainImage}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <AspectRatio
                ratio={aspectRatio}
                className="overflow-hidden rounded-lg bg-neutral-100 shadow-sm"
              >
                <ImageWithFallback src={mainImage} fill className="object-cover" />
              </AspectRatio>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // --- 2. Editorial ---
  if (activeLayout === "editorial") {
    return (
      <ScrollArea
        dir={scrollbarPosition === "right" ? "rtl" : "ltr"}
        className={cn("h-full w-full", className)}
      >
        <div dir="ltr" className="flex flex-col p-4 md:p-6" style={{ gap: `${spacing * 4}px` }}>
          {images.map((img, i) => renderImage(img, i))}
        </div>
      </ScrollArea>
    );
  }

  // --- 3. Bento ---
  if (activeLayout === "bento") {
    return (
      <BentoGrid pattern={bentoPattern} className={className}>
        {images.map((img, i) => renderImage(img, i, true))}
      </BentoGrid>
    );
  }

  // --- 4. Carousel ---
  return (
    <div className={cn("relative w-full", className)}>
      <Carousel opts={{ align: "start", loop: loop }} className="w-full">
        <CarouselContent className="-ml-4">
          {images.map((img, i) => (
            <CarouselItem key={i} className="basis-[85%] pl-4 md:basis-1/2 lg:basis-1/3">
              {renderImage(img, i)}
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && (
          <div className="mt-4 flex justify-end gap-2 px-4 md:hidden">
            <CarouselPrevious className="static h-8 w-8 translate-y-0" />
            <CarouselNext className="static h-8 w-8 translate-y-0" />
          </div>
        )}
      </Carousel>
    </div>
  );
}
