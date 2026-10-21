"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { COLOR_MAP } from "@/lib/color";
import { motion } from "motion/react";

const pickerVariants = cva(
  "relative flex cursor-pointer items-center justify-center transition-all duration-200 outline-none focus-visible:ring-ring/60 focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40",
  {
    variants: {
      // Kept for API compatibility; colours now come from theme tokens in every context.
      context: {
        default: "",
        overImage: ""
      },
      variant: {
        swatch: "size-9 shrink-0 rounded-full border-2",
        button:
          "h-10 min-w-11 rounded-lg border px-3 text-xs font-semibold tracking-tight uppercase",
        pill: "h-9 rounded-full border px-4 text-xs font-medium"
      },
      state: {
        inactive:
          "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground",
        active: "",
        disabled: "grayscale line-through"
      },
      size: {
        default: "",
        compact: "h-7 min-w-8 px-1.5 text-[10px]"
      }
    },
    compoundVariants: [
      {
        variant: "swatch",
        state: "inactive",
        className: "border-transparent bg-transparent hover:scale-110 motion-reduce:hover:scale-100"
      },
      {
        variant: "swatch",
        state: "active",
        className: "border-foreground p-0.5"
      },
      {
        variant: "swatch",
        size: "compact",
        className: "size-6 min-w-0 px-0"
      },
      {
        variant: "button",
        state: "active",
        className: "border-primary bg-primary text-primary-foreground shadow-sm"
      },
      {
        variant: "button",
        size: "compact",
        className: "h-7 rounded-md"
      },
      {
        variant: "pill",
        state: "active",
        className: "border-primary bg-primary/10 text-foreground"
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
  const labelId = React.useId();
  const isCompact = size === "compact";

  return (
    <div className={cn(isCompact ? "space-y-1.5" : "space-y-3", className)}>
      <div className="flex items-center justify-between gap-3 leading-none">
        <span
          id={labelId}
          className={cn(
            "text-muted-foreground font-semibold tracking-[0.12em] uppercase",
            isCompact ? "text-[10px]" : "text-xs"
          )}
        >
          {label}
          {!isCompact && value && (
            <span className="text-foreground ml-2 tracking-normal normal-case">{value}</span>
          )}
        </span>
        {renderHeaderRight && <div className="flex items-center">{renderHeaderRight}</div>}
      </div>

      <div role="group" aria-labelledby={labelId} className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = value === opt.value;
          const state = opt.disabled ? "disabled" : isSelected ? "active" : "inactive";

          return (
            <button
              key={opt.id}
              type="button"
              disabled={opt.disabled}
              aria-pressed={isSelected}
              aria-label={variant === "swatch" ? `${label}: ${opt.value}` : undefined}
              title={variant === "swatch" ? opt.value : undefined}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange(opt.value);
              }}
              className={cn(pickerVariants({ variant, state, size }))}
            >
              {variant === "swatch" ? (
                <>
                  <span
                    aria-hidden="true"
                    className="border-foreground/15 block h-full w-full rounded-full border"
                    style={{ backgroundColor: COLOR_MAP[opt.value] || opt.value }}
                  />
                  {isSelected && (
                    <motion.span
                      aria-hidden="true"
                      layoutId={`${labelId}-active-glow`}
                      className="border-foreground/30 absolute -inset-1 rounded-full border"
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
