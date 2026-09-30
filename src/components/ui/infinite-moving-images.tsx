"use client";

import { ImageWithFallback } from "@/components/image/image-with-fallback";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

export const InfiniteMovingImages = ({
  items,
  direction = "left",
  speed = "slow",
  pauseOnHover = true,
  className
}: {
  items: {
    src: string;
    alt?: string;
    href?: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    addAnimation();
  }, []);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);
      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) scrollerRef.current.appendChild(duplicatedItem);
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }

  const getDirection = () => {
    if (containerRef.current) {
      containerRef.current.style.setProperty(
        "--animation-direction",
        direction === "left" ? "forwards" : "reverse"
      );
    }
  };

  const getSpeed = () => {
    if (containerRef.current) {
      let duration = "80s";
      if (speed === "fast") duration = "20s";
      else if (speed === "normal") duration = "40s";
      containerRef.current.style.setProperty("--animation-duration", duration);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full flex-nowrap gap-4 py-4",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((item, idx) => (
          <li
            key={idx}
            className="w-[250px] flex-shrink-0 overflow-hidden rounded-xl shadow-lg sm:w-[280px] md:w-[300px] lg:w-[332px]"
          >
            {item.href ? (
              <a href={item.href} className="group relative block">
                <ImageWithFallback
                  src={item.src}
                  alt={item.alt || `gallery-${idx + 1}`}
                  className="h-[300px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </a>
            ) : (
              <img
                src={item.src}
                alt={item.alt || `gallery-${idx + 1}`}
                className="h-[300px] w-full rounded-xl object-cover transition-transform duration-500 hover:scale-105"
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
