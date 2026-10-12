"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface DeleteOrderDialogProps {
  open: boolean;
  orderId: number | null;
  orderCode?: string;
  onConfirm: (id: number) => void;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
}

export function DeleteOrderDialog({
  open,
  orderId,
  orderCode,
  onConfirm,
  onOpenChange,
  isLoading = false
}: DeleteOrderDialogProps) {
  const handleConfirm = () => {
    if (orderId) {
      onConfirm(orderId);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa đơn hàng</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc muốn xóa đơn hàng <span className="font-semibold text-foreground">{orderCode || `#${orderId}`}</span>?
            Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading ? "Đang xóa..." : "Xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
