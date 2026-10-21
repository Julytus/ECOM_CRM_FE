import { BarChart3, CircleDollarSign, Package, Receipt, RotateCcw, Truck, XCircle, Clock3 } from "lucide-react";
import type { components } from "@/lib/api/schema.gen";
import { formatVnd } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Summary = components["schemas"]["RevenueSummary"];
const metrics = [
  { key: "totalRevenue", previous: "previousTotalRevenue", title: "Tổng doanh thu", icon: CircleDollarSign, money: true },
  { key: "invoiceCount", previous: "previousInvoiceCount", title: "Số hóa đơn", icon: Receipt },
  { key: "avgOrderValue", previous: "previousAvgOrderValue", title: "Giá trị đơn trung bình", icon: BarChart3, money: true },
  { key: "cancelledCount", previous: "previousCancelledCount", title: "Đơn đã hủy", icon: XCircle, bad: true },
  { key: "discountTotal", previous: "previousDiscountTotal", title: "Tổng giảm giá", icon: Package, money: true },
  { key: "refundedAmount", previous: "previousRefundedAmount", title: "Đã hoàn tiền", icon: RotateCcw, money: true, bad: true },
  { key: "shippingTotal", previous: "previousShippingTotal", title: "Phí vận chuyển", icon: Truck, money: true, description: "Doanh thu đã gồm phí ship" },
  { key: "unpaidAmount", previous: "previousUnpaidAmount", title: "Chờ thu", icon: Clock3, money: true, bad: true }
] as const;

export function KpiCards({ data, loading, error }: { data?: Summary; loading: boolean; error: boolean }) {
  if (error) return <p role="alert" className="rounded-md border border-destructive/40 p-4 text-sm text-destructive">Không thể tải các chỉ số doanh thu.</p>;
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(metric => {
    const current = data?.[metric.key] ?? 0;
    const previous = data?.[metric.previous] ?? 0;
    const explicitChange = metric.key === "totalRevenue" ? data?.totalRevenueChangePercent : metric.key === "invoiceCount" ? data?.invoiceCountChangePercent : undefined;
    const change = explicitChange ?? (previous === 0 ? undefined : (Number(current) - Number(previous)) / Number(previous) * 100);
    const increaseIsBad = "bad" in metric && metric.bad;
    const positive = change !== undefined && (increaseIsBad ? change < 0 : change >= 0);
    const value = "money" in metric && metric.money ? formatVnd(Number(current)) : Number(current).toLocaleString("vi-VN");
    return <Card key={metric.key}><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle><metric.icon className="size-4 text-muted-foreground" /></CardHeader><CardContent>{loading ? <><Skeleton className="mb-2 h-8 w-28"/><Skeleton className="h-3 w-24"/></> : <><div className="text-2xl font-bold">{value}</div><p className="mt-1 text-xs text-muted-foreground">{change === undefined ? "—" : <span className={positive ? "text-green-600" : "text-red-600"}>{change > 0 ? "+" : ""}{change.toFixed(1)}% so với kỳ trước</span>}</p>{"description" in metric && <p className="text-xs text-muted-foreground">{metric.description}</p>}</>}</CardContent></Card>;
  })}</div>;
}
