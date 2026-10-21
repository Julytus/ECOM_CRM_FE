import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { components } from "@/lib/api/schema.gen";
import { formatVnd } from "@/lib/format";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Product = components["schemas"]["TopProductStatistic"];
const config = { revenue: { label: "Doanh thu", color: "var(--chart-1)" } } satisfies ChartConfig;
export function TopProducts({ data, loading, error }: { data?: Product[]; loading: boolean; error: boolean }) {
 return <Card><CardHeader><CardTitle>Sản phẩm doanh thu cao nhất</CardTitle></CardHeader><CardContent>{error ? <p role="alert" className="py-20 text-center text-sm text-destructive">Không thể tải danh sách sản phẩm.</p> : loading ? <Skeleton className="h-[300px] w-full"/> : !data?.length ? <p className="text-muted-foreground flex h-[300px] items-center justify-center text-sm">Chưa có dữ liệu trong khoảng thời gian này.</p> : <ChartContainer config={config} className="h-[300px] w-full"><BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}><CartesianGrid horizontal={false}/><XAxis type="number" hide/><YAxis type="category" dataKey="productName" width={140} tickLine={false} axisLine={false} tick={{ fontSize: 12 }}/><ChartTooltip content={<ChartTooltipContent formatter={(value) => formatVnd(Number(value))}/>}/><Bar dataKey="revenue" fill="var(--color-revenue)" radius={4}/></BarChart></ChartContainer>}</CardContent></Card>;
}
