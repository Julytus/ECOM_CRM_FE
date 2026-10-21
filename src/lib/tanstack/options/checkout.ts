import { mutationOptions } from "@tanstack/react-query";
import { previewCheckout, submitCheckout } from "@/lib/api/checkout";
import type { components } from "@/lib/api/schema.gen";

type CheckoutRequest = components["schemas"]["CheckoutRequest"];

export const previewCheckoutMutationOptions = () =>
  mutationOptions({ mutationFn: (payload: CheckoutRequest) => previewCheckout(payload) });

export const submitCheckoutMutationOptions = () =>
  mutationOptions({ mutationFn: (payload: CheckoutRequest) => submitCheckout(payload) });
