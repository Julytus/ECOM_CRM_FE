"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cva, type VariantProps } from "class-variance-authority";
import { PageHeader, type pageHeaderVariants } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";

/**
 * PageWrapper Variants
 */
const pageWrapperVariants = cva("flex min-h-screen flex-col", {
  variants: {
    theme: {
      default: "bg-background",
      luxury: "bg-background selection:bg-primary selection:text-primary-foreground",
      minimal: "bg-background selection:bg-primary selection:text-primary-foreground"
    }
  },
  defaultVariants: {
    theme: "luxury"
  }
});

type HeaderVariants = VariantProps<typeof pageHeaderVariants>;

interface PageWrapperProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof pageWrapperVariants> {
  children: React.ReactNode;
  title?: string;
  image?: string | null;
  breadcrumbItems: { label: string; href?: string }[];
  animate?: boolean;

  // Refined Header Passthrough Props
  headerVariant?: HeaderVariants["variant"];
  headerAlignment?: HeaderVariants["contentAlignment"];
  headerSize?: HeaderVariants["size"];
}

export function PageWrapper({
  children,
  title,
  image,
  breadcrumbItems,
  animate = true,
  theme,
  headerVariant = "luxury",
  headerAlignment = "left",
  headerSize = "md",
  className,
  ...props
}: PageWrapperProps) {
  const hasImage = !!image && image !== "none";

  return (
    <div className={cn(pageWrapperVariants({ theme, className }))} {...props}>
      {/* PageHeader integration:
          Forces 'minimal' variant if no image is present to maintain layout integrity.
      */}
      <PageHeader
        title={title}
        image={hasImage ? (image as string) : undefined}
        items={breadcrumbItems}
        variant={hasImage ? headerVariant : "minimal"}
        size={headerSize}
        contentAlignment={headerAlignment}
      />

      <motion.main
        initial={animate ? { opacity: 0, y: 30 } : false}
        animate={animate ? { opacity: 1, y: 0 } : false}
        transition={{
          duration: 1.2, // Weighted entry
          delay: 0.4, // Allows the Header title reveal to lead the sequence
          ease: [0.16, 1, 0.3, 1]
        }}
        className="relative z-0 flex-1"
      >
        {/* Subtle separator for luxury theme when image is present */}
        {hasImage && theme === "luxury" && (
          <div className="container mx-auto px-6">
            <div className="bg-border h-px w-full" />
          </div>
        )}

        <div className="">{children}</div>
      </motion.main>

      {/* Atmospheric Texture Overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[999] opacity-[0.03] mix-blend-multiply dark:mix-blend-soft-light"
        style={{
          backgroundImage: `url('https://grainy-gradients.vercel.app/noise.svg')`,
          filter: "contrast(150%) brightness(100%)"
        }}
      />
    </div>
  );
}
