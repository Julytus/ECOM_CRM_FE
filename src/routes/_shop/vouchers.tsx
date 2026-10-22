import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import axios from "axios";
import { toast } from "sonner";

import { PageWrapper } from "@/components/layout/page-warper";
import { RedeemableCard } from "@/components/shop/loyalty/redeemable-card";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import axiosInstance from "@/lib/axios/instance";
import type { components } from "@/lib/api/schema.gen";
import { isUnlinkedAccountError } from "@/lib/api/loyalty";
import { meQueryOptions } from "@/lib/tanstack/options/auth";
import {
  myLoyaltyQueryOptions,
  redeemableQueryOptions
} from "@/lib/tanstack/options/loyalty";

type LoyaltyTier = components["schemas"]["LoyaltyTier"];
type LoyaltyTiersResponse = components["schemas"]["ApiResponseListLoyaltyTier"];

export const Route = createFileRoute("/_shop/vouchers")({ component: VouchersPage });

function VouchersPage() {
  const userQuery = useQuery(meQueryOptions);
  const accountQuery = useQuery({ ...myLoyaltyQueryOptions, enabled: Boolean(userQuery.data) });
  // Backend probe (2026-10-22): GET /api/loyalty/redeemable without a token returned HTTP 401.
  // Keep the request independent of /loyalty/my so unlinked customers can still browse the catalog.
  const redeemableQuery = useQuery(redeemableQueryOptions);
  const tiersQuery = useQuery({
    queryKey: ["loyalty-tiers"],
    queryFn: async () => {
      const response = await axiosInstance.get<LoyaltyTiersResponse>("/loyalty/tier/list");
      return response.data.result ?? [];
    },
    retry: false,
    refetchOnWindowFocus: false
  });

  const unlinked = isUnlinkedAccountError(accountQuery.error);
  const loggedIn = Boolean(userQuery.data);
  const guest = !loggedIn && userQuery.status === "success";
  const loginRequired = isAuthorizationError(redeemableQuery.error) || (userQuery.status === "error" && isAuthorizationError(userQuery.error));
  const vouchers = useMemo(() => {
    return [...(redeemableQuery.data ?? [])].sort((left, right) => {
      const leftRedeemable = left.affordable === true && left.tierOk === true;
      const rightRedeemable = right.affordable === true && right.tierOk === true;
      if (leftRedeemable !== rightRedeemable) return leftRedeemable ? -1 : 1;
      return (left.pointsCost ?? 0) - (right.pointsCost ?? 0);
    });
  }, [redeemableQuery.data]);
  const tierNames = useMemo(() => new Map((tiersQuery.data ?? []).map((tier: LoyaltyTier) => [tier.id, tier.name])), [tiersQuery.data]);

  useEffect(() => {
    if (redeemableQuery.status === "error" && !isAuthorizationError(redeemableQuery.error)) {
      toast.error(getApiErrorMessage(redeemableQuery.error, "Không thể tải danh sách voucher đổi điểm."));
    }
  }, [redeemableQuery.error, redeemableQuery.status]);

  useEffect(() => {
    if (accountQuery.status === "error" && !unlinked && !isAuthorizationError(accountQuery.error)) {
      toast.error(getApiErrorMessage(accountQuery.error, "Không thể tải thông tin điểm thưởng."));
    }
  }, [accountQuery.error, accountQuery.status, unlinked]);

  const accountReady = accountQuery.status === "success";
  const canShowCards = guest || (loggedIn && (accountReady || unlinked));

  return (
    <PageWrapper
      title="Ưu đãi đổi điểm"
      image="/page-title/page-title-5.jpg"
      breadcrumbItems={[{ label: "Trang chủ", href: "/" }, { label: "Ưu đãi đổi điểm" }]}
    >
      <main className="container mx-auto space-y-6 px-4 py-12 sm:px-6 md:px-12 md:py-16 lg:px-16">
        {loggedIn && accountReady && (
          <section className="rounded-xl border bg-card p-5 shadow-sm" aria-label="Số dư điểm">
            <p className="text-sm text-muted-foreground">Số dư điểm</p>
            <p className="mt-1 text-2xl font-bold">{(accountQuery.data.balance ?? 0).toLocaleString("vi-VN")} điểm</p>
          </section>
        )}

        {userQuery.status === "pending" ? (
          <p role="status" className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">Đang tải tài khoản...</p>
        ) : userQuery.status === "error" && !loginRequired ? (
          <section className="rounded-xl border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">Không thể tải thông tin tài khoản.</p>
            <Button className="mt-4" variant="outline" onClick={() => void userQuery.refetch()}>Thử lại</Button>
          </section>
        ) : redeemableQuery.status === "pending" ? (
          <p role="status" className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">Đang tải ưu đãi đổi điểm...</p>
        ) : redeemableQuery.status === "error" ? (
          loginRequired ? <LoginRequiredState /> : (
            <section className="rounded-xl border bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">Không thể tải danh sách voucher đổi điểm.</p>
              <Button className="mt-4" variant="outline" onClick={() => void redeemableQuery.refetch()}>Thử lại</Button>
            </section>
          )
        ) : !canShowCards && loggedIn && accountQuery.status === "pending" ? (
          <p role="status" className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">Đang tải số dư điểm...</p>
        ) : loggedIn && isAuthorizationError(accountQuery.error) ? (
          <LoginRequiredState />
        ) : accountQuery.status === "error" && !unlinked && !isAuthorizationError(accountQuery.error) ? (
          <section className="rounded-xl border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">Không thể tải số dư điểm để đổi voucher.</p>
            <Button className="mt-4" variant="outline" onClick={() => void accountQuery.refetch()}>Thử lại</Button>
          </section>
        ) : vouchers.length === 0 ? (
          <Empty className="rounded-2xl border border-dashed py-16">
            <EmptyHeader>
              <EmptyTitle>Hiện chưa có voucher đổi điểm</EmptyTitle>
              <EmptyDescription>Ưu đãi đổi điểm sẽ xuất hiện tại đây khi có sẵn.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <section aria-label="Danh sách ưu đãi đổi điểm" className="grid gap-4 lg:grid-cols-2">
            {vouchers.map((voucher, index) => (
              <RedeemableCard
                key={voucher.id ?? `${voucher.code}-${index}`}
                voucher={voucher}
                balance={accountReady ? accountQuery.data.balance ?? 0 : 0}
                onRedeemError={() => void redeemableQuery.refetch()}
                guest={!loggedIn}
                linked={accountReady}
                requiredTierName={voucher.minTierId === undefined ? undefined : tierNames.get(voucher.minTierId)}
              />
            ))}
          </section>
        )}
      </main>
    </PageWrapper>
  );
}

function LoginRequiredState() {
  return (
    <Empty className="rounded-2xl border border-dashed py-16">
      <EmptyHeader>
        <EmptyTitle>Đăng nhập để xem ưu đãi đổi điểm</EmptyTitle>
        <EmptyDescription>Đăng nhập để xem các voucher có thể đổi bằng điểm thưởng.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild><Link to="/login">Đăng nhập</Link></Button>
      </EmptyContent>
    </Empty>
  );
}

function isAuthorizationError(error: unknown) {
  return (
    (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) ||
    (error instanceof Error && error.message === "No refresh token")
  );
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) return error.response?.data?.message || fallback;
  return fallback;
}
