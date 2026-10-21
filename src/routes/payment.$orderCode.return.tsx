import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/payment/$orderCode/return")({ component: PaymentReturnPage });

function PaymentReturnPage() {
  const { orderCode } = Route.useParams();

  return (
    <main className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-16">
      <section className="max-w-lg rounded-2xl border bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold">Đã quay lại từ trang thanh toán</h1>
        <p className="text-muted-foreground mt-3">
          Trạng thái thanh toán của đơn {orderCode} chưa được xác minh. Vui lòng chờ cập nhật hoặc liên hệ cửa hàng.
        </p>
        <Button asChild className="mt-6"><Link to="/">Tiếp tục mua sắm</Link></Button>
      </section>
    </main>
  );
}
