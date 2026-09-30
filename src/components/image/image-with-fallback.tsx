"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  fill?: boolean;
}

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc = "/placeholder.svg",
  fill,
  className,
  loading,
  ...props
}: ImageWithFallbackProps) {
  const [currentSrc, setCurrentSrc] = React.useState(src);

  React.useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    <img
      {...props}
      src={currentSrc || fallbackSrc}
      alt={alt || "Image"}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
      className={cn(
        "transition-opacity duration-300",
        fill ? "absolute inset-0 h-full w-full object-cover" : className,
        !currentSrc && "opacity-0",
        className
      )}
      loading={loading ?? "lazy"}
      sizes="(max-width: 768px) 100vw, 33vw"
      decoding="async"
    />
  );
}
