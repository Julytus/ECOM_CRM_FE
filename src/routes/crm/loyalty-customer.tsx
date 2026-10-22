import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";

import { CrmPermissionGuard } from "@/components/crm/crm-permission-guard";
import { CustomerPicker } from "@/components/crm/loyalty/customer-picker";
import { AccountCard } from "@/components/crm/loyalty/account-card";
import { AdjustDialog } from "@/components/crm/loyalty/adjust-dialog";
import { LinkAccountDialog } from "@/components/crm/loyalty/link-account-dialog";
import { Button } from "@/components/ui/button";
import { useResourceAction } from "@/lib/hooks/use-resource-action";
import type { components } from "@/lib/api/schema.gen";
import {
  adjustLoyaltyMutationOptions,
  linkCustomerAccountMutationOptions,
  loyaltyAccountQueryOptions,
  loyaltyTransactionsQueryOptions,
  tiersQueryOptions
} from "@/lib/tanstack/options/loyalty";

type Customer = components["schemas"]["Customer"];
type Transaction = components["schemas"]["LoyaltyTransaction"];
type ActionError = AxiosError<{ message?: string }>;

export const Route = createFileRoute("/crm/loyalty-customer")({
  component: () => <CrmPermissionGuard code="LOYALTY"><LoyaltyCustomerPage /></CrmPermissionGuard>
});

function errorMessage(error: unknown, fallback: string) {
  return (error as ActionError)?.response?.data?.message || fallback;
}

function LoyaltyCustomerPage() {
  const queryClient = useQueryClient();
  const canResourceAction = useResourceAction();
  const canUpdate = canResourceAction("LOYALTY", "UPDATE");
  const [customer, setCustomer] = React.useState<Customer | null>(null);
  const [page, setPage] = React.useState(1);
  const [adjustOpen, setAdjustOpen] = React.useState(false);
  const [linkOpen, setLinkOpen] = React.useState(false);
  const accountQuery = useQuery(loyaltyAccountQueryOptions(customer?.id));
  const transactionsQuery = useQuery(loyaltyTransactionsQueryOptions(customer?.id, page, 10));
  const tiersQuery = useQuery(tiersQueryOptions);
  const adjustMutation = useMutation(adjustLoyaltyMutationOptions());
  const linkMutation = useMutation(linkCustomerAccountMutationOptions());
  const transactions = transactionsQuery.data?.items ?? [];
  const total = transactionsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 10));

  const invalidateCustomer = async (customerId: number) => Promise.all([
    queryClient.invalidateQueries({ queryKey: ["loyalty-admin-account", customerId] }),
    queryClient.invalidateQueries({ queryKey: ["loyalty-admin-transactions"] })
  ]);

  const adjust = (values: { points: number; rankDelta: number; reason: string }) => {
    if (customer?.id === undefined) return;
    adjustMutation.mutate({ customerId: customer.id, ...values }, {
      onSuccess: async () => {
        setAdjustOpen(false);
        await invalidateCustomer(customer.id!);
        toast.success("Điều chỉnh điểm thành công.");
      },
      onError: (error) => toast.error(errorMessage(error, "Không thể điều chỉnh điểm."))
    });
  };

  const link = (accountUserId: number) => {
    if (customer?.id === undefined) return;
    linkMutation.mutate({ customerId: customer.id, accountUserId }, {
      onSuccess: async () => {
        setLinkOpen(false);
        setCustomer((current) => current ? { ...current, accountUserId } : current);
        await queryClient.invalidateQueries({ queryKey: ["loyalty-customer-search"] });
        toast.success("Liên kết tài khoản thành công.");
      },
      onError: (error) => toast.error(errorMessage(error, "Không thể liên kết tài khoản."))
    });
  };

  return <main className="space-y-6 p-6">
    <header><h1 className="text-3xl font-bold tracking-tight">Tra cứu điểm khách hàng</h1><p className="text-muted-foreground mt-1">Xem số dư, lịch sử giao dịch và quản lý liên kết tài khoản.</p></header>
    <CustomerPicker onSelect={(next) => { setCustomer(next); setPage(1); }} />
    {customer && <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">{customer.name || `Khách hàng #${customer.id}`}</h2><p className="text-muted-foreground text-sm">SĐT: {customer.phone || "—"} · Mã khách hàng: {customer.id}</p></div><div className="flex gap-2">{canUpdate && <><Button onClick={() => setAdjustOpen(true)}>Điều chỉnh điểm</Button><Button variant="outline" onClick={() => setLinkOpen(true)}>Liên kết tài khoản</Button></>}</div></div>
      {accountQuery.isFetching ? <p role="status">Đang tải tài khoản điểm...</p> : accountQuery.data ? <AccountCard account={accountQuery.data} tiers={tiersQuery.data ?? []} /> : accountQuery.error ? <p role="alert" className="text-destructive">{errorMessage(accountQuery.error, "Không thể tải tài khoản điểm.")}</p> : null}
      <section className="space-y-3"><h3 className="text-lg font-semibold">Lịch sử giao dịch</h3>{transactionsQuery.isFetching ? <p role="status">Đang tải lịch sử...</p> : transactionsQuery.error ? <p role="alert" className="text-destructive">{errorMessage(transactionsQuery.error, "Không thể tải lịch sử giao dịch.")}</p> : <div className="overflow-x-auto rounded-lg border"><table className="w-full text-sm"><thead className="bg-muted/50"><tr>{["Thời gian", "Loại", "Điểm", "Số dư sau", "Điểm hạng ±", "Ghi chú", "Tham chiếu", "Người tạo"].map((label) => <th key={label} className="whitespace-nowrap px-3 py-2 text-left font-medium">{label}</th>)}</tr></thead><tbody>{transactions.map((row: Transaction) => <tr key={row.id} className="border-t"><td className="whitespace-nowrap px-3 py-2">{row.createdAt ? new Date(row.createdAt).toLocaleString("vi-VN") : "—"}</td><td className="px-3 py-2">{row.type || "—"}</td><td className="px-3 py-2">{row.points === undefined ? "—" : `${row.points > 0 ? "+" : ""}${row.points.toLocaleString("vi-VN")}`}</td><td className="px-3 py-2">{row.balanceAfter?.toLocaleString("vi-VN") ?? "—"}</td><td className="px-3 py-2">{row.rankPointsDelta === undefined ? "—" : `${row.rankPointsDelta > 0 ? "+" : ""}${row.rankPointsDelta.toLocaleString("vi-VN")}`}</td><td className="max-w-56 px-3 py-2">{row.note || "—"}</td><td className="px-3 py-2">{row.refType || "—"}{row.refId ? ` / ${row.refId}` : ""}</td><td className="px-3 py-2">{row.createdBy ?? "—"}</td></tr>)}</tbody></table>{transactions.length === 0 && <p className="p-4 text-center text-muted-foreground">Chưa có giao dịch.</p>}</div>}
        <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Trang {page} / {totalPages} · {total} giao dịch</span><div className="flex gap-2"><Button variant="outline" disabled={page <= 1 || transactionsQuery.isFetching} onClick={() => setPage((current) => current - 1)}>Trước</Button><Button variant="outline" disabled={page >= totalPages || transactionsQuery.isFetching} onClick={() => setPage((current) => current + 1)}>Sau</Button></div></div>
      </section>
      {canUpdate && <><AdjustDialog open={adjustOpen} onOpenChange={setAdjustOpen} pending={adjustMutation.isPending} onConfirm={adjust} /><LinkAccountDialog open={linkOpen} onOpenChange={setLinkOpen} customer={customer} pending={linkMutation.isPending} onSubmit={link} /></>}
    </section>}
  </main>;
}
