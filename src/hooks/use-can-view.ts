import { useQuery } from "@tanstack/react-query";

import { meQueryOptions } from "@/lib/tanstack/options/auth";
import { permissionResourceQueryOptions } from "@/lib/tanstack/options/permission";

/**
 * Quyền VIEW theo `code` resource của role đăng nhập (`/permission/resource`).
 * Operator luôn được xem; query permission lỗi thì fail-open (BE vẫn chặn ở API).
 * `isPending` = chưa đủ dữ liệu để quyết định, caller không nên coi là "không có quyền".
 */
export function useCanView() {
  const { data: me, isPending: mePending } = useQuery(meQueryOptions);
  const {
    data: resources,
    isError,
    isPending: resourcesPending
  } = useQuery({ ...permissionResourceQueryOptions(), retry: 1 });

  const canView = (code: string) =>
    me?.isOperator === 1 ||
    isError ||
    !!resources?.some((r) => r.code === code && r.actions.includes("VIEW"));

  return { canView, isPending: mePending || (resourcesPending && me?.isOperator !== 1) };
}
