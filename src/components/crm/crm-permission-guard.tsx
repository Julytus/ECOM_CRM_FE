import type { ReactNode } from "react";

import { AdminAccessDenied } from "@/components/crm/crm-access-denied";
import { AdminLoading } from "@/components/crm/crm-loading";
import { useCanView } from "@/hooks/use-can-view";

/** Bọc trang CRM: không có quyền VIEW của resource `code` thì hiện trang từ chối truy cập. */
export function CrmPermissionGuard({ code, children }: { code: string; children: ReactNode }) {
  const { canView, isPending } = useCanView();

  if (isPending) return <AdminLoading />;
  if (!canView(code)) return <AdminAccessDenied />;
  return <>{children}</>;
}
