import { queryOptions } from "@tanstack/react-query";
import { deleteVoucher, getVoucher, getVouchers, saveVoucher, type VoucherListParams } from "@/lib/api/voucher";
import type { components } from "@/lib/api/schema.gen";

type Voucher = components["schemas"]["Voucher"];

export const vouchersQueryOptions = (params: VoucherListParams) =>
  queryOptions({
    queryKey: ["vouchers", params],
    queryFn: async () => (await getVouchers(params)) ?? { items: [], page: params.page, total: 0 },
    retry: false,
    refetchOnWindowFocus: false
  });

export const voucherQueryOptions = (id?: number) =>
  queryOptions({
    queryKey: ["voucher", id],
    queryFn: async () => {
      const voucher = await getVoucher(id!);
      if (!voucher) throw new Error("Không nhận được thông tin voucher.");
      return voucher;
    },
    enabled: typeof id === "number" && id > 0,
    retry: false
  });

export const saveVoucherMutationOptions = () => ({
  mutationFn: (voucher: Voucher) => saveVoucher(voucher),
  meta: { invalidatesQuery: [["vouchers"], ["voucher"]] }
});

export const deleteVoucherMutationOptions = () => ({
  mutationFn: (id: number) => deleteVoucher(id),
  meta: { invalidatesQuery: [["vouchers"]] }
});
