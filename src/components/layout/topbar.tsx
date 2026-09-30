"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { formatVnd } from "@/lib/format";
import { cn } from "@/lib/utils";

const MESSAGES = [
  {
    id: "free-ship",
    content: (
      <>
        Miễn phí vận chuyển cho đơn hàng trên{" "}
        <span className="text-accent font-bold italic">{formatVnd(200000)}</span>
      </>
    )
  },
  {
    id: "sale",
    content: "Giảm giá lên đến 30% cho bộ sưu tập Xuân Hè"
  },
  {
    id: "membership",
    content: "Đăng ký thành viên để nhận ưu đãi 10% đơn hàng đầu tiên"
  }
];

export function Topbar() {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="overflow-hidden bg-neutral-950 text-white">
      <div className="relative container mx-auto flex h-9 items-center justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={MESSAGES[index].id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{
              duration: 0.5,
              ease: [0.32, 0.72, 0, 1]
            }}
            className="flex items-center gap-2 text-[11px] font-medium tracking-[0.1em] uppercase sm:text-xs"
          >
            {MESSAGES[index].content}
          </motion.div>
        </AnimatePresence>

        <div className="absolute right-4 hidden items-center gap-1.5 md:flex">
          {MESSAGES.map((_, i) => (
            <div
              key={i}
              className={cn(
                "size-1 rounded-full transition-all duration-300",
                index === i ? "w-3 bg-white" : "bg-white/20"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
