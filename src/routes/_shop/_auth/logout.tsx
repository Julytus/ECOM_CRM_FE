import { createFileRoute, redirect } from "@tanstack/react-router";
import { queryClient } from "@/lib/tanstack/query-client";
import { useAuthStore } from "@/lib/stores/auth";
import { toast } from "sonner";
import { useCartStore } from "@/lib/stores/cart";

export const Route = createFileRoute("/_shop/_auth/logout")({
  beforeLoad: async () => {
    try {
      // Clear auth store (this also clears localStorage and cookies)
      useAuthStore.getState().clear?.();

      // Clear cart store if exists
      useCartStore.getState().clearCart?.();

      // Invalidate and remove "me" query specifically
      queryClient.removeQueries({ queryKey: ["me"] });

      // Clear all react query cache
      queryClient.clear();

      // Show success message
      toast.success("Đăng xuất thành công");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Có lỗi xảy ra khi đăng xuất");
    }

    // Redirect to home
    throw redirect({ to: "/" });
  },
  component: () => null
});

