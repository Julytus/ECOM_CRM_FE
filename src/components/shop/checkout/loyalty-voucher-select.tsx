import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isUnlinkedAccountError } from "@/lib/api/loyalty";
import { useAuthStore } from "@/lib/stores/auth";
import { myVouchersInfiniteQueryOptions } from "@/lib/tanstack/options/loyalty";

const NO_VOUCHER = "__no-voucher__";

export function LoyaltyVoucherSelect({
  value,
  onChange
}: {
  value?: number;
  onChange: (value?: number) => void;
}) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const vouchersQuery = useInfiniteQuery(
    myVouchersInfiniteQueryOptions("AVAILABLE", { enabled: Boolean(accessToken) })
  );

  const isUnlinked = isUnlinkedAccountError(vouchersQuery.error);
  if (!accessToken || isUnlinked || !vouchersQuery.isSuccess || vouchersQuery.isError) return null;

  const vouchers = vouchersQuery.data.pages
    .flatMap((page) => page.items ?? [])
    .filter((voucher) => voucher.status === "AVAILABLE" && voucher.id !== undefined);

  return (
    <div className="grid gap-2 text-sm font-medium">
      <span>Voucher đổi điểm</span>
      <Select
        value={value === undefined ? NO_VOUCHER : String(value)}
        onValueChange={(nextValue) => onChange(nextValue === NO_VOUCHER ? undefined : Number(nextValue))}
      >
        <SelectTrigger aria-label="Voucher đổi điểm" className="w-full">
          <SelectValue placeholder="Không dùng" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_VOUCHER}>Không dùng</SelectItem>
          {vouchers.map((voucher) => (
            <SelectItem key={voucher.id} value={String(voucher.id)}>
              {voucher.name || voucher.code || `Voucher #${voucher.id}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {vouchersQuery.hasNextPage && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-fit px-0"
          disabled={vouchersQuery.isFetchingNextPage}
          onClick={() => void vouchersQuery.fetchNextPage()}
        >
          {vouchersQuery.isFetchingNextPage ? "Đang tải…" : "Tải thêm voucher"}
        </Button>
      )}
    </div>
  );
}
