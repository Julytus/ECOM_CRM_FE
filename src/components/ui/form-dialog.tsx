"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
  cancelLabel?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  submitLabel = "Lưu",
  cancelLabel = "Hủy",
  maxWidth = "lg",
  isLoading = false,
}: FormDialogProps) {
  const maxWidthClass = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
  }[maxWidth];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`gap-0 p-0 ${maxWidthClass}`}>
        <DialogHeader className="border-b px-6 py-4 pt-5">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <div className="space-y-6 p-6">{children}</div>

          <div className="flex items-center justify-end space-x-2 border-t p-4">
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={isLoading}>
                {cancelLabel}
              </Button>
            </DialogClose>
            <Button size="sm" type="submit" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
