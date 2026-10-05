"use client";

import * as React from "react";
import { ImageUploader } from "@/components/image/image-upload";

type VariantImageCellProps = {
  value?: string | null;
  onChange: (url: string) => void;
};

export function VariantImageCell({ value, onChange }: VariantImageCellProps) {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <div className="bg-muted h-16 w-16 shrink-0 overflow-hidden rounded-md border">
        <ImageUploader compact value={value || ""} onChange={onChange} />
      </div>
    </div>
  );
}
