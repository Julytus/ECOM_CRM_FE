import { Badge } from "@/components/ui/badge";

const STATUS_LABELS: Record<number, string> = {
  0: "Nháp",
  1: "Hoàn tất",
  2: "Đã hủy",
  3: "Chưa thanh toán",
  4: "Hoàn tiền"
};

const STATUS_STYLES: Record<number, string> = {
  0: "border-stone-200 bg-stone-50 text-stone-600",
  1: "border-emerald-200 bg-emerald-50 text-emerald-700",
  2: "border-red-200 bg-red-50 text-red-700",
  3: "border-amber-200 bg-amber-50 text-amber-700",
  4: "border-purple-200 bg-purple-50 text-purple-700"
};

export function InvoiceStatusBadge({ status }: { status?: number }) {
  return (
    <Badge variant="outline" className={`rounded-full ${STATUS_STYLES[status ?? -1] ?? ""}`}>
      {status !== undefined ? STATUS_LABELS[status] ?? `Trạng thái ${status}` : "—"}
    </Badge>
  );
}
