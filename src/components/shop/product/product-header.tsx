import { StockBadge, type StockBadgeProps } from "@/components/shop/stock-badge";
import { Star } from "lucide-react";

export function ProductHeader({
  brand,
  name,
  rating,
  reviewCount,
  status
}: {
  brand: string;
  name: string;
  rating: number;
  reviewCount: number;
  status: StockBadgeProps["status"];
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-muted-foreground text-[10px] font-bold tracking-[0.25em] uppercase">
            {brand}
          </p>
          <div className="flex items-center gap-1 border-l border-neutral-200 pl-3 dark:border-neutral-800">
            <Star className="size-2.5 fill-yellow-400 text-yellow-400" />
            <span className="text-[10px] font-bold">{rating.toFixed(1)}</span>
            <span className="text-[10px] text-neutral-400">({reviewCount})</span>
          </div>
        </div>
        <StockBadge status={status} />
      </div>
      <h2 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-neutral-50">
        {name}
      </h2>
    </div>
  );
}
