"use client";

import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import axios from "axios";
import { toast } from "sonner";

import { PageWrapper } from "@/components/layout/page-warper";
import { MyVoucherList } from "@/components/shop/loyalty/my-voucher-list";
import { RedeemableCard } from "@/components/shop/loyalty/redeemable-card";
import { ProfileNavigation } from "@/components/shop/profile/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isUnlinkedAccountError } from "@/lib/api/loyalty";
import { meQueryOptions } from "@/lib/tanstack/options/auth";
import {
  myLoyaltyQueryOptions,
  myVouchersInfiniteQueryOptions,
  redeemableQueryOptions
} from "@/lib/tanstack/options/loyalty";

export const Route = createFileRoute("/_shop/_profile/loyalty-vouchers")({ component: LoyaltyVouchersPage });

function LoyaltyVouchersPage() {
  const [tab, setTab] = useState("redeem");
  const queryClient = useQueryClient();
  const userQuery = useQuery(meQueryOptions);
  const accountQuery = useQuery(myLoyaltyQueryOptions);
  const unlinked = isUnlinkedAccountError(accountQuery.error);
  const redeemableQuery = useQuery({ ...redeemableQueryOptions, enabled: accountQuery.status === "success" });
  const voucherStatus = tab === "available" ? "AVAILABLE" : "USED";
  const vouchersQuery = useInfiniteQuery(
    myVouchersInfiniteQueryOptions(voucherStatus, { limit: 8, enabled: accountQuery.status === "success" && tab !== "redeem" })
  );
  const redeemable = redeemableQuery.data ?? [];
  const vouchers = useMemo(() => vouchersQuery.data?.pages.flatMap((page) => page.items ?? []) ?? [], [vouchersQuery.data]);

  useEffect(() => {
    if (accountQuery.status === "error" && !unlinked) {
      toast.error(getApiErrorMessage(accountQuery.error, "Không thể tải thông tin điểm thưởng."));
    }
  }, [accountQuery.error, accountQuery.status, unlinked]);

  useEffect(() => {
    if (redeemableQuery.status === "error") {
      toast.error(getApiErrorMessage(redeemableQuery.error, "Không thể tải danh sách voucher đổi điểm."));
    }
  }, [redeemableQuery.error, redeemableQuery.status]);

  useEffect(() => {
    if (vouchersQuery.status === "error") {
      toast.error(getApiErrorMessage(vouchersQuery.error, "Không thể tải voucher của bạn."));
    }
  }, [vouchersQuery.error, vouchersQuery.status]);

  useEffect(() => {
    const unknownStatus = vouchers.find((voucher) => voucher.status && !["AVAILABLE", "USED"].includes(voucher.status));
    if (unknownStatus?.status) toast.info(`Trạng thái voucher chưa được hỗ trợ: ${unknownStatus.status}`);
  }, [vouchers]);

  const refetchRedeemable = () => {
    void queryClient.refetchQueries({ queryKey: ["redeemable"] });
  };

  return (
    <PageWrapper
      title="Voucher của tôi"
      image="/page-title/page-title-5.jpg"
      breadcrumbItems={[{ label: "Trang chủ", href: "/" }, { label: "Tài khoản", href: "/profile" }, { label: "Voucher của tôi" }]}
    >
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col gap-8 md:flex-row md:gap-12">
          <ProfileNavigation user={userQuery.data ?? undefined} />
          <main className="min-w-0 flex-1">
            {userQuery.status === "error" ? (
              <section className="rounded-xl border bg-card p-8 text-center">
                <p className="text-sm text-muted-foreground">Không thể tải thông tin tài khoản.</p>
                <Button className="mt-4" variant="outline" onClick={() => void userQuery.refetch()}>Thử lại</Button>
              </section>
            ) : userQuery.status !== "success" ? (
              <p className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">Đang tải tài khoản...</p>
            ) : unlinked ? (
              <section className="rounded-xl border bg-card p-8 text-center shadow-sm">
                <h2 className="text-xl font-bold">Tài khoản chưa liên kết, liên hệ cửa hàng</h2>
              </section>
            ) : (
              <section className="rounded-xl border bg-card p-6 shadow-sm md:p-8">
                <header>
                  <h2 className="text-2xl font-bold">Voucher của tôi</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Đổi điểm lấy ưu đãi và theo dõi voucher đang sở hữu.</p>
                </header>
                <Separator className="my-6" />
                {accountQuery.status === "error" ? (
                  <div className="py-10 text-center">
                    <p className="text-sm text-muted-foreground">Không thể tải số dư điểm để đổi voucher.</p>
                    <Button className="mt-4" variant="outline" onClick={() => void accountQuery.refetch()}>Thử lại</Button>
                  </div>
                ) : accountQuery.status !== "success" ? (
                  <p className="py-10 text-center text-sm text-muted-foreground">Đang tải số dư điểm...</p>
                ) : (
                  <Tabs value={tab} onValueChange={setTab}>
                    <TabsList className="grid h-auto w-full grid-cols-3">
                      <TabsTrigger value="redeem">Đổi điểm</TabsTrigger>
                      <TabsTrigger value="available">Khả dụng</TabsTrigger>
                      <TabsTrigger value="used">Đã dùng</TabsTrigger>
                    </TabsList>
                    <TabsContent value="redeem" className="pt-6">
                      <p className="mb-4 text-sm">Số dư: <strong>{(accountQuery.data.balance ?? 0).toLocaleString("vi-VN")} điểm</strong></p>
                      {redeemableQuery.status === "pending" ? (
                        <p className="py-10 text-center text-sm text-muted-foreground">Đang tải voucher...</p>
                      ) : redeemableQuery.status === "error" ? (
                        <div className="py-10 text-center">
                          <p className="text-sm text-muted-foreground">Không thể tải voucher đổi điểm.</p>
                          <Button className="mt-4" variant="outline" onClick={() => void redeemableQuery.refetch()}>Thử lại</Button>
                        </div>
                      ) : redeemable.length === 0 ? (
                        <p className="py-10 text-center text-sm text-muted-foreground">Hiện chưa có voucher để đổi.</p>
                      ) : (
                        <div className="grid gap-4 lg:grid-cols-2">
                          {redeemable.map((voucher, index) => (
                            <RedeemableCard
                              key={voucher.id ?? `${voucher.code}-${index}`}
                              voucher={voucher}
                              balance={accountQuery.data.balance ?? 0}
                              onRedeemError={refetchRedeemable}
                            />
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="available" className="pt-6">
                      <VoucherTabContent query={vouchersQuery} vouchers={vouchers} />
                    </TabsContent>
                    <TabsContent value="used" className="pt-6">
                      <VoucherTabContent query={vouchersQuery} vouchers={vouchers} />
                    </TabsContent>
                  </Tabs>
                )}
              </section>
            )}
          </main>
        </div>
      </div>
    </PageWrapper>
  );
}

function VoucherTabContent({
  query,
  vouchers
}: {
  query: {
    status: "pending" | "error" | "success";
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => Promise<unknown>;
  };
  vouchers: import("@/lib/api/schema.gen").components["schemas"]["MyVoucherResponse"][];
}) {
  if (query.status === "pending") return <p className="py-10 text-center text-sm text-muted-foreground">Đang tải voucher...</p>;
  if (query.status === "error") {
    return <p className="py-10 text-center text-sm text-muted-foreground">Không thể tải voucher của bạn.</p>;
  }
  return (
    <MyVoucherList
      vouchers={vouchers}
      hasNextPage={query.hasNextPage}
      isFetchingNextPage={query.isFetchingNextPage}
      onLoadMore={() => void query.fetchNextPage()}
    />
  );
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) return error.response?.data?.message || fallback;
  return fallback;
}
