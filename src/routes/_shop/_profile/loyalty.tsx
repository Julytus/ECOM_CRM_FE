import { useEffect } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import axios from "axios";
import { toast } from "sonner";

import { QueryBoundary } from "@/components/boundary";
import { PageWrapper } from "@/components/layout/page-warper";
import { PointsSummary } from "@/components/shop/loyalty/points-summary";
import { TransactionList } from "@/components/shop/loyalty/transaction-list";
import { ProfileNavigation } from "@/components/shop/profile/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { isUnlinkedAccountError } from "@/lib/api/loyalty";
import { myLoyaltyQueryOptions, myLoyaltyTransactionsInfiniteQueryOptions } from "@/lib/tanstack/options/loyalty";
import { meQueryOptions } from "@/lib/tanstack/options/auth";

export const Route = createFileRoute("/_shop/_profile/loyalty")({ component: LoyaltyPage });

function LoyaltyPage() {
  const { data: user, status: userStatus, error: userError, refetch: refetchUser } = useQuery(meQueryOptions);
  const {
    data: account,
    status: accountStatus,
    error: accountError,
    refetch: refetchAccount
  } = useQuery(myLoyaltyQueryOptions);
  const unlinked = isUnlinkedAccountError(accountError);
  const transactionsQuery = useInfiniteQuery(
    myLoyaltyTransactionsInfiniteQueryOptions({ limit: 10, enabled: accountStatus === "success" })
  );
  const transactions = transactionsQuery.data?.pages.flatMap((page) => page.items ?? []) ?? [];

  useEffect(() => {
    if (accountStatus === "error" && !unlinked) {
      toast.error(getApiErrorMessage(accountError, "Không thể tải thông tin điểm thưởng."));
    }
  }, [accountError, accountStatus, unlinked]);

  useEffect(() => {
    if (transactionsQuery.status === "error") {
      toast.error(getApiErrorMessage(transactionsQuery.error, "Không thể tải lịch sử điểm thưởng."));
    }
  }, [transactionsQuery.error, transactionsQuery.status]);

  return (
    <PageWrapper
      title="Điểm thưởng"
      image="/page-title/page-title-5.jpg"
      breadcrumbItems={[{ label: "Trang chủ", href: "/" }, { label: "Tài khoản", href: "/profile" }, { label: "Điểm thưởng" }]}
    >
      <div className="container mx-auto px-4 py-12 md:py-20">
        <QueryBoundary data={user} status={userStatus} error={userError} onRetry={() => refetchUser()}>
          {(me) => (
            <div className="flex flex-col gap-8 md:flex-row md:gap-12">
              <ProfileNavigation user={me ?? undefined} />
              <main className="flex-1 space-y-8">
                {unlinked ? (
                  <section className="rounded-xl border bg-card p-8 text-center shadow-sm">
                    <h2 className="text-xl font-bold">Tài khoản chưa liên kết, liên hệ cửa hàng</h2>
                  </section>
                ) : (
                  <QueryBoundary
                    data={account}
                    status={accountStatus}
                    error={accountError}
                    onRetry={() => refetchAccount()}
                    renderError={() => (
                      <div className="rounded-xl border bg-card p-8 text-center">
                        <p className="text-sm text-muted-foreground">Không thể tải thông tin điểm thưởng.</p>
                        <Button className="mt-4" variant="outline" onClick={() => refetchAccount()}>Thử lại</Button>
                      </div>
                    )}
                  >
                    {(loyalty) => <PointsSummary account={loyalty} />}
                  </QueryBoundary>
                )}

                {!unlinked && accountStatus === "success" && (
                  <section className="rounded-xl border bg-card p-6 shadow-sm md:p-8">
                    <h2 className="text-xl font-bold">Lịch sử điểm</h2>
                    <Separator className="my-4" />
                    <QueryBoundary
                      data={transactions}
                      status={transactionsQuery.status}
                      error={transactionsQuery.error}
                      emptyFallback={<p className="py-10 text-center text-sm text-muted-foreground">Chưa có giao dịch điểm nào.</p>}
                      hasNextPage={transactionsQuery.hasNextPage}
                      fetchNextPage={() => { void transactionsQuery.fetchNextPage(); }}
                      renderLoadMore={() => (
                        <Button
                          variant="ghost"
                          className="w-full"
                          disabled={transactionsQuery.isFetchingNextPage}
                          onClick={() => { void transactionsQuery.fetchNextPage(); }}
                        >
                          {transactionsQuery.isFetchingNextPage ? "Đang tải..." : "Xem thêm giao dịch"}
                        </Button>
                      )}
                      renderError={() => <p className="py-8 text-center text-sm text-muted-foreground">Không thể tải lịch sử điểm thưởng.</p>}
                    >
                      {(items) => <TransactionList transactions={items} />}
                    </QueryBoundary>
                  </section>
                )}
              </main>
            </div>
          )}
        </QueryBoundary>
      </div>
    </PageWrapper>
  );
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }
  return fallback;
}
