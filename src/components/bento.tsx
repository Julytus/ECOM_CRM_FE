"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// More descriptive and editorial patterns
export type BentoPattern =
  | "hero" // 1 Large (2/3 width), rest small
  | "feature" // Alternating wide/narrow
  | "magazine" // 2/3 + 1/3 then 1/3 + 2/3 (Zig-zag)
  | "mosaic" // Tall items mixed with square
  | "cols-3" // Standard 3-column
  | "none"; // Custom spans passed via children props

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
  pattern?: BentoPattern;
  /** Custom spans if pattern is 'none' e.g. ["col-span-2", "col-span-1"] */
  customSpans?: string[];
}

export function BentoGrid({ children, className, pattern = "hero", customSpans }: BentoGridProps) {
  const getSpan = (index: number) => {
    if (pattern === "none" && customSpans) return customSpans[index] || "";

    switch (pattern) {
      case "hero":
        return index === 0 ? "md:col-span-2 md:row-span-2" : "md:col-span-1 md:row-span-1";

      case "feature":
        // 2/3 then 1/3
        return index % 2 === 0 ? "md:col-span-2" : "md:col-span-1";

      case "magazine": {
        // Row 1: 2/3, 1/3 | Row 2: 1/3, 2/3
        const isEvenRow = Math.floor(index / 2) % 2 === 0;
        return isEvenRow ? "md:col-span-2 md:row-span-1" : "md:col-span-1 md:row-span-1";
      }

      case "mosaic":
        // High-end mix of tall and wide
        if (index === 0) return "md:col-span-2 md:row-span-2"; // Big Hero
        if (index === 1) return "md:col-span-1 md:row-span-2"; // Side Tall
        return "md:col-span-1";

      case "cols-3":
        return "md:col-span-1";

      default:
        return "";
    }
  };

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 md:grid-cols-3",
        "auto-rows-[200px] md:auto-rows-[250px]",
        className
      )}
    >
      {React.Children.map(children, (child, i) => (
        <div className={cn("relative overflow-hidden", getSpan(i))}>{child}</div>
      ))}
    </div>
  );
}
