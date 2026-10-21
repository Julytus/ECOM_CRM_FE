import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const INVOICE_STATUS_OPTIONS = [
  { value: 0, label: "Nháp" },
  { value: 1, label: "Hoàn tất" },
  { value: 2, label: "Đã hủy" },
  { value: 3, label: "Chưa thanh toán" },
  { value: 4, label: "Hoàn tiền" }
] as const;

interface InvoiceStatusFilterProps {
  id?: string;
  value: number[];
  onChange: (value: number[]) => void;
}

export function InvoiceStatusFilter({ id, value, onChange }: InvoiceStatusFilterProps) {
  const selected = INVOICE_STATUS_OPTIONS.filter((option) => value.includes(option.value));
  const summary =
    selected.length === 0
      ? "Tất cả"
      : selected.length <= 2
        ? selected.map((option) => option.label).join(", ")
        : `${selected.length} trạng thái`;

  const toggle = (status: number) =>
    onChange(value.includes(status) ? value.filter((v) => v !== status) : [...value, status]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-label="Trạng thái hóa đơn"
          className="w-full justify-between px-3 font-normal"
        >
          <span className={cn("truncate", selected.length === 0 && "text-muted-foreground")}>
            {summary}
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-1">
        {INVOICE_STATUS_OPTIONS.map((option) => {
          const checked = value.includes(option.value);
          return (
            <label
              key={option.value}
              className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm"
            >
              <Checkbox checked={checked} onCheckedChange={() => toggle(option.value)} />
              <span className="flex-1">{option.label}</span>
              {checked && <Check className="text-muted-foreground size-3.5" />}
            </label>
          );
        })}
        {value.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-1 w-full"
            onClick={() => onChange([])}
          >
            Bỏ chọn
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
