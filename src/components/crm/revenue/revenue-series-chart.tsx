import { format, parseISO } from "date-fns";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { components } from "@/lib/api/schema.gen";
import type { GroupBy } from "@/lib/api/report";
import { formatVnd } from "@/lib/format";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Bucket = components["schemas"]["RevenueBucket"];
const config = { revenue: { label: "Doanh thu", color: "var(--chart-1)" } } satisfies ChartConfig;
export function RevenueSeriesChart({ data, loading, error, groupBy }: { data?: Bucket[]; loading: boolean; error: boolean; groupBy: GroupBy }) {
  return <Card><CardHeader><CardTitle>Doanh thu theo thời gian</CardTitle></CardHeader><CardContent>{error ? <p role="alert" className="py-20 text-center text-sm text-destructive">Không thể tải biểu đồ doanh thu.</p> : loading ? <Skeleton className="h-[300px] w-full"/> : !data?.length ? <p className="text-muted-foreground flex h-[300px] items-center justify-center text-sm">Chưa có dữ liệu trong khoảng thời gian này.</p> : <ChartContainer config={config} className="h-[300px] w-full"><AreaChart data={data}><CartesianGrid vertical={false}/><XAxis dataKey="bucket" tickLine={false} axisLine={false} tickFormatter={(v: string) => { const d = parseISO(v); return Number.isNaN(d.getTime()) ? v : format(d, groupBy === "month" ? "MM/yyyy" : "dd/MM"); }}/><YAxis tickLine={false} axisLine={false} tickFormatter={(v: number) => new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(v)}/><ChartTooltip content={<ChartTooltipContent labelFormatter={(v) => String(v)} formatter={(v) => formatVnd(Number(v))}/>}/><Area dataKey="revenue" type="monotone" stroke="var(--color-revenue)" fill="var(--color-revenue)" fillOpacity={0.18} strokeWidth={2}/></AreaChart></ChartContainer>}</CardContent></Card>;
}
