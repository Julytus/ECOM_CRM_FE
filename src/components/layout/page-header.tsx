"use client";

import * as React from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { cva, type VariantProps } from "class-variance-authority";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export const pageHeaderVariants = cva("relative w-full overflow-hidden flex flex-col", {
  variants: {
    variant: {
      luxury: "justify-center text-center bg-white",
      hero: "justify-end bg-black",
      minimal: "bg-neutral-50/50"
    },
    size: {
      compact: "h-auto py-8 md:py-12 border-b border-neutral-100",
      sm: "h-[30vh] min-h-[250px]",
      md: "h-[50vh] min-h-[400px]",
      lg: "h-[70vh] min-h-[600px]",
      full: "h-[90vh]"
    },
    contentAlignment: {
      left: "items-start text-left",
      center: "items-center text-center"
    }
  },
  defaultVariants: {
    variant: "luxury",
    size: "md",
    contentAlignment: "center"
  }
});

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof pageHeaderVariants> {
  title?: string;
  image?: string;
  items: BreadcrumbItem[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] }
  }
} as const;

export function PageHeader({
  title,
  image,
  items,
  variant,
  size,
  contentAlignment,
  className
}: PageHeaderProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const smoothY = useSpring(useTransform(scrollYProgress, [0, 1], ["0%", "25%"]), {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  const isMinimal = variant === "minimal" || !image;

  // Dynamic text sizing based on the 'size' variant
  const titleSizeClass = cn(
    "max-w-4xl leading-[1.1] tracking-tight",
    size === "sm"
      ? "text-4xl md:text-6xl"
      : size === "lg"
        ? "text-7xl md:text-9xl"
        : "text-6xl md:text-8xl",
    variant === "luxury" ? "font-serif italic" : "font-extrabold tracking-tighter"
  );

  return (
    <section
      ref={containerRef}
      className={cn(
        pageHeaderVariants({ variant, size, contentAlignment, className }),
        isMinimal && "h-auto py-12"
      )}
    >
      {!isMinimal && (
        <motion.div
          initial={{ clipPath: "inset(10% 10% 10% 10%)", opacity: 0 }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
          transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
          style={{ scale, y: smoothY }}
          className="absolute inset-0 z-0"
        >
          <div
            className="h-full w-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${image})` }}
          />
          <div
            className={cn(
              "absolute inset-0",
              variant === "luxury"
                ? "bg-black/30 backdrop-grayscale-[0.2]"
                : "bg-gradient-to-t from-black/80 via-black/20 to-transparent"
            )}
          />
        </motion.div>
      )}

      <motion.div
        style={{ opacity }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          "relative z-10 container px-6",
          variant === "hero" ? "pb-12 md:pb-20" : "py-2",
          contentAlignment === "left" && "mx-0"
        )}
      >
        <motion.nav aria-label="Breadcrumb" className="mb-6 md:mb-8">
          <ol
            className={cn(
              "flex items-center space-x-2 text-[10px] font-bold tracking-[0.4em] uppercase",
              !isMinimal ? "text-white/70" : "text-neutral-400",
              contentAlignment === "center" && "justify-center"
            )}
          >
            {items.map((item, index) => (
              <motion.li key={index} variants={itemVariants} className="flex items-center">
                {index > 0 && <span className="mx-3 opacity-30">/</span>}
                {item.href ? (
                  <Link
                    to={item.href}
                    className={cn(
                      "transition-all",
                      // If there's an image, hover to pure white.
                      // If minimal (light bg), hover to deep black.
                      !isMinimal ? "hover:text-white hover:opacity-100" : "hover:text-neutral-900"
                    )}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      "font-black tracking-[0.5em]",
                      !isMinimal ? "text-white" : "text-neutral-900"
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </motion.li>
            ))}
          </ol>
        </motion.nav>

        {title && (
          <motion.h1
            variants={itemVariants}
            className={cn(titleSizeClass, !isMinimal ? "text-white" : "text-neutral-900")}
          >
            {title.split(" ").map((word, i) => (
              <span key={i} className="mr-[0.2em] inline-block overflow-hidden pb-2">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.2, delay: 0.5 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-block"
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </motion.h1>
        )}

        {variant === "luxury" && size !== "sm" && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "80px", opacity: 1 }}
            transition={{ duration: 1.5, delay: 1, ease: "easeInOut" }}
            className={cn(
              "mt-12 h-[1px] bg-white/40",
              contentAlignment === "center" ? "mx-auto" : "ml-0"
            )}
          />
        )}
      </motion.div>

      {!isMinimal && (
        <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      )}

      {!isMinimal && variant === "hero" && (
        <div className="from-background absolute bottom-0 left-0 z-20 h-48 w-full bg-gradient-to-t to-transparent" />
      )}
    </section>
  );
}
