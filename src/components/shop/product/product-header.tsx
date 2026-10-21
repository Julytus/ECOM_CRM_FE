import { StockBadge, type StockBadgeProps } from "@/components/shop/stock-badge";
import { Star } from "lucide-react";

export function ProductHeader({
  brand,
  name,
  rating,
  reviewCount,
  status,
  as: Heading = "h2"
}: {
  brand: string;
  name: string;
  rating: number;
  reviewCount: number;
  status: StockBadgeProps["status"];
  /** Use "h1" when the header is the page title (product detail page). */
  as?: "h1" | "h2";
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.25em] uppercase">
            {brand}
          </p>
          <div className="border-border flex items-center gap-1 border-l pl-3 text-xs">
            <Star aria-hidden="true" className="fill-warning text-warning size-3" />
            <span className="font-semibold tabular-nums">
              <span className="sr-only">Đánh giá </span>
              {rating.toFixed(1)}
              <span className="sr-only">/5</span>
            </span>
            <span className="text-muted-foreground">
              ({reviewCount}
              <span className="sr-only"> lượt đánh giá</span>)
            </span>
          </div>
        </div>
        <StockBadge status={status} />
      </div>
      <Heading className="font-display text-foreground text-[clamp(1.875rem,4vw,2.75rem)] leading-[1.1] font-semibold tracking-[-0.02em] text-balance">
        {name}
      </Heading>
    </div>
  );
}
