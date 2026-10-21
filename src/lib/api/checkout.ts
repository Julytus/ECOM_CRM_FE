import axiosInstance from "@/lib/axios/instance";
import type { components } from "@/lib/api/schema.gen";

type CheckoutRequest = components["schemas"]["CheckoutRequest"];
type CheckoutPreviewResponse = components["schemas"]["ApiResponseCheckoutPreviewResponse"];
type CheckoutResponse = components["schemas"]["ApiResponseCheckoutResponse"];

export const previewCheckout = async (payload: CheckoutRequest) => {
  const res = await axiosInstance.post<CheckoutPreviewResponse>("/checkout/preview", payload);
  return res.data.result;
};

export const submitCheckout = async (payload: CheckoutRequest) => {
  const res = await axiosInstance.post<CheckoutResponse>("/checkout/submit", payload);
  return res.data.result;
};
