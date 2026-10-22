import * as React from "react";
import type { components } from "@/lib/api/schema.gen";
import { FormDialog } from "@/components/ui/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Customer = components["schemas"]["Customer"];

export function LinkAccountDialog({ open, onOpenChange, customer, pending, onSubmit }: {
  open: boolean; onOpenChange: (open: boolean) => void; customer: Customer; pending: boolean;
  onSubmit: (accountUserId: number) => void;
}) {
  const [accountUserId, setAccountUserId] = React.useState("");
  const [error, setError] = React.useState("");
  React.useEffect(() => {
    setAccountUserId(customer.accountUserId == null ? "" : String(customer.accountUserId));
    setError("");
  }, [customer, open]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const id = Number(accountUserId);
    if (!Number.isInteger(id) || id <= 0) return setError("Account user ID phải là số nguyên dương.");
    setError("");
    onSubmit(id);
  };

  return <FormDialog open={open} onOpenChange={onOpenChange} title="Liên kết tài khoản" featured={`Khách hàng: ${customer.name || `#${customer.id}`}`} submitLabel="Liên kết" isLoading={pending} onSubmit={submit}>
    <div className="space-y-2"><Label htmlFor="account-user-id">Account user ID</Label><Input id="account-user-id" type="number" min="1" step="1" value={accountUserId} onChange={(event) => setAccountUserId(event.target.value)} required /></div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </FormDialog>;
}
