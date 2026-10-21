import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ImageWithFallback } from "@/components/image/image-with-fallback";

type Slide = {
  title: string;
  description: string;
  image: string;
};

const slides: Slide[] = [
  {
    title: "Bộ Đôi Ghế Công Thái Học",
    description:
      "Nâng đỡ tối ưu và cải thiện tư thế ngồi với dòng ghế công thái học dành cho giờ làm việc dài",
    image: "/slider/slider-1.jpg"
  },
  {
    title: "Ghế Công Thái Học Pro",
    description:
      "Thiết kế chuẩn công thái học giúp bạn thoải mái, giảm mỏi lưng và cổ suốt cả ngày",
    image: "/slider/slider-2.jpg"
  },
  {
    title: "Đế Sạc Không Dây",
    description: "Sạc nhanh tiện lợi, giữ không gian làm việc gọn gàng và hiện đại",
    image: "/slider/slider-3.jpg"
  }
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  useEffect(() => {
    const autoplay = setInterval(nextSlide, 5000);
    return () => clearInterval(autoplay);
  }, [currentIndex]);

  // Get position for each slide
  const getSlidePosition = (index: number) => {
    const position = (index - currentIndex + slides.length) % slides.length;

    if (position === 0) return { offset: 0, scale: 1, opacity: 1, zIndex: 3 };
    if (position === 1) return { offset: 75, scale: 0.9, opacity: 0.5, zIndex: 2 };
    if (position === slides.length - 1) return { offset: -75, scale: 0.9, opacity: 0.5, zIndex: 2 };

    return { offset: 0, scale: 0.7, opacity: 0, zIndex: 1 };
  };

  return (
    <div className="relative w-full bg-gray-50 py-6">
      <div className="relative flex h-[500px] w-full items-center justify-center overflow-visible">
        {/* Slides Container */}
        <div className="relative h-full w-full max-w-7xl px-4">
          {slides.map((slide, index) => {
            const { offset, scale, opacity, zIndex } = getSlidePosition(index);
            const isActive = (index - currentIndex + slides.length) % slides.length === 0;

            return (
              <div
                key={index}
                className="absolute top-1/2 left-1/2 h-full w-full max-w-4xl transition-all duration-700 ease-out"
                style={{
                  transform: `translate(-50%, -50%) translateX(${offset}%) scale(${scale})`,
                  opacity: opacity,
                  zIndex: zIndex
                }}
              >
                <div className="relative h-full w-full overflow-hidden rounded-3xl shadow-2xl">
                  {/* Background Image */}
                  <ImageWithFallback
                    src={slide.image}
                    alt={slide.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

                  {/* Content */}
                  <div className="relative flex h-full items-center justify-center px-6 md:px-12">
                    <div className="mx-auto max-w-3xl space-y-6 text-center">
                      <h1
                        className={`text-4xl font-bold text-white transition-all delay-100 duration-700 md:text-5xl lg:text-6xl ${
                          isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                        }`}
                      >
                        {slide.title}
                      </h1>

                      <p
                        className={`mx-auto max-w-xl text-base text-white/90 transition-all delay-200 duration-700 md:text-lg ${
                          isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                        }`}
                      >
                        {slide.description}
                      </p>

                      <div
                        className={`transition-all delay-300 duration-700 ${
                          isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                        }`}
                      >
                        <Link
                          to="/search"
                          tabIndex={isActive ? 0 : -1}
                          className="inline-flex h-12 items-center rounded-full bg-white px-8 font-semibold text-neutral-900 shadow-lg transition-all duration-200 outline-none hover:bg-white/90 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40"
                        >
                          Tới bộ sưu tập
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          disabled={isAnimating}
          type="button"
          className="bg-background/80 text-foreground hover:bg-background focus-visible:ring-ring absolute top-1/2 left-3 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 outline-none focus-visible:ring-2 disabled:opacity-40 md:left-8 md:size-12"
          aria-label="Slide trước"
        >
          <ChevronLeft aria-hidden="true" className="size-6" />
        </button>

        <button
          onClick={nextSlide}
          disabled={isAnimating}
          type="button"
          className="bg-background/80 text-foreground hover:bg-background focus-visible:ring-ring absolute top-1/2 right-3 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 outline-none focus-visible:ring-2 disabled:opacity-40 md:right-8 md:size-12"
          aria-label="Slide tiếp theo"
        >
          <ChevronRight aria-hidden="true" className="size-6" />
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="mt-6 flex justify-center gap-1 md:mt-8">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => goToSlide(index)}
            aria-label={`Tới slide ${index + 1}`}
            aria-current={index === currentIndex ? "true" : undefined}
            className="group focus-visible:ring-ring flex h-6 items-center justify-center rounded-full px-1 outline-none focus-visible:ring-2"
          >
            <span
              aria-hidden="true"
              className={`block h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-foreground w-10"
                  : "bg-muted-foreground/40 group-hover:bg-muted-foreground w-2.5"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
