import { ErrorResponseWarper } from "@/lib/types/common";
import { MutationCache, QueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      invalidatesQuery?: QueryKey[];
      successMessage?: string;
      errorMessage?: string;
    };
  }
}

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      if (mutation.meta?.successMessage) {
        toast.success(mutation.meta.successMessage);
      }
    },

    onError: (err, _vars, context, mutation) => {
      const message = mutation.meta?.errorMessage ?? ErrorResponseWarper(err);
      toast.error(message);
    },

    onSettled: (_data, _error, _variables, _context, mutation) => {
      const keys = mutation.meta?.invalidatesQuery;
      if (!keys) return;

      const list = Array.isArray(keys) ? keys : [keys];

      list.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
    }
  })
});
