"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type EditableVariantCellProps = {
  value: string | number;
  error?: string;
  editing: boolean;
  draftValue: string;

  inputType?: "text" | "number";

  onStartEdit: () => void;
  onDraftChange: (value: string) => void;
  onCommit: () => void;
  onCancel: () => void;

  formatValue?: (value: string | number) => string;
};

export function EditableVariantCell({
  value,
  error,
  editing,
  draftValue,
  inputType = "text",
  onStartEdit,
  onDraftChange,
  onCommit,
  onCancel,
  formatValue
}: EditableVariantCellProps) {
  if (editing) {
    return (
      <Input
        autoFocus
        type={inputType}
        value={draftValue}
        onChange={(e) => onDraftChange(e.target.value)}
        onBlur={onCommit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onCommit();
          }

          if (e.key === "Escape") {
            onCancel();
          }
        }}
        className="h-8 w-full min-w-0 px-2"
      />
    );
  }

  const displayValue = error ? error : formatValue ? formatValue(value) : String(value);

  return (
    <button
      type="button"
      onClick={onStartEdit}
      className={cn(
        "hover:bg-muted block w-full min-w-0",
        "overflow-hidden rounded px-2 py-1",
        "text-left text-sm text-ellipsis whitespace-nowrap",
        error && "text-destructive"
      )}
    >
      {displayValue}
    </button>
  );
}
