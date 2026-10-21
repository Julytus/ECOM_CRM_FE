import * as React from "react";
import { toast } from "sonner";

interface UseBulkDeleteOptions {
  /** Xóa 1 bản ghi (thường là `mutation.mutateAsync`). */
  deleteOne: (id: number) => Promise<unknown>;
  /** Gọi sau khi chạy xong (kể cả thất bại một phần) — thường là `refetch`. */
  onSettled?: () => void;
  /** Tên đối tượng hiển thị trong confirm, vd. "danh mục". */
  label: string;
  /** Số request song song tối đa. */
  concurrency?: number;
}

/**
 * Xóa nhiều bản ghi khi BE chưa có endpoint batch.
 * - Giới hạn số request song song (tránh bắn N request cùng lúc).
 * - Không fail-fast: lỗi 1 bản ghi không bỏ rơi các bản ghi còn lại.
 * - Luôn refetch để UI phản ánh đúng phần đã xóa được.
 */
export function useBulkDelete({
  deleteOne,
  onSettled,
  label,
  concurrency = 4
}: UseBulkDeleteOptions) {
  const [isPending, setIsPending] = React.useState(false);
  const pendingRef = React.useRef(false);

  const run = React.useCallback(
    async (ids: number[]) => {
      if (ids.length === 0 || pendingRef.current) return;
      if (!confirm(`Bạn có chắc muốn xóa ${ids.length} ${label} đã chọn?`)) return;

      pendingRef.current = true;
      setIsPending(true);

      let failed = 0;
      const queue = [...ids];
      const worker = async () => {
        for (let id = queue.shift(); id !== undefined; id = queue.shift()) {
          try {
            await deleteOne(id);
          } catch {
            failed++;
          }
        }
      };

      try {
        await Promise.all(Array.from({ length: Math.min(concurrency, ids.length) }, worker));
      } finally {
        pendingRef.current = false;
        setIsPending(false);
        onSettled?.();
      }

      if (failed === 0) toast.success("Xóa thành công");
      else if (failed === ids.length) toast.error("Xóa thất bại");
      else toast.warning(`Đã xóa ${ids.length - failed}/${ids.length}, ${failed} bản ghi thất bại`);
    },
    [deleteOne, onSettled, label, concurrency]
  );

  return { run, isPending };
}
