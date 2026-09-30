"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { COLOR_MAP } from "@/lib/color";
import { motion } from "motion/react";

const pickerVariants = cva(
  "relative transition-all duration-200 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-30",
  {
    variants: {
      context: {
        default: "text-muted-foreground",
        overImage: "text-white drop-shadow-md"
      },
      variant: {
        swatch: "h-7 w-7 rounded-full border shrink-0",
        button:
          "min-w-[42px] rounded-lg border px-3 py-1.5 text-[11px] font-bold uppercase tracking-tight",
        pill: "rounded-full border px-4 py-1 text-[10px] font-medium"
      },
      state: {
        inactive: "border-neutral-200 text-neutral-500 hover:border-black hover:text-black",
        active: "",
        disabled: "grayscale"
      },
      size: {
        default: "",
        compact: "min-w-[32px] h-7 px-1.5 text-[9px]"
      }
    },
    compoundVariants: [
      {
        variant: "swatch",
        state: "inactive",
        className: "border-transparent hover:scale-110"
      },
      {
        variant: "swatch",
        state: "active",
        className: "border-black p-0.5 rounded-full"
      },
      {
        variant: "swatch",
        size: "compact",
        className: "h-5 w-5 rounded-full"
      },
      {
        variant: "button",
        state: "active",
        className: "border-black bg-black text-white shadow-sm"
      },
      {
        variant: "button",
        size: "compact",
        className: "h-6 rounded-md"
      },
      {
        variant: "pill",
        state: "active",
        className: "border-primary bg-primary/5 text-primary"
      }
    ],
    defaultVariants: {
      variant: "button",
      state: "inactive",
      size: "default",
      context: "default"
    }
  }
);

interface VariantPickerProps extends VariantProps<typeof pickerVariants> {
  label: string;
  value: string;
  options: { id: number | string; value: string; disabled?: boolean }[];
  onChange: (value: string) => void;
  renderHeaderRight?: React.ReactNode;
  className?: string;
}

export function VariantPicker({
  label,
  value,
  options,
  onChange,
  renderHeaderRight,
  variant,
  size,
  className
}: VariantPickerProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between leading-none">
        <span className="text-[8px] font-bold tracking-[0.15em] uppercase">{label}</span>
        {renderHeaderRight && <div className="flex items-center">{renderHeaderRight}</div>}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const isSelected = value === opt.value;
          const state = opt.disabled ? "disabled" : isSelected ? "active" : "inactive";

          return (
            <button
              key={opt.id}
              type="button"
              disabled={opt.disabled}
              onClick={(e) => {
                e.stopPropagation();
                onChange(opt.value);
              }}
              className={cn(pickerVariants({ variant, state, size }))}
            >
              {variant === "swatch" ? (
                <>
                  <span
                    className="block h-full w-full rounded-full border border-black/5"
                    style={{ backgroundColor: COLOR_MAP[opt.value] || opt.value }}
                  />
                  {isSelected && (
                    <motion.div
                      layoutId={`${label}-active-glow`}
                      className="absolute -inset-0.5 rounded-full border border-black/30"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </>
              ) : (
                opt.value
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
