import { format, parseISO, subDays } from "date-fns";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { GroupBy } from "@/lib/api/report";

const dateString = (date: Date) => format(date, "yyyy-MM-dd");

export function defaultRevenueRange() {
  return { from: dateString(subDays(new Date(), 29)), to: dateString(new Date()) };
}

export function RevenueFilters({
  from, to, groupBy, limit, onFromChange, onToChange, onGroupByChange, onLimitChange
}: {
  from: string; to: string; groupBy: GroupBy; limit: number;
  onFromChange: (value: string) => void; onToChange: (value: string) => void;
  onGroupByChange: (value: GroupBy) => void; onLimitChange: (value: number) => void;
}) {
  const reversed = Boolean(from && to && from > to);
  const overLimit = Boolean(from && to && !reversed &&
    Math.floor((parseISO(to).getTime() - parseISO(from).getTime()) / 86400000) + 1 > 366);
  const error = reversed ? "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc." :
    overLimit ? "Khoảng ngày không được vượt quá 366 ngày." : "";
  return <section className="mb-6 rounded-lg border bg-card p-4" aria-label="Bộ lọc doanh thu">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-2"><Label htmlFor="revenue-from">Từ ngày</Label><Input id="revenue-from" type="date" value={from} max={to || undefined} onChange={e => onFromChange(e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="revenue-to">Đến ngày</Label><Input id="revenue-to" type="date" value={to} min={from || undefined} onChange={e => onToChange(e.target.value)} /></div>
      <div className="space-y-2"><Label>Nhóm dữ liệu</Label><Select value={groupBy} onValueChange={(value: GroupBy) => onGroupByChange(value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="day">Theo ngày</SelectItem><SelectItem value="week">Theo tuần</SelectItem><SelectItem value="month">Theo tháng</SelectItem></SelectContent></Select></div>
      <div className="space-y-2"><Label htmlFor="revenue-limit">Số sản phẩm hàng đầu</Label><Input id="revenue-limit" type="number" min={1} max={50} value={limit} onChange={e => onLimitChange(Math.min(50, Math.max(1, Number(e.target.value) || 1)))} /></div>
    </div>
    {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
  </section>;
}
