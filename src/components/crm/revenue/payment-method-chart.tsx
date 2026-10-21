import { Cell, Pie, PieChart } from "recharts";
import type { components } from "@/lib/api/schema.gen";
import { formatVnd } from "@/lib/format";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Payment = components["schemas"]["RevenuePaymentMethod"];
const labels: Record<string, string> = {
  COD: "COD",
  PAYOS: "PayOS",
  CASH: "Tiền mặt",
  TRANSFER: "Chuyển khoản"
};
const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];
const config = Object.fromEntries(
  Object.entries(labels).map(([key, label], i) => [key, { label, color: colors[i] }])
) satisfies ChartConfig;
export function PaymentMethodChart({
  data,
  loading,
  error
}: {
  data?: Payment[];
  loading: boolean;
  error: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Doanh thu theo phương thức thanh toán</CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <p role="alert" className="text-destructive py-20 text-center text-sm">
            Không thể tải doanh thu theo phương thức thanh toán.
          </p>
        ) : loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : !data?.length ? (
          <p className="text-muted-foreground flex h-[300px] items-center justify-center text-sm">
            Chưa có dữ liệu trong khoảng thời gian này.
          </p>
        ) : (
          <ChartContainer config={config} className="mx-auto h-[300px] w-full">
            <PieChart>
              <Pie
                data={data}
                dataKey="revenue"
                nameKey="method"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
              >
                {data.map((entry, i) => (
                  <Cell
                    key={entry.method ?? i}
                    fill={
                      colors[Math.max(0, Object.keys(labels).indexOf(entry.method ?? ""))] ??
                      colors[i % colors.length]
                    }
                  />
                ))}
              </Pie>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatVnd(Number(value))}
                    labelFormatter={(value) => labels[String(value)] ?? String(value)}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent nameKey="method" />} />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
