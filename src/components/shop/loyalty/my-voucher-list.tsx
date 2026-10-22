"use client";

import type { components } from "@/lib/api/schema.gen";
import { Button } from "@/components/ui/button";

type MyVoucher = components["schemas"]["MyVoucherResponse"];

const STATUS_LABELS: Record<string, string> = { AVAILABLE: "Khả dụng", USED: "Đã dùng" };

export function MyVoucherList({
  vouchers,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore
}: {
  vouchers: MyVoucher[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}) {
  if (vouchers.length === 0) return <p className="py-12 text-center text-sm text-muted-foreground">Bạn chưa có voucher nào ở trạng thái này.</p>;

  return (
    <div className="space-y-4">
      <ul className="grid gap-4 md:grid-cols-2">
        {vouchers.map((voucher, index) => {
          const status = voucher.status ?? "";
          return (
            <li key={voucher.id ?? `${voucher.voucherId}-${index}`} className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold">{voucher.name ?? "Voucher"}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Mã: {voucher.code ?? "—"}</p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  {STATUS_LABELS[status] ?? (status || "Không rõ")}
                </span>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Hạn sử dụng</dt>
                  <dd className="font-medium">{formatDate(voucher.expiresAt)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Điểm đã đổi</dt>
                  <dd className="font-medium">{(voucher.pointsSpent ?? 0).toLocaleString("vi-VN")} điểm</dd>
                </div>
              </dl>
            </li>
          );
        })}
      </ul>
      {hasNextPage && (
        <Button variant="ghost" className="w-full" disabled={isFetchingNextPage} onClick={onLoadMore}>
          {isFetchingNextPage ? "Đang tải..." : "Xem thêm voucher"}
        </Button>
      )}
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("vi-VN");
}
