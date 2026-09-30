"use client";

import { InfiniteMovingImages } from "@/components/ui/infinite-moving-images";

export function InstagramSection() {
  return (
    <section className="flat-spacing-2 to-background bg-gradient-to-b from-gray-100 pt-12 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h3 className="animate-fadeInUp mb-3 text-3xl font-bold md:text-4xl">
            Theo dõi Instagram của chúng tôi
          </h3>
          <p
            className="text-muted-foreground animate-fadeInUp mx-auto max-w-2xl text-base md:text-lg"
            style={{ animationDelay: "0.1s" }}
          >
            Khám phá các sản phẩm mới nhất và phong cách sống hiện đại, trực tiếp từ Instagram của
            chúng tôi!
          </p>
        </div>

        {/* Infinite Moving Images */}
        <InfiniteMovingImages
          items={[
            { src: "/gallery/gallery-1.jpg" },
            { src: "/gallery/gallery-2.jpg" },
            { src: "/gallery/gallery-3.jpg" },
            { src: "/gallery/gallery-4.jpg" },
            { src: "/gallery/gallery-5.jpg" }
          ]}
          direction="right"
          speed="slow"
          className="py-4"
        />
      </div>
    </section>
  );
}
