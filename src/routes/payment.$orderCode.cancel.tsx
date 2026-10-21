import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/payment/$orderCode/cancel")({ component: PaymentCancelPage });

function PaymentCancelPage() {
  const { orderCode } = Route.useParams();

  return (
    <main className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-16">
      <section className="max-w-lg rounded-2xl border bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold">Thanh toán chưa hoàn tất</h1>
        <p className="text-muted-foreground mt-3">
          Giao dịch cho đơn {orderCode} đã kết thúc mà chưa có xác nhận thanh toán. Bạn có thể quay lại cửa hàng để được hỗ trợ.
        </p>
        <Button asChild className="mt-6"><Link to="/">Tiếp tục mua sắm</Link></Button>
      </section>
    </main>
  );
}
