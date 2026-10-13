"use client";

import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { addDays, format, parseISO, subDays } from "date-fns";
import { vi } from "date-fns/locale";
import {
  AlertCircle,
  BarChart3,
  Boxes,
  CalendarDays,
  CircleDollarSign,
  PackageCheck,
  RotateCw,
  ShoppingCart,
  SlidersHorizontal,
  TrendingUp
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis
} from "recharts";

import {
  createRevenueQueryOptions,
  createOrderStatusQueryOptions,
  createTopProductsQueryOptions,
  createAovQueryOptions,
  createInventoryQueryOptions
} from "@/lib/tanstack/options/dashboard";
import { formatVnd } from "@/lib/format";
import type {
  GroupBy,
  RevenueDatapoint,
  OrderStatusDatapoint,
  TopProductsDatapoint,
  AovDatapoint,
  InventoryResponse,
  SortByProduct
} from "@/lib/types/dashboard";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

export const Route = createFileRoute("/crm/dashboard")({
  component: CrmDashboard
});

type DatePreset = "7" | "30" | "90" | "CUSTOM";
type RefreshInterval = "OFF" | "30" | "60";

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: "Hoàn thành",
  PROCESSING: "Đang xử lý",
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
  REFUNDED: "Đã hoàn tiền",
  FAILED: "Thất bại"
};

const statusChartConfig = {
  COMPLETED: { label: "Hoàn thành", color: "var(--chart-2)" },
  PROCESSING: { label: "Đang xử lý", color: "var(--chart-1)" },
  PENDING: { label: "Chờ xử lý", color: "var(--chart-3)" },
  CONFIRMED: { label: "Đã xác nhận", color: "var(--chart-4)" },
  CANCELLED: { label: "Đã hủy", color: "var(--chart-5)" },
  REFUNDED: { label: "Đã hoàn tiền", color: "var(--chart-4)" },
  FAILED: { label: "Thất bại", color: "var(--chart-5)" }
} satisfies ChartConfig;

const revenueChartConfig = {
  revenue: { label: "Doanh thu", color: "var(--chart-1)" }
} satisfies ChartConfig;

const aovChartConfig = {
  averageOrderValue: {
    label: "Giá trị đơn trung bình",
    color: "var(--chart-2)"
  }
} satisfies ChartConfig;

const topProductsChartConfig = {
  revenue: { label: "Doanh thu", color: "var(--chart-1)" }
} satisfies ChartConfig;

function dateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function formatChartDate(value: string, pattern = "dd/MM"): string {
  if (!value) return "";
  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? value : format(parsed, pattern, { locale: vi });
}

function formatCompactVnd(value: number): string {
  if (value >= 1_000_000_000)
    return `${(value / 1_000_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ`;
  if (value >= 1_000_000)
    return `${(value / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tr`;
  if (value >= 1_000)
    return `${(value / 1_000).toLocaleString("vi-VN", { maximumFractionDigits: 0 })}k`;
  return value.toLocaleString("vi-VN");
}

function MetricCard({
  title,
  value,
  description,
  loading,
  icon: Icon,
  accent = false
}: {
  title: string;
  value: React.ReactNode;
  description: string;
  loading: boolean;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <Card className={accent ? "border-amber-200 dark:border-amber-900" : undefined}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${accent ? "text-amber-600" : "text-muted-foreground"}`} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <Skeleton className="mb-2 h-8 w-28" />
            <Skeleton className="h-3 w-20" />
          </>
        ) : (
          <>
            <div className={`text-2xl font-bold tracking-tight ${accent ? "text-amber-600" : ""}`}>
              {value}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ChartLoading() {
  return <Skeleton className="h-[300px] w-full rounded-lg" />;
}

function EmptyChart() {
  return (
    <div className="text-muted-foreground flex h-[300px] items-center justify-center rounded-lg border border-dashed text-sm">
      Chưa có dữ liệu trong khoảng thời gian này.
    </div>
  );
}

function CrmDashboard() {
  const [datePreset, setDatePreset] = React.useState<DatePreset>("30");
  const [fromDate, setFromDate] = React.useState(() => dateString(subDays(new Date(), 29)));
  const [endDate, setEndDate] = React.useState(() => dateString(new Date()));
  const [groupBy, setGroupBy] = React.useState<GroupBy>("DAY");
  const [topLimit, setTopLimit] = React.useState("5");
  const [topSortBy, setTopSortBy] = React.useState<SortByProduct>("REVENUE");
  const [inventoryThreshold, setInventoryThreshold] = React.useState("5");
  const [inventoryLimit, setInventoryLimit] = React.useState("10");
  const [refreshInterval, setRefreshInterval] = React.useState<RefreshInterval>("OFF");
  const [filtersOpen, setFiltersOpen] = React.useState(true);

  const isValidDateRange = Boolean(fromDate) && Boolean(endDate) && fromDate <= endDate;

  // The UI's end date is inclusive. The API uses an exclusive toDate.
  const toDateExclusive = React.useMemo(() => {
    if (!endDate) return "";
    return dateString(addDays(parseISO(endDate), 1));
  }, [endDate]);

  const refetchInterval = refreshInterval === "OFF" ? false : Number(refreshInterval) * 1000;

  const revenueQuery = useQuery({
    ...createRevenueQueryOptions({
      fromDate,
      toDate: toDateExclusive,
      groupBy
    }),
    enabled: isValidDateRange,
    refetchInterval
  });

  const orderStatusQuery = useQuery({
    ...createOrderStatusQueryOptions({
      fromDate,
      toDate: toDateExclusive
    }),
    enabled: isValidDateRange,
    refetchInterval
  });

  const topProductsQuery = useQuery({
    ...createTopProductsQueryOptions({
      fromDate,
      toDate: toDateExclusive,
      limit: Number(topLimit),
      sortBy: topSortBy
    }),
    enabled: isValidDateRange,
    refetchInterval
  });

  const aovQuery = useQuery({
    ...createAovQueryOptions({
      fromDate,
      toDate: toDateExclusive,
      groupBy
    }),
    enabled: isValidDateRange,
    refetchInterval
  });

  const inventoryQuery = useQuery({
    ...createInventoryQueryOptions({
      threshold: Number(inventoryThreshold),
      limit: Number(inventoryLimit)
    }),
    refetchInterval
  });

  const revenueData = (revenueQuery.data ?? []) as RevenueDatapoint[];
  const orderStatusData = (orderStatusQuery.data ?? []) as OrderStatusDatapoint[];
  const topProductsData = (topProductsQuery.data ?? []) as TopProductsDatapoint[];
  const aovData = (aovQuery.data ?? []) as AovDatapoint[];
  const inventoryData = (inventoryQuery.data ?? {}) as InventoryResponse;
  const inventoryItems = inventoryData.items ?? [];

  const totalRevenue = revenueData.reduce((sum, point) => sum + Number(point.revenue || 0), 0);
  const totalOrders = orderStatusData.reduce(
    (sum, point) => sum + Number(point.totalOrders || 0),
    0
  );
  const paidOrderCount = revenueData.reduce(
    (sum, point) => sum + Number(point.totalOrders || 0),
    0
  );
  const averageAov = paidOrderCount > 0 ? totalRevenue / paidOrderCount : 0;
  const lowStockCount = Number(inventoryData.lowStockVariants ?? 0);
  const outOfStockCount = Number(inventoryData.outOfStockVariants ?? 0);

  const pieData = orderStatusData.map((item) => ({
    ...item,
    status: String(item.status ?? "UNKNOWN")
  }));

  const dateRangeLabel =
    isValidDateRange && fromDate && endDate
      ? `${format(parseISO(fromDate), "dd/MM/yyyy", { locale: vi })} – ${format(
          parseISO(endDate),
          "dd/MM/yyyy",
          { locale: vi }
        )}`
      : "Khoảng ngày không hợp lệ";

  function applyPreset(preset: Exclude<DatePreset, "CUSTOM">) {
    const days = Number(preset);
    const today = new Date();
    setDatePreset(preset);
    setFromDate(dateString(subDays(today, days - 1)));
    setEndDate(dateString(today));
  }

  function resetFilters() {
    applyPreset("30");
    setGroupBy("DAY");
    setTopLimit("5");
    setTopSortBy("REVENUE");
    setInventoryThreshold("5");
    setInventoryLimit("10");
    setRefreshInterval("OFF");
  }

  function refreshAll() {
    void revenueQuery.refetch();
    void orderStatusQuery.refetch();
    void topProductsQuery.refetch();
    void aovQuery.refetch();
    void inventoryQuery.refetch();
  }

  const isRefreshing =
    revenueQuery.isFetching ||
    orderStatusQuery.isFetching ||
    topProductsQuery.isFetching ||
    aovQuery.isFetching ||
    inventoryQuery.isFetching;

  return (
    <main className="space-y-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div className="space-y-1">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4" />
            <span>{dateRangeLabel}</span>
            <Badge variant="outline">Dashboard</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Tổng quan kinh doanh</h1>
          <p className="text-muted-foreground text-sm">
            Phân tích doanh thu, đơn hàng, sản phẩm bán chạy và tồn kho.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setFiltersOpen((value) => !value)}>
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            {filtersOpen ? "Ẩn bộ lọc" : "Bộ lọc nâng cao"}
          </Button>
          <Button
            variant="outline"
            onClick={refreshAll}
            disabled={isRefreshing || !isValidDateRange}
          >
            <RotateCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </header>

      {filtersOpen && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Bộ lọc báo cáo</CardTitle>
            <CardDescription>
              Các thay đổi sẽ tự động cập nhật query và tải lại dữ liệu liên quan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Khoảng thời gian</Label>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["7", "7 ngày"],
                    ["30", "30 ngày"],
                    ["90", "90 ngày"]
                  ] as const
                ).map(([value, label]) => (
                  <Button
                    key={value}
                    type="button"
                    size="sm"
                    variant={datePreset === value ? "default" : "outline"}
                    onClick={() => applyPreset(value)}
                  >
                    {label}
                  </Button>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant={datePreset === "CUSTOM" ? "default" : "outline"}
                  onClick={() => setDatePreset("CUSTOM")}
                >
                  Tùy chỉnh
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:max-w-xl">
                <div className="space-y-1.5">
                  <Label htmlFor="dashboard-from-date" className="text-muted-foreground text-xs">
                    Từ ngày
                  </Label>
                  <Input
                    id="dashboard-from-date"
                    type="date"
                    value={fromDate}
                    max={endDate || undefined}
                    onChange={(event) => {
                      setDatePreset("CUSTOM");
                      setFromDate(event.target.value);
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dashboard-to-date" className="text-muted-foreground text-xs">
                    Đến ngày (bao gồm)
                  </Label>
                  <Input
                    id="dashboard-to-date"
                    type="date"
                    value={endDate}
                    min={fromDate || undefined}
                    max={dateString(new Date())}
                    onChange={(event) => {
                      setDatePreset("CUSTOM");
                      setEndDate(event.target.value);
                    }}
                  />
                </div>
              </div>
              {!isValidDateRange && (
                <p className="text-destructive text-sm">
                  Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.
                </p>
              )}
            </div>

            <div className="grid gap-4 border-t pt-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2">
                <Label>Nhóm dữ liệu biểu đồ</Label>
                <Select value={groupBy} onValueChange={(value) => setGroupBy(value as GroupBy)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn cách nhóm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAY">Theo ngày</SelectItem>
                    <SelectItem value="WEEK">Theo tuần</SelectItem>
                    <SelectItem value="MONTH">Theo tháng</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-xs">Áp dụng cho doanh thu và AOV.</p>
              </div>

              <div className="space-y-2">
                <Label>Sắp xếp top sản phẩm</Label>
                <Select
                  value={topSortBy}
                  onValueChange={(value) => setTopSortBy(value as SortByProduct)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sắp xếp theo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REVENUE">Doanh thu cao nhất</SelectItem>
                    <SelectItem value="QUANTITY">Số lượng bán nhiều nhất</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-xs">
                  Thứ tự áp dụng trực tiếp từ API top-products.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Số sản phẩm hiển thị</Label>
                <Select value={topLimit} onValueChange={setTopLimit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Số lượng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Top 5</SelectItem>
                    <SelectItem value="10">Top 10</SelectItem>
                    <SelectItem value="20">Top 20</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-xs">Thay đổi tham số limit của API.</p>
              </div>

              <div className="space-y-2">
                <Label>Tự động làm mới</Label>
                <Select
                  value={refreshInterval}
                  onValueChange={(value) => setRefreshInterval(value as RefreshInterval)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tần suất làm mới" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OFF">Tắt</SelectItem>
                    <SelectItem value="30">Mỗi 30 giây</SelectItem>
                    <SelectItem value="60">Mỗi 60 giây</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-xs">Tự tải lại các query đang hiển thị.</p>
              </div>
            </div>

            <div className="grid gap-4 border-t pt-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2">
                <Label>Ngưỡng cảnh báo tồn kho</Label>
                <Select value={inventoryThreshold} onValueChange={setInventoryThreshold}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ngưỡng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Chỉ hết hàng (≤ 0)</SelectItem>
                    <SelectItem value="3">≤ 3 sản phẩm</SelectItem>
                    <SelectItem value="5">≤ 5 sản phẩm</SelectItem>
                    <SelectItem value="10">≤ 10 sản phẩm</SelectItem>
                    <SelectItem value="20">≤ 20 sản phẩm</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-xs">
                  Tham số threshold của API inventory.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Số dòng cảnh báo</Label>
                <Select value={inventoryLimit} onValueChange={setInventoryLimit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Số dòng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 dòng</SelectItem>
                    <SelectItem value="10">10 dòng</SelectItem>
                    <SelectItem value="20">20 dòng</SelectItem>
                    <SelectItem value="50">50 dòng</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-xs">Tham số limit của API inventory.</p>
              </div>

              <div className="flex items-end">
                <Button variant="ghost" onClick={resetFilters} className="w-full sm:w-auto">
                  Khôi phục mặc định
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(revenueQuery.isError ||
        orderStatusQuery.isError ||
        topProductsQuery.isError ||
        aovQuery.isError ||
        inventoryQuery.isError) && (
        <div className="border-destructive/30 bg-destructive/5 flex items-start gap-3 rounded-lg border p-4 text-sm">
          <AlertCircle className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Không thể tải một phần dữ liệu dashboard.</p>
            <p className="text-muted-foreground">
              Kiểm tra API hoặc thử làm mới dữ liệu. Các bộ lọc ngày chỉ áp dụng cho 4 API báo cáo;
              tồn kho dùng ngưỡng riêng.
            </p>
          </div>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Tổng doanh thu đã thanh toán"
          value={formatVnd(totalRevenue)}
          description={`Trong ${datePreset === "CUSTOM" ? "khoảng ngày tùy chọn" : `${datePreset} ngày gần nhất`}`}
          loading={revenueQuery.isLoading}
          icon={CircleDollarSign}
        />
        <MetricCard
          title="Tổng đơn hàng"
          value={totalOrders.toLocaleString("vi-VN")}
          description="Tất cả trạng thái trong kỳ"
          loading={orderStatusQuery.isLoading}
          icon={ShoppingCart}
        />
        <MetricCard
          title="Giá trị đơn trung bình (AOV)"
          value={formatVnd(averageAov)}
          description="Doanh thu đã thanh toán / số đơn đã thanh toán"
          loading={revenueQuery.isLoading}
          icon={BarChart3}
        />
        <MetricCard
          title="Biến thể sắp hết hàng"
          value={lowStockCount.toLocaleString("vi-VN")}
          description={`${outOfStockCount} biến thể đã hết hàng · ngưỡng ${inventoryThreshold}`}
          loading={inventoryQuery.isLoading}
          icon={AlertCircle}
          accent={lowStockCount > 0}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Doanh thu theo thời gian</CardTitle>
            <CardDescription>
              Doanh thu đơn đã thanh toán · nhóm theo{" "}
              {groupBy === "DAY" ? "ngày" : groupBy === "WEEK" ? "tuần" : "tháng"}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {revenueQuery.isLoading ? (
              <ChartLoading />
            ) : revenueData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ChartContainer config={revenueChartConfig} className="h-[300px] w-full">
                <AreaChart
                  accessibilityLayer
                  data={revenueData}
                  margin={{ left: 8, right: 8, top: 12 }}
                >
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="period"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={24}
                    tickFormatter={(value: string) =>
                      formatChartDate(value, groupBy === "MONTH" ? "MM/yyyy" : "dd/MM")
                    }
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={58}
                    tickFormatter={(value: number) => formatCompactVnd(value)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) =>
                          formatChartDate(
                            String(value),
                            groupBy === "MONTH" ? "MM/yyyy" : "dd/MM/yyyy"
                          )
                        }
                        formatter={(value) => formatVnd(Number(value))}
                      />
                    }
                  />
                  <Area
                    dataKey="revenue"
                    type="monotone"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                    fill="url(#revenueFill)"
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Trạng thái đơn hàng</CardTitle>
            <CardDescription>Cơ cấu đơn hàng trong khoảng thời gian đã chọn.</CardDescription>
          </CardHeader>
          <CardContent>
            {orderStatusQuery.isLoading ? (
              <ChartLoading />
            ) : pieData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ChartContainer config={statusChartConfig} className="mx-auto h-[300px] w-full">
                <PieChart accessibilityLayer>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        nameKey="status"
                        labelFormatter={(value) => STATUS_LABELS[String(value)] ?? String(value)}
                        formatter={(value, _name, item) => {
                          const payload = item.payload as OrderStatusDatapoint;
                          return [
                            `${Number(value).toLocaleString("vi-VN")} đơn (${Number(payload.percentage ?? 0).toFixed(1)}%)`,
                            "Số đơn"
                          ];
                        }}
                      />
                    }
                  />
                  <Pie
                    data={pieData}
                    dataKey="totalOrders"
                    nameKey="status"
                    innerRadius={62}
                    outerRadius={100}
                    paddingAngle={3}
                    strokeWidth={3}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`${entry.status}-${index}`}
                        fill={
                          entry.status in statusChartConfig
                            ? `var(--color-${entry.status})`
                            : "var(--chart-5)"
                        }
                      />
                    ))}
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="status" />}
                    verticalAlign="bottom"
                  />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Top {topLimit} sản phẩm theo {topSortBy === "REVENUE" ? "doanh thu" : "số lượng bán"}
            </CardTitle>
            <CardDescription>Dữ liệu sắp xếp bởi API top-products.</CardDescription>
          </CardHeader>
          <CardContent>
            {topProductsQuery.isLoading ? (
              <ChartLoading />
            ) : topProductsData.length === 0 ? (
              <EmptyChart />
            ) : topSortBy === "REVENUE" ? (
              <ChartContainer config={topProductsChartConfig} className="h-[320px] w-full">
                <BarChart
                  accessibilityLayer
                  data={topProductsData}
                  layout="vertical"
                  margin={{ left: 12, right: 12, top: 8 }}
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis
                    type="number"
                    dataKey="revenue"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: number) => formatCompactVnd(value)}
                  />
                  <YAxis
                    type="category"
                    dataKey="productName"
                    tickLine={false}
                    axisLine={false}
                    width={120}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value: string) =>
                      value.length > 18 ? `${value.slice(0, 18)}…` : value
                    }
                  />
                  <ChartTooltip
                    cursor={{ fill: "var(--muted)", opacity: 0.35 }}
                    content={
                      <ChartTooltipContent formatter={(value) => formatVnd(Number(value))} />
                    }
                  />
                  <Bar
                    dataKey="revenue"
                    fill="var(--color-revenue)"
                    radius={[0, 6, 6, 0]}
                    barSize={24}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <ChartContainer
                config={{ totalQuantity: { label: "Số lượng bán", color: "var(--chart-2)" } }}
                className="h-[320px] w-full"
              >
                <BarChart
                  accessibilityLayer
                  data={topProductsData}
                  layout="vertical"
                  margin={{ left: 12, right: 12, top: 8 }}
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" dataKey="totalQuantity" tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="productName"
                    tickLine={false}
                    axisLine={false}
                    width={120}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value: string) =>
                      value.length > 18 ? `${value.slice(0, 18)}…` : value
                    }
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="totalQuantity"
                    fill="var(--color-totalQuantity)"
                    radius={[0, 6, 6, 0]}
                    barSize={24}
                  />
                </BarChart>
              </ChartContainer>
            )}
            {topProductsData.length > 0 && !topProductsQuery.isLoading && (
              <div className="mt-4 space-y-2 border-t pt-4">
                {topProductsData.map((product, index) => (
                  <div
                    key={product.productId}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="bg-muted flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold">
                        {index + 1}
                      </span>
                      <span className="truncate">{product.productName}</span>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-medium">
                        {topSortBy === "REVENUE"
                          ? formatVnd(product.revenue)
                          : `${Number(product.totalQuantity).toLocaleString("vi-VN")} sản phẩm`}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {topSortBy === "REVENUE"
                          ? `${Number(product.totalQuantity).toLocaleString("vi-VN")} sản phẩm`
                          : formatVnd(product.revenue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Giá trị đơn hàng trung bình</CardTitle>
            <CardDescription>
              Xu hướng AOV theo {groupBy === "DAY" ? "ngày" : groupBy === "WEEK" ? "tuần" : "tháng"}
              .
            </CardDescription>
          </CardHeader>
          <CardContent>
            {aovQuery.isLoading ? (
              <ChartLoading />
            ) : aovData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ChartContainer config={aovChartConfig} className="h-[320px] w-full">
                <AreaChart
                  accessibilityLayer
                  data={aovData}
                  margin={{ left: 8, right: 8, top: 12 }}
                >
                  <defs>
                    <linearGradient id="aovFill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="var(--color-averageOrderValue)"
                        stopOpacity={0.28}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-averageOrderValue)"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="period"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={24}
                    tickFormatter={(value: string) =>
                      formatChartDate(value, groupBy === "MONTH" ? "MM/yyyy" : "dd/MM")
                    }
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={58}
                    tickFormatter={(value: number) => formatCompactVnd(value)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) =>
                          formatChartDate(
                            String(value),
                            groupBy === "MONTH" ? "MM/yyyy" : "dd/MM/yyyy"
                          )
                        }
                        formatter={(value) => formatVnd(Number(value))}
                      />
                    }
                  />
                  <Area
                    dataKey="averageOrderValue"
                    type="monotone"
                    stroke="var(--color-averageOrderValue)"
                    strokeWidth={2}
                    fill="url(#aovFill)"
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Boxes className="h-5 w-5 text-amber-600" />
              Cảnh báo tồn kho
            </CardTitle>
            <CardDescription>
              Các biến thể có tồn kho nhỏ hơn hoặc bằng {inventoryThreshold}.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-amber-500/40 text-amber-700">
              {lowStockCount} sắp hết
            </Badge>
            <Badge variant="destructive">{outOfStockCount} hết hàng</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {inventoryQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : inventoryItems.length === 0 ? (
            <div className="flex min-h-36 flex-col items-center justify-center gap-2 text-center">
              <PackageCheck className="text-muted-foreground h-8 w-8" />
              <p className="font-medium">Không có cảnh báo tồn kho</p>
              <p className="text-muted-foreground text-sm">
                Không có biến thể nào nằm trong ngưỡng cảnh báo hiện tại.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Tồn kho</TableHead>
                    <TableHead className="text-right">Giá</TableHead>
                    <TableHead className="text-right">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryItems.map((item) => (
                    <TableRow key={item.variantId}>
                      <TableCell className="max-w-[240px]">
                        <span className="block truncate font-medium">{item.productName}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {item.sku}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {item.stock}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatVnd(item.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.stock <= 0 ? (
                          <Badge variant="destructive">Hết hàng</Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-500/40 text-amber-700">
                            Sắp hết
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
