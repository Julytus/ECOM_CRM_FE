"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const actionGroupVariants = cva("grid", {
  variants: {
    layout: {
      single: "grid-cols-1",
      split: "grid-cols-1 sm:grid-cols-2",
      stack: "flex flex-col",
      inline: "flex flex-row items-center flex-wrap"
    },
    gap: {
      none: "gap-0",
      compact: "gap-2",
      default: "gap-4",
      luxury: "gap-6 md:gap-8"
    }
  },
  defaultVariants: {
    layout: "split",
    gap: "default"
  }
});

// FIX: Extend HTMLMotionProps but specifically handle 'children' and 'layout'
interface ActionGroupProps
  extends
    Omit<HTMLMotionProps<"div">, "layout" | "children">,
    VariantProps<typeof actionGroupVariants> {
  children?: React.ReactNode; // Explicitly define children as ReactNode
  animate?: boolean;
  staggerDelay?: number;
}

const container = {
  hidden: { opacity: 0 },
  show: (staggerDelay: number) => ({
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.1
    }
  })
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1]
    }
  }
} as const;

export function ActionGroup({
  className,
  layout,
  gap,
  animate = true,
  staggerDelay = 0.1,
  children,
  ...props
}: ActionGroupProps) {
  // Clean children helper to avoid rendering nulls/undefined in the motion loop
  const validChildren = React.Children.toArray(children).filter(React.isValidElement);

  if (!animate) {
    return (
      <div
        className={cn(actionGroupVariants({ layout, gap }), className)}
        {...(props as React.HTMLAttributes<HTMLDivElement>)}
      >
        {validChildren.map((child, index) => (
          <div key={index} className="w-full">
            {child}
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      custom={staggerDelay}
      className={cn(actionGroupVariants({ layout, gap }), className)}
      {...props}
    >
      {validChildren.map((child, index) => (
        <motion.div key={index} variants={item} className="w-full">
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
