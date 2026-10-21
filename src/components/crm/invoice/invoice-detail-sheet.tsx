import { useQuery } from "@tanstack/react-query";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { InvoiceStatusBadge } from "@/components/crm/invoice/invoice-status-badge";
import { formatVnd } from "@/lib/format";
import { invoiceDetailQueryOptions } from "@/lib/tanstack/options/invoice";

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="space-y-1">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="text-sm font-medium">{value || "—"}</dd>
    </div>
  );
}

export function InvoiceDetailSheet({
  invoiceId,
  open,
  onOpenChange
}: {
  invoiceId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isPending, isError, error, refetch } = useQuery({
    ...invoiceDetailQueryOptions(invoiceId ?? 0),
    enabled: open && invoiceId !== null
  });
  const invoice = data?.invoice;
  const order = data?.order;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{invoice?.invoiceCode || (invoiceId ? `Hóa đơn #${invoiceId}` : "Chi tiết hóa đơn")}</SheetTitle>
          <SheetDescription>
            {order ? `Đơn hàng ${order.code || invoice?.orderCode || ""}` : "Hóa đơn POS"}
          </SheetDescription>
        </SheetHeader>
        {isPending ? (
          <p className="p-6 text-sm">Đang tải chi tiết hóa đơn...</p>
        ) : isError ? (
          <div className="space-y-3 p-6 text-sm">
            <p>Không thể tải chi tiết hóa đơn: {error instanceof Error ? error.message : "Lỗi không xác định"}</p>
            <button className="underline" onClick={() => void refetch()}>Thử lại</button>
          </div>
        ) : invoice ? (
          <div className="space-y-6 px-4 pb-8">
            <section className="space-y-3">
              <h3 className="font-semibold">Hóa đơn</h3>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Trạng thái</span>
                <InvoiceStatusBadge status={invoice.status} />
              </div>
              <dl className="grid grid-cols-2 gap-4">
                <Field label="Khách hàng" value={invoice.customerName || invoice.buyerName} />
                <Field label="Số điện thoại" value={invoice.buyerPhone} />
                <Field label="Phương thức" value={invoice.paymentMethod} />
                <Field label="Ngày tạo" value={invoice.createdTime ? new Date(invoice.createdTime).toLocaleString("vi-VN") : undefined} />
                <Field label="Tổng tiền" value={formatVnd(invoice.amount ?? 0)} />
                <Field label="Đã thu" value={formatVnd(invoice.paid ?? 0)} />
                <Field label="Còn nợ" value={formatVnd(invoice.debt ?? 0)} />
              </dl>
            </section>

            {order && (
              <>
                <Separator />
                <section className="space-y-3">
                  <h3 className="font-semibold">Đơn hàng và giao nhận</h3>
                  <dl className="grid grid-cols-2 gap-4">
                    <Field label="Mã đơn" value={order.code || invoice.orderCode} />
                    <Field label="Người mua" value={order.buyerName} />
                    <Field label="Điện thoại người mua" value={order.buyerPhone} />
                    <Field label="Email" value={order.buyerEmail} />
                    <Field label="Người nhận" value={order.receiverName} />
                    <Field label="Điện thoại người nhận" value={order.receiverPhone} />
                    <Field label="Địa chỉ giao hàng" value={order.address} />
                    <Field label="Phí giao hàng" value={formatVnd(order.shippingFee ?? 0)} />
                  </dl>
                </section>
              </>
            )}

            {!!data.orderItems?.length && (
              <>
                <Separator />
                <section className="space-y-3">
                  <h3 className="font-semibold">Sản phẩm trong đơn</h3>
                  <div className="space-y-2">
                    {data.orderItems.map((item, index) => (
                      <div key={item.id ?? index} className="flex justify-between gap-4 text-sm">
                        <span>{item.productName || "Sản phẩm"} × {item.quantity ?? 0}</span>
                        <span>{formatVnd(item.totalPrice ?? item.price ?? 0)}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {!!data.products?.length && (
              <>
                <Separator />
                <section className="space-y-3">
                  <h3 className="font-semibold">Sản phẩm</h3>
                  {data.products.map((product, index) => (
                    <div key={product.id ?? index} className="flex justify-between gap-4 text-sm">
                      <span>{product.productName || "Sản phẩm"} × {product.qty ?? 0}</span>
                      <span>{formatVnd((product.price ?? 0) * (product.qty ?? 0))}</span>
                    </div>
                  ))}
                </section>
              </>
            )}

            {!!data.services?.length && (
              <>
                <Separator />
                <section className="space-y-3">
                  <h3 className="font-semibold">Dịch vụ</h3>
                  {data.services.map((service, index) => (
                    <div key={service.id ?? index} className="flex justify-between gap-4 text-sm">
                      <span>{service.serviceName || "Dịch vụ"} × {service.qty ?? 0}</span>
                      <span>{formatVnd((service.priceDiscount ?? service.price ?? 0) * (service.qty ?? 0))}</span>
                    </div>
                  ))}
                </section>
              </>
            )}

            {!!data.payments?.length && (
              <>
                <Separator />
                <section className="space-y-3">
                  <h3 className="font-semibold">Giao dịch thanh toán</h3>
                  {data.payments.map((payment, index) => (
                    <div key={payment.id ?? index} className="flex justify-between gap-4 text-sm">
                      <span>{payment.paymentProvider || payment.paymentType || payment.status || "Thanh toán"}</span>
                      <span>{formatVnd(payment.amount ?? 0)}</span>
                    </div>
                  ))}
                </section>
              </>
            )}

            {data.voucher && (
              <>
                <Separator />
                <section className="space-y-2">
                  <h3 className="font-semibold">Voucher</h3>
                  <dl className="grid grid-cols-2 gap-4">
                    <Field label="Mã voucher" value={data.voucher.code} />
                    <Field label="Giảm giá" value={formatVnd(data.voucher.discountAmount ?? 0)} />
                  </dl>
                </section>
              </>
            )}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
