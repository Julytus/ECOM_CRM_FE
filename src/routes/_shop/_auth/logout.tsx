import { createFileRoute, redirect } from "@tanstack/react-router";
import { queryClient } from "@/lib/tanstack/query-client";
import { useAuthStore } from "@/lib/stores/auth";
import { meQueryOptions } from "@/lib/tanstack/options/auth";
import { toast } from "sonner";
import { useCartStore } from "@/lib/stores/cart";

export const Route = createFileRoute("/_shop/_auth/logout")({
  beforeLoad: async () => {
    useAuthStore.getState().clear?.();

    useCartStore.getState().clearCart?.();

    // Không dùng `clear()` cho `me`: nó gỡ query khỏi cache nên observer đang mount
    // (navbar, CRM layout) mất liên kết và không nhận được cập nhật → vẫn hiện tên cũ.
    // Ghi `null` vào chính query đang tồn tại để observer re-render ngay.
    await queryClient.cancelQueries();
    queryClient.removeQueries({
      predicate: (q) => q.queryKey[0] !== meQueryOptions.queryKey[0]
    });
    queryClient.setQueryData(meQueryOptions.queryKey, null as never);

    toast.info("Đăng xuất thành công");

    throw redirect({ to: "/" });
  },
  component: () => null
});
