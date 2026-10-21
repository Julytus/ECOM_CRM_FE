import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { defaultRevenueRange, RevenueFilters } from "@/components/crm/revenue/revenue-filters";
import { KpiCards } from "@/components/crm/revenue/kpi-cards";
import { RevenueSeriesChart } from "@/components/crm/revenue/revenue-series-chart";
import { PaymentMethodChart } from "@/components/crm/revenue/payment-method-chart";
import { TopProducts } from "@/components/crm/revenue/top-products";
import { getRevenueByPaymentMethod, getRevenueSeries, getRevenueSummary, getTopProducts, type GroupBy } from "@/lib/api/report";

export const Route = createFileRoute("/crm/revenue")({ component: RevenuePage });

function RevenuePage() {
  const initial = React.useMemo(defaultRevenueRange, []);
  const [from, setFrom] = React.useState(initial.from);
  const [to, setTo] = React.useState(initial.to);
  const [groupBy, setGroupBy] = React.useState<GroupBy>("day");
  const [limit, setLimit] = React.useState(10);
  const valid = Boolean(from && to && from <= to && (Date.parse(`${to}T00:00:00`) - Date.parse(`${from}T00:00:00`)) / 86400000 + 1 <= 366);
  const params = { from, to };
  const summary = useQuery({ queryKey: ["revenue-summary", params], queryFn: () => getRevenueSummary(params), enabled: valid });
  const series = useQuery({ queryKey: ["revenue-series", params, groupBy], queryFn: () => getRevenueSeries({ ...params, groupBy }), enabled: valid });
  const methods = useQuery({ queryKey: ["revenue-payment-method", params], queryFn: () => getRevenueByPaymentMethod(params), enabled: valid });
  const products = useQuery({ queryKey: ["revenue-top-products", params, limit], queryFn: () => getTopProducts({ ...params, limit }), enabled: valid });

  return <div><header className="mb-6"><h1 className="text-2xl font-bold tracking-tight">Thống kê doanh thu</h1><p className="text-muted-foreground">Tổng quan doanh thu, thanh toán và sản phẩm trong khoảng thời gian đã chọn.</p></header><RevenueFilters from={from} to={to} groupBy={groupBy} limit={limit} onFromChange={setFrom} onToChange={setTo} onGroupByChange={setGroupBy} onLimitChange={setLimit}/><KpiCards data={summary.data} loading={summary.isLoading && valid} error={summary.isError && valid}/><div className="mt-6 grid gap-6 xl:grid-cols-2"><RevenueSeriesChart data={series.data} loading={series.isLoading && valid} error={series.isError && valid} groupBy={groupBy}/><PaymentMethodChart data={methods.data} loading={methods.isLoading && valid} error={methods.isError && valid}/><TopProducts data={products.data} loading={products.isLoading && valid} error={products.isError && valid}/></div></div>;
}
