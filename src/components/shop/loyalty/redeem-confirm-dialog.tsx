"use client";

import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { redeemMutationOptions } from "@/lib/tanstack/options/loyalty";

type RedeemableVoucher = import("@/lib/api/schema.gen").components["schemas"]["RedeemableVoucherResponse"];

export function RedeemConfirmDialog({
  voucher,
  open,
  onOpenChange,
  onError
}: {
  voucher: RedeemableVoucher;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onError: () => void;
}) {
  const requestStarted = useRef(false);
  const mutation = useMutation(redeemMutationOptions());

  const confirm = () => {
    if (voucher.id === undefined || mutation.isPending || requestStarted.current) return;
    requestStarted.current = true;
    mutation.mutate(voucher.id, {
      onSuccess: () => {
        toast.success("Đổi voucher thành công.");
        onOpenChange(false);
      },
      onError: () => {
        onError();
      },
      onSettled: () => {
        requestStarted.current = false;
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => !mutation.isPending && onOpenChange(nextOpen)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận đổi voucher</AlertDialogTitle>
          <AlertDialogDescription>
            Đổi <span className="font-semibold text-foreground">{voucher.name ?? "voucher này"}</span> sẽ trừ{" "}
            <span className="font-semibold text-foreground">
              {(voucher.pointsCost ?? 0).toLocaleString("vi-VN")} điểm
            </span>{" "}
            khỏi số dư của bạn.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Hủy</AlertDialogCancel>
          <Button onClick={confirm} disabled={mutation.isPending}>
            {mutation.isPending && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
            {mutation.isPending ? "Đang đổi..." : "Xác nhận đổi"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
