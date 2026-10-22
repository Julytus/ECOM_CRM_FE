import type { components } from "@/lib/api/schema.gen";

type LoyaltyAccount = components["schemas"]["LoyaltyAccountResponse"];

const formatPoints = (points?: number) => (points ?? 0).toLocaleString("vi-VN");

export function PointsSummary({ account }: { account: LoyaltyAccount }) {
  const hasNextTier =
    account.nextTierId !== undefined ||
    account.nextTierName !== undefined ||
    account.nextTierMinRankPoints !== undefined ||
    account.pointsToNextTier !== undefined;
  const progress =
    hasNextTier && account.nextTierMinRankPoints !== undefined && account.nextTierMinRankPoints > 0
      ? Math.min(100, Math.max(0, ((account.rankPoints ?? 0) / account.nextTierMinRankPoints) * 100))
      : 0;
  const isNegativeBalance = (account.balance ?? 0) < 0;

  return (
    <section aria-labelledby="points-summary-heading" className="rounded-xl border bg-card p-6 shadow-sm md:p-8">
      <h2 id="points-summary-heading" className="text-xl font-bold">Điểm của tôi</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        <div>
          <p className="text-sm text-muted-foreground">Số dư điểm</p>
          <p className={`mt-1 text-2xl font-bold ${isNegativeBalance ? "text-destructive" : ""}`}>
            {formatPoints(account.balance)}
          </p>
          {isNegativeBalance && <p className="mt-1 text-sm text-destructive">Số dư đang âm</p>}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Hạng hiện tại</p>
          <p className="mt-1 text-2xl font-bold">{account.tierName ?? "Chưa có hạng"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Điểm xếp hạng</p>
          <p className="mt-1 text-2xl font-bold">{formatPoints(account.rankPoints)}</p>
        </div>
      </div>

      {hasNextTier ? (
        <div className="mt-8">
          <div className="flex flex-wrap justify-between gap-2 text-sm">
            <span>Tiến độ đến {account.nextTierName ?? "hạng tiếp theo"}</span>
            <span>Còn {formatPoints(account.pointsToNextTier)} điểm</span>
          </div>
          <div
            role="progressbar"
            aria-label="Tiến độ lên hạng tiếp theo"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="mt-2 h-3 overflow-hidden rounded-full bg-muted"
          >
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-right text-sm text-muted-foreground">
            {formatPoints(account.rankPoints)} / {formatPoints(account.nextTierMinRankPoints)} điểm
          </p>
        </div>
      ) : (
        <p className="mt-8 font-medium">Hạng cao nhất</p>
      )}
    </section>
  );
}
