"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RedeemConfirmDialog } from "@/components/shop/loyalty/redeem-confirm-dialog";
import { Link } from "@tanstack/react-router";
import type { components } from "@/lib/api/schema.gen";

type RedeemableVoucher = components["schemas"]["RedeemableVoucherResponse"];

export function RedeemableCard({
  voucher,
  balance,
  onRedeemError,
  guest = false,
  linked = true,
  requiredTierName
}: {
  voucher: RedeemableVoucher;
  balance: number;
  onRedeemError: () => void;
  guest?: boolean;
  linked?: boolean;
  requiredTierName?: string;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const reason = balance < 0 ? "Số dư điểm đang âm" : voucher.tierOk === false ? "Chưa đủ hạng" : voucher.affordable === false ? "Không đủ điểm" : undefined;
  const pointsShortfall = Math.max(0, (voucher.pointsCost ?? 0) - balance);
  const remaining =
    voucher.redeemStock !== undefined && voucher.redeemedCount !== undefined
      ? Math.max(0, voucher.redeemStock - voucher.redeemedCount)
      : undefined;

  return (
    <article className="flex flex-col justify-between gap-5 rounded-xl border bg-card p-5 shadow-sm">
      <div>
        <h3 className="text-lg font-bold">{voucher.name ?? "Voucher"}</h3>
        <p className="mt-1 text-sm text-muted-foreground">Mã: {voucher.code ?? "—"}</p>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Điểm cần đổi</dt>
            <dd className="font-semibold">{(voucher.pointsCost ?? 0).toLocaleString("vi-VN")} điểm</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Yêu cầu hạng</dt>
            <dd className="font-semibold">
              {voucher.minTierId === undefined ? "Không yêu cầu" : requiredTierName ?? "Yêu cầu hạng"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Hạn đổi</dt>
            <dd className="font-semibold">{formatDate(voucher.endDate)}</dd>
          </div>
          {remaining !== undefined && (
            <div>
              <dt className="text-muted-foreground">Lượt còn</dt>
              <dd className="font-semibold">{remaining.toLocaleString("vi-VN")}</dd>
            </div>
          )}
        </dl>
      </div>
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        {guest ? (
          <Button asChild>
            <Link to="/login">Đăng nhập để đổi</Link>
          </Button>
        ) : !linked ? (
          <Button disabled>Đổi</Button>
        ) : (
          <Button disabled={Boolean(reason) || voucher.id === undefined} onClick={() => setDialogOpen(true)}>
            Đổi
          </Button>
        )}
        {guest ? null : !linked ? (
          <p className="text-sm text-muted-foreground">Tài khoản chưa liên kết, liên hệ cửa hàng</p>
        ) : reason ? (
          <p className="text-sm text-destructive">
            {reason === "Không đủ điểm" && voucher.affordable === false
              ? `Thiếu ${pointsShortfall.toLocaleString("vi-VN")} điểm`
              : reason === "Chưa đủ hạng"
                ? reason
                : reason}
          </p>
        ) : (
          <p className="text-sm text-emerald-700">Đủ điểm</p>
        )}
      </div>
      {!guest && linked && (
        <RedeemConfirmDialog
          voucher={voucher}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onError={onRedeemError}
        />
      )}
    </article>
  );
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("vi-VN");
}
