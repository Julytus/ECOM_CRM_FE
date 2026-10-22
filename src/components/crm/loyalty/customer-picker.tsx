import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { customersQueryOptions } from "@/lib/tanstack/options/loyalty";
import type { components } from "@/lib/api/schema.gen";

type Customer = components["schemas"]["Customer"];

export function CustomerPicker({ onSelect }: { onSelect: (customer: Customer) => void }) {
  const [keyword, setKeyword] = React.useState("");
  const query = useQuery(customersQueryOptions(keyword));
  const customers = query.data?.items ?? [];

  return (
    <section className="space-y-3 rounded-lg border p-4" aria-label="Tra cứu khách hàng">
      <label className="text-sm font-medium" htmlFor="loyalty-customer-search">Tìm khách hàng theo tên hoặc số điện thoại</label>
      <Input id="loyalty-customer-search" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Nhập từ khóa..." />
      {query.isFetching && <p role="status" className="text-sm text-muted-foreground">Đang tìm...</p>}
      {query.error && <p role="alert" className="text-sm text-destructive">Không thể tìm khách hàng.</p>}
      {keyword.trim() && !query.isFetching && customers.length === 0 && <p className="text-sm text-muted-foreground">Không tìm thấy khách hàng.</p>}
      <ul className="max-h-64 space-y-2 overflow-auto">
        {customers.map((customer) => (
          <li key={customer.id}>
            <Button type="button" variant="outline" className="h-auto w-full justify-start whitespace-normal py-2 text-left" onClick={() => onSelect(customer)}>
              <span><span className="block font-medium">{customer.name || `Khách hàng #${customer.id}`}</span><span className="text-muted-foreground text-xs">SĐT: {customer.phone || "—"} · Mã: {customer.id}</span></span>
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
