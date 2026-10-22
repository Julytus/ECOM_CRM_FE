import type { components } from "@/lib/api/schema.gen";

type LoyaltyTransaction = components["schemas"]["LoyaltyTransaction"];

const TYPE_LABELS: Record<string, string> = {
  EARN: "Tích điểm",
  REVERSE_EARN: "Thu hồi điểm",
  REDEEM: "Đổi điểm",
  ADJUST: "Điều chỉnh điểm"
};

function signedPoints(transaction: LoyaltyTransaction) {
  const points = transaction.points ?? 0;
  const amount = Math.abs(points).toLocaleString("vi-VN");
  if (points === 0) return "0";
  if (transaction.type === "EARN") return `+${amount}`;
  if (transaction.type === "REVERSE_EARN" || transaction.type === "REDEEM") return `-${amount}`;
  return points > 0 ? `+${amount}` : `-${amount}`;
}

export function TransactionList({ transactions }: { transactions: LoyaltyTransaction[] }) {
  if (transactions.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Chưa có giao dịch điểm nào.</p>;
  }

  return (
    <ul className="divide-y">
      {transactions.map((transaction, index) => {
        const negativeBalance = (transaction.balanceAfter ?? 0) < 0;
        return (
          <li key={transaction.id ?? `${transaction.createdAt}-${index}`} className="grid gap-3 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="font-semibold">{TYPE_LABELS[transaction.type ?? ""] ?? transaction.type ?? "Giao dịch điểm"}</p>
              {transaction.note && <p className="mt-1 text-sm text-muted-foreground">{transaction.note}</p>}
              <p className="mt-1 text-sm text-muted-foreground">
                {transaction.createdAt ? new Date(transaction.createdAt).toLocaleString("vi-VN") : "—"}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="font-bold">{signedPoints(transaction)} điểm</p>
              {transaction.balanceAfter !== undefined && (
                <p className={`text-sm ${negativeBalance ? "text-destructive" : "text-muted-foreground"}`}>
                  Số dư sau giao dịch: {transaction.balanceAfter.toLocaleString("vi-VN")}
                  {negativeBalance && <span className="block">Số dư đang âm</span>}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
