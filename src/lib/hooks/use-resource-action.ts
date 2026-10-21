import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

import { meQueryOptions } from "@/lib/tanstack/options/auth";
import { permissionResourceQueryOptions } from "@/lib/tanstack/options/permission";

export function useResourceAction() {
  const meQuery = useQuery(meQueryOptions);
  const permissionQuery = useQuery({
    ...permissionResourceQueryOptions(),
    retry: 1
  });

  return useCallback(
    (code: string, action: string) => {
      if (meQuery.data?.isOperator === 1) return true;
      if (meQuery.isError || permissionQuery.isError) return true;
      return Boolean(
        permissionQuery.data?.some(
          (resource) => resource.code === code && resource.actions.includes(action)
        )
      );
    },
    [meQuery.data?.isOperator, meQuery.isError, permissionQuery.data, permissionQuery.isError]
  );
}
