"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormDialog } from "@/components/ui/form-dialog";
import type { OrderDTO } from "@/lib/types/order";

export function OrderFormDialog({
  open,
  order,
  onOpenChange,
  onSubmit
}: {
  open: boolean;
  order: OrderDTO | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Partial<OrderDTO>) => void;
}) {
  const [note, setNote] = React.useState("");
  const [address, setAddress] = React.useState("");

  React.useEffect(() => {
    setNote(order?.note ?? "");
    setAddress(order?.address ?? "");
  }, [order, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: order?.id,
      note,
      address
    });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={order ? "Chỉnh sửa đơn hàng" : "Tạo mới đơn hàng"}
      featured={
        order
          ? `Cập nhật thông tin đơn hàng ${order.code || `#${order.id}`}`
          : "Tạo đơn hàng mới"
      }
      onSubmit={handleSubmit}
      submitLabel={order ? "Cập nhật" : "Tạo mới"}
    >
      <div className="space-y-2">
        <Label htmlFor="order-address">Địa chỉ giao hàng</Label>
        <Textarea
          id="order-address"
          name="address"
          placeholder="Nhập địa chỉ giao hàng..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="min-h-[80px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="order-note">Ghi chú</Label>
        <Textarea
          id="order-note"
          name="note"
          placeholder="Thêm ghi chú cho đơn hàng..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="min-h-[100px]"
        />
        <p className="text-muted-foreground text-xs text-pretty">
          Ghi chú giúp theo dõi thêm thông tin về đơn hàng.
        </p>
      </div>
    </FormDialog>
  );
}
