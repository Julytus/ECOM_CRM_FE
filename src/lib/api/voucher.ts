import axiosInstance from "@/lib/axios/instance";
import type { components } from "@/lib/api/schema.gen";

type Voucher = components["schemas"]["Voucher"];
type VoucherListResponse = components["schemas"]["ApiResponsePageVoucher"];
type VoucherResponse = components["schemas"]["ApiResponseVoucher"];
type VoucherDeleteResponse = components["schemas"]["ApiResponseInteger"];

export type VoucherListParams = {
  keyword?: string;
  status?: number;
  branchId?: number;
  page?: number;
  limit?: number;
};

export const getVouchers = async (params: VoucherListParams = {}) => {
  const res = await axiosInstance.get<VoucherListResponse>("/voucher/list", { params });
  return res.data.result;
};

export const getVoucher = async (id: number) => {
  const res = await axiosInstance.get<VoucherResponse>("/voucher/get", { params: { id } });
  return res.data.result;
};

export const saveVoucher = async (body: Voucher) => {
  const res = await axiosInstance.post<VoucherResponse>("/voucher/update", body);
  return res.data.result;
};

export const deleteVoucher = async (id: number) => {
  const res = await axiosInstance.delete<VoucherDeleteResponse>(`/voucher/delete/${id}`);
  return res.data.result;
};
