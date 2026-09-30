import { createFileRoute, redirect } from "@tanstack/react-router";
import { queryClient } from "@/lib/tanstack/query-client";
import { useAuthStore } from "@/lib/stores/auth";
import { toast } from "sonner";
import { useCartStore } from "@/lib/stores/cart";

export const Route = createFileRoute("/_shop/_auth/logout")({
  beforeLoad: async () => {
    useAuthStore.getState().clear?.();

    useCartStore.getState().clearCart?.();

    queryClient.clear();

    toast.info("Đăng xuất thành công");

    throw redirect({ to: "/" });
  },
  component: () => null
});
