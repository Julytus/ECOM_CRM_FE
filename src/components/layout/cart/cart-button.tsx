"use client";

import * as React from "react";
import { ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/stores/cart";
import { atom, useAtom } from "jotai";
import { cartOpenAtom } from "@/lib/atom/cart";

const badgeVariants = cva(
  "absolute -right-1 -top-1 flex items-center justify-center rounded-full font-sans font-bold shadow-sm",
  {
    variants: {
      variant: {
        primary: "bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900",
        danger: "bg-red-500 text-white"
      },
      size: {
        sm: "h-4 w-4 text-[9px]",
        md: "h-5 w-5 text-[10px]"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "sm"
    }
  }
);

interface CartButtonProps extends VariantProps<typeof badgeVariants> {
  className?: string;
}

export function CartButton({ variant, size, className }: CartButtonProps) {
  const count = useCartStore().getTotalItems();
  const [, setOpen] = useAtom(cartOpenAtom);
  return (
    <motion.div
      key={`cart-${count}`}
      initial={false}
      animate={{ scale: [1, 1.15, 0.95, 1] }}
      transition={{
        duration: 0.4,
        times: [0, 0.4, 0.7, 1],
        ease: "easeOut"
      }}
      className={cn("relative inline-flex", className)}
    >
      <Button
        size="icon"
        variant="ghost"
        className="relative"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <ShoppingBag className="size-5 stroke-[1.5px]" />
        <span className="sr-only">Giỏ hàng</span>
      </Button>

      <AnimatePresence mode="popLayout">
        {count > 0 && (
          <motion.div
            key={`cart-${count}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 15
            }}
            className={cn(badgeVariants({ variant, size }))}
          >
            {count}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
