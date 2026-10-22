import type { components } from "@/lib/api/schema.gen";

type Account = components["schemas"]["LoyaltyAccount"];
type Tier = components["schemas"]["LoyaltyTier"];

export function AccountCard({ account, tiers }: { account: Account; tiers: Tier[] }) {
  const tierName = tiers.find((tier) => tier.id === account.tierId)?.name ?? `Hạng #${account.tierId ?? "—"}`;
  return (
    <section aria-label="Tài khoản điểm" className="grid gap-4 rounded-xl border bg-card p-5 sm:grid-cols-3">
      <div><p className="text-sm text-muted-foreground">Số dư điểm</p><p className={`text-2xl font-semibold ${Number(account.balance ?? 0) < 0 ? "text-destructive" : ""}`}>{(account.balance ?? 0).toLocaleString("vi-VN")}</p></div>
      <div><p className="text-sm text-muted-foreground">Điểm xếp hạng</p><p className="text-2xl font-semibold">{(account.rankPoints ?? 0).toLocaleString("vi-VN")}</p></div>
      <div><p className="text-sm text-muted-foreground">Hạng thành viên</p><p className="text-2xl font-semibold">{tierName}</p></div>
    </section>
  );
}
