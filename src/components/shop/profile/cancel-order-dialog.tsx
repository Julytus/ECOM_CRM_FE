"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

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
import { cancelMyOrderMutationOptions } from "@/lib/tanstack/options/order";

interface CancelOrderDialogProps {
  open: boolean;
  orderId: number | null;
  orderCode?: string;
  onOpenChange: (open: boolean) => void;
}

export function CancelOrderDialog({ open, orderId, orderCode, onOpenChange }: CancelOrderDialogProps) {
  const mutation = useMutation(cancelMyOrderMutationOptions());

  const handleConfirm = () => {
    if (orderId === null) return;
    mutation.mutate(orderId, {
      onSuccess: () => {
        toast.success("Đã hủy đơn hàng thành công.");
        onOpenChange(false);
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hủy đơn hàng</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc muốn hủy đơn hàng <span className="font-semibold text-foreground">{orderCode ?? `#${orderId}`}</span>?
            Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Giữ đơn hàng</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={mutation.isPending} className="bg-destructive hover:bg-destructive/90">
            {mutation.isPending ? "Đang hủy..." : "Xác nhận hủy"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
