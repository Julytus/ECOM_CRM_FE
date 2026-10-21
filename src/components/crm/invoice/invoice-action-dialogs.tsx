import { useEffect, useState } from "react";

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
import { Textarea } from "@/components/ui/textarea";
import type { InvoiceAction } from "@/components/crm/invoice/columns";
import type { components } from "@/lib/api/schema.gen";

type Invoice = components["schemas"]["Invoice"];

const ACTION_TEXT: Record<InvoiceAction, { title: string; description: string; confirm: string }> = {
  confirm: {
    title: "Xác nhận thu tiền",
    description: "Xác nhận đã thu tiền hóa đơn này?",
    confirm: "Xác nhận thu"
  },
  cancel: {
    title: "Hủy hóa đơn",
    description: "Bạn có chắc muốn hủy hóa đơn này?",
    confirm: "Hủy hóa đơn"
  },
  refund: {
    title: "Hoàn tiền hóa đơn",
    description: "Xác nhận hoàn tiền cho hóa đơn này?",
    confirm: "Hoàn tiền"
  }
};

export function InvoiceActionDialogs({
  invoice,
  action,
  open,
  isPending,
  onOpenChange,
  onConfirm
}: {
  invoice: Invoice | null;
  action: InvoiceAction | null;
  open: boolean;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (invoice: Invoice, action: InvoiceAction, reason?: string) => void;
}) {
  const [reason, setReason] = useState("");
  const text = action ? ACTION_TEXT[action] : null;

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{text?.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {text?.description} {invoice?.invoiceCode || (invoice?.id ? `#${invoice.id}` : "")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {action === "refund" && (
          <Textarea
            aria-label="Lý do hoàn tiền (không bắt buộc)"
            placeholder="Lý do hoàn tiền (không bắt buộc)"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Đóng</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending || !invoice || !action}
            onClick={(event) => {
              event.preventDefault();
              if (invoice && action) onConfirm(invoice, action, reason.trim() || undefined);
            }}
          >
            {isPending ? "Đang xử lý..." : text?.confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
