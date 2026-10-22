import * as React from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { components } from "@/lib/api/schema.gen";
import type { VoucherRow } from "@/components/crm/voucher/columns";

type Voucher = components["schemas"]["Voucher"];
type Tier = components["schemas"]["LoyaltyTier"] & { id: number };
type FormValues = {
  code: string;
  name: string;
  description: string;
  discountType: string;
  discountValue: string;
  maxDiscount: string;
  minInvoiceAmount: string;
  startDate: string;
  endDate: string;
  totalQuantity: string;
  perUserLimit: string;
  status: string;
  branchId: string;
  pointsCost: string;
  redeemStock: string;
  minTierId: string;
};

const EMPTY_VALUES: FormValues = {
  code: "", name: "", description: "", discountType: "1", discountValue: "", maxDiscount: "",
  minInvoiceAmount: "", startDate: "", endDate: "", totalQuantity: "", perUserLimit: "",
  status: "1", branchId: "", pointsCost: "", redeemStock: "", minTierId: ""
};

function dateToInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function inputToDate(value: string) {
  return value ? new Date(value).toISOString() : undefined;
}

function optionalNumber(value: string) {
  return value.trim() === "" ? undefined : Number(value);
}

export function VoucherDialog({
  open,
  voucher,
  tiers,
  isLoading,
  canUpdate,
  onOpenChange,
  onSubmit
}: {
  open: boolean;
  voucher: VoucherRow | null;
  tiers: Tier[];
  isLoading: boolean;
  canUpdate: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (voucher: Voucher) => void;
}) {
  const [values, setValues] = React.useState<FormValues>(EMPTY_VALUES);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    setValues(voucher ? {
      code: voucher.code ?? "", name: voucher.name ?? "", description: voucher.description ?? "",
      discountType: String(voucher.discountType ?? 1), discountValue: voucher.discountValue == null ? "" : String(voucher.discountValue),
      maxDiscount: voucher.maxDiscount == null ? "" : String(voucher.maxDiscount),
      minInvoiceAmount: voucher.minInvoiceAmount == null ? "" : String(voucher.minInvoiceAmount),
      startDate: dateToInput(voucher.startDate), endDate: dateToInput(voucher.endDate),
      totalQuantity: voucher.totalQuantity == null ? "" : String(voucher.totalQuantity),
      perUserLimit: voucher.perUserLimit == null ? "" : String(voucher.perUserLimit), status: String(voucher.status ?? 1),
      branchId: voucher.branchId == null ? "" : String(voucher.branchId),
      pointsCost: voucher.pointsCost == null ? "" : String(voucher.pointsCost),
      redeemStock: voucher.redeemStock == null ? "" : String(voucher.redeemStock),
      minTierId: voucher.minTierId == null ? "" : String(voucher.minTierId)
    } : EMPTY_VALUES);
    setError("");
  }, [voucher, open]);

  const setField = (field: keyof FormValues, value: string) => {
    setValues((current) => ({
      ...current,
      [field]: value,
      ...(field === "discountType" && value !== "2" ? { maxDiscount: "" } : {})
    }));
    setError("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const pointsCost = optionalNumber(values.pointsCost);
    const redeemStock = optionalNumber(values.redeemStock);
    if (values.pointsCost.trim() && (!Number.isInteger(pointsCost) || (pointsCost ?? 0) <= 0)) {
      setError("Điểm đổi phải là số nguyên lớn hơn 0.");
      return;
    }
    if (values.redeemStock.trim() && (!Number.isInteger(redeemStock) || (redeemStock ?? -1) < 0)) {
      setError("Tồn đổi phải là số nguyên không âm.");
      return;
    }
    if (values.pointsCost.trim() && values.redeemStock.trim() === "") {
      setError("Vui lòng nhập tồn đổi khi cấu hình điểm đổi.");
      return;
    }
    if ((redeemStock ?? 0) < (voucher?.redeemedCount ?? 0) && values.pointsCost.trim()) {
      setError(`Tồn đổi không được nhỏ hơn số đã đổi (${voucher?.redeemedCount ?? 0}).`);
      return;
    }

    const body: Voucher = {
      ...(voucher ?? {}),
      ...(voucher ? { id: voucher.id } : {}),
      code: values.code.trim(),
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      discountType: Number(values.discountType),
      discountValue: optionalNumber(values.discountValue),
      maxDiscount: optionalNumber(values.maxDiscount),
      minInvoiceAmount: optionalNumber(values.minInvoiceAmount),
      startDate: inputToDate(values.startDate),
      endDate: inputToDate(values.endDate),
      totalQuantity: optionalNumber(values.totalQuantity),
      perUserLimit: optionalNumber(values.perUserLimit),
      status: Number(values.status),
      branchId: optionalNumber(values.branchId),
      redeemedCount: voucher?.redeemedCount
    };
    if (pointsCost === undefined) {
      delete body.pointsCost;
      delete body.redeemStock;
      delete body.minTierId;
    } else {
      body.pointsCost = pointsCost;
      body.redeemStock = redeemStock;
      body.minTierId = optionalNumber(values.minTierId);
    }
    onSubmit(body);
  };

  const field = (key: keyof FormValues, label: string, options: { type?: string; required?: boolean; min?: string; step?: string } = {}) => (
    <div className="space-y-2">
      <Label htmlFor={`voucher-${key}`}>{label}</Label>
      <Input id={`voucher-${key}`} type={options.type ?? "text"} min={options.min} step={options.step}
        value={values[key]} onChange={(event) => setField(key, event.target.value)} required={options.required}
        disabled={isLoading || !canUpdate} />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{voucher ? "Chỉnh sửa voucher" : "Tạo voucher"}</DialogTitle>
          <DialogDescription>Thông tin voucher và tùy chọn đổi bằng điểm loyalty.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {field("code", "Mã voucher", { required: true })}
            {field("name", "Tên voucher", { required: true })}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="voucher-description">Mô tả</Label>
              <Textarea id="voucher-description" value={values.description} onChange={(event) => setField("description", event.target.value)} disabled={isLoading || !canUpdate} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="voucher-discountType">Loại giảm giá</Label>
              <Select value={values.discountType} onValueChange={(value) => setField("discountType", value)} disabled={isLoading || !canUpdate}>
                <SelectTrigger id="voucher-discountType" aria-label="Loại giảm giá"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Giảm số tiền</SelectItem>
                  <SelectItem value="2">Giảm theo %</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {field("discountValue", values.discountType === "2" ? "Giá trị giảm (%)" : "Giá trị giảm (đ)", { type: "number", min: "0", step: "any", required: true })}
            {values.discountType === "2" && field("maxDiscount", "Giảm tối đa (đ)", { type: "number", min: "0", step: "any" })}
            {field("minInvoiceAmount", "Giá trị hóa đơn tối thiểu", { type: "number", min: "0", step: "any" })}
            {field("startDate", "Bắt đầu", { type: "datetime-local", required: true })}
            {field("endDate", "Kết thúc", { type: "datetime-local", required: true })}
            {field("totalQuantity", "Tổng lượt sử dụng", { type: "number", min: "0", step: "1" })}
            {field("perUserLimit", "Giới hạn mỗi khách", { type: "number", min: "0", step: "1" })}
            {field("branchId", "ID chi nhánh (để trống nếu áp dụng toàn hệ thống)", { type: "number", min: "1", step: "1" })}
            <div className="space-y-2">
              <Label htmlFor="voucher-status">Trạng thái</Label>
              <Select value={values.status} onValueChange={(value) => setField("status", value)} disabled={isLoading || !canUpdate}>
                <SelectTrigger id="voucher-status" aria-label="Trạng thái"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="1">Hoạt động</SelectItem><SelectItem value="0">Ngừng hoạt động</SelectItem></SelectContent>
              </Select>
            </div>
          </div>

          <section className="space-y-4 rounded-lg border p-4">
            <div>
              <h3 className="font-semibold">Đổi điểm</h3>
              <p className="text-muted-foreground text-sm">Để trống điểm đổi nếu voucher không yêu cầu điểm loyalty.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {field("pointsCost", "Điểm cần đổi", { type: "number", step: "1" })}
              <div className="space-y-2">
                <Label htmlFor="voucher-redeemStock">Tồn voucher đổi điểm</Label>
                <Input id="voucher-redeemStock" type="number" min="0" step="1" value={values.redeemStock}
                  onChange={(event) => setField("redeemStock", event.target.value)} disabled={isLoading || !canUpdate} />
                {voucher && <p className="text-muted-foreground text-xs">Đã đổi: {voucher.redeemedCount ?? 0}</p>}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="voucher-minTierId">Hạng tối thiểu</Label>
                <Select value={values.minTierId || "none"} onValueChange={(value) => setField("minTierId", value === "none" ? "" : value)} disabled={isLoading || !canUpdate}>
                  <SelectTrigger id="voucher-minTierId" aria-label="Hạng tối thiểu"><SelectValue placeholder="Không yêu cầu hạng" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không yêu cầu hạng</SelectItem>
                    {tiers.map((tier) => <SelectItem key={tier.id} value={String(tier.id)}>{tier.name ?? `Hạng ${tier.id}`}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {error && <p role="alert" className="text-destructive text-sm">{error}</p>}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading}>Hủy</Button>
            <Button type="submit" disabled={isLoading || !canUpdate}>{isLoading ? "Đang lưu..." : voucher ? "Cập nhật" : "Tạo voucher"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
