import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";

import { CrmPermissionGuard } from "@/components/crm/crm-permission-guard";
import { DataTableAdvanced } from "@/components/crm/table/data-table-advanced";
import { DeleteConfirmDialog } from "@/components/crm/delete-confirm-dialog";
import { createVoucherColumns, type VoucherRow } from "@/components/crm/voucher/columns";
import { VoucherDialog } from "@/components/crm/voucher/voucher-dialog";
import { useBulkDelete } from "@/hooks/use-bulk-delete";
import { useResourceAction } from "@/lib/hooks/use-resource-action";
import { getTiers } from "@/lib/api/loyalty";
import { getVoucher } from "@/lib/api/voucher";
import type { components } from "@/lib/api/schema.gen";
import {
  deleteVoucherMutationOptions,
  saveVoucherMutationOptions,
  vouchersQueryOptions
} from "@/lib/tanstack/options/voucher";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type Voucher = components["schemas"]["Voucher"];
type Tier = components["schemas"]["LoyaltyTier"] & { id: number };
type ActionError = AxiosError<{ message?: string }>;
type FilterValues = { keyword: string; status: string };

export const Route = createFileRoute("/crm/voucher")({
  component: () => <CrmPermissionGuard code="VOUCHER"><VoucherAdminPage /></CrmPermissionGuard>
});

function getErrorMessage(error: unknown, fallback: string) {
  return (error as ActionError)?.response?.data?.message || fallback;
}

function VoucherAdminPage() {
  const queryClient = useQueryClient();
  const canResourceAction = useResourceAction();
  const canAdd = canResourceAction("VOUCHER", "ADD");
  const canUpdate = canResourceAction("VOUCHER", "UPDATE");
  const canDelete = canResourceAction("VOUCHER", "DELETE");
  const [filters, setFilters] = React.useState<FilterValues>({ keyword: "", status: "" });
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [selectedVoucher, setSelectedVoucher] = React.useState<VoucherRow | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteVoucher, setDeleteVoucher] = React.useState<VoucherRow | null>(null);

  const queryParams = React.useMemo(() => ({
    keyword: filters.keyword.trim() || undefined,
    status: filters.status === "" ? undefined : Number(filters.status),
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize
  }), [filters, pagination]);
  const listQuery = useQuery(vouchersQueryOptions(queryParams));
  const tiersQuery = useQuery({
    queryKey: ["loyalty-tiers"],
    queryFn: async () => (await getTiers()) ?? [],
    retry: false
  });
  const saveMutation = useMutation(saveVoucherMutationOptions());
  const deleteMutation = useMutation(deleteVoucherMutationOptions());
  const vouchers = React.useMemo(
    () => (listQuery.data?.items ?? []).filter((voucher): voucher is VoucherRow => typeof voucher.id === "number"),
    [listQuery.data]
  );
  const tiers = React.useMemo(
    () => (tiersQuery.data ?? []).filter((tier): tier is Tier => typeof tier.id === "number"),
    [tiersQuery.data]
  );

  React.useEffect(() => {
    if (listQuery.error) toast.error(getErrorMessage(listQuery.error, "Không thể tải danh sách voucher."));
  }, [listQuery.error]);
  React.useEffect(() => {
    if (tiersQuery.error) toast.error(getErrorMessage(tiersQuery.error, "Không thể tải danh sách hạng thành viên."));
  }, [tiersQuery.error]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["vouchers"] });
  const openEdit = async (row: VoucherRow) => {
    try {
      const fullVoucher = await getVoucher(row.id);
      if (!fullVoucher) throw new Error("Không nhận được thông tin voucher.");
      setSelectedVoucher({ ...row, ...fullVoucher, id: row.id });
      setFormOpen(true);
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể tải thông tin voucher."));
    }
  };
  const save = (voucher: Voucher) => saveMutation.mutate(voucher, {
    onSuccess: async () => {
      setFormOpen(false);
      await refresh();
      toast.success(selectedVoucher ? "Cập nhật voucher thành công." : "Tạo voucher thành công.");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Không thể lưu voucher."))
  });
  const remove = (id: number) => deleteMutation.mutate(id, {
    onSuccess: async () => {
      setDeleteVoucher(null);
      await refresh();
      toast.success("Xóa voucher thành công.");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Không thể xóa voucher."))
  });
  const { run: removeSelected, isPending: isBulkDeleting } = useBulkDelete({
    deleteOne: deleteMutation.mutateAsync,
    onSettled: () => void refresh(),
    label: "voucher"
  });
  const columns = React.useMemo(() => createVoucherColumns({
    canUpdate,
    canDelete,
    onEdit: (voucher) => void openEdit(voucher),
    onShowDeleteConfirm: setDeleteVoucher
  }), [canDelete, canUpdate]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Label htmlFor="voucher-status-filter">Trạng thái</Label>
        <Select value={filters.status || "all"} onValueChange={(value) => {
          setFilters((current) => ({ ...current, status: value === "all" ? "" : value }));
          setPagination((current) => ({ ...current, pageIndex: 0 }));
        }}>
          <SelectTrigger id="voucher-status-filter" aria-label="Lọc trạng thái" className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tất cả</SelectItem><SelectItem value="1">Hoạt động</SelectItem><SelectItem value="0">Ngừng hoạt động</SelectItem></SelectContent>
        </Select>
      </div>
      <DataTableAdvanced
        data={vouchers}
        columns={columns}
        total={listQuery.data?.total ?? 0}
        pageSize={pagination.pageSize}
        pageIndex={pagination.pageIndex}
        onPaginationChange={(pageIndex, pageSize) => setPagination({ pageIndex, pageSize })}
        isLoading={listQuery.isFetching || isBulkDeleting}
        onRefresh={() => void listQuery.refetch()}
        onAdd={canAdd ? () => { setSelectedVoucher(null); setFormOpen(true); } : undefined}
        onDeleteSelected={canDelete ? (ids) => void removeSelected(ids) : undefined}
        addLabel="Thêm voucher"
        deleteLabel="Xóa đã chọn"
        title="Quản lý voucher"
        description="Tạo và quản lý voucher giảm giá, bao gồm voucher đổi điểm loyalty."
        filter={{
          fields: [{ key: "keyword", label: "Từ khóa", placeholder: "Tìm mã hoặc tên voucher..." }],
          values: { keyword: filters.keyword },
          onChange: (values) => {
            setFilters((current) => ({ ...current, keyword: values.keyword ?? "" }));
            setPagination((current) => ({ ...current, pageIndex: 0 }));
          }
        }}
      />
      <VoucherDialog
        open={formOpen}
        voucher={selectedVoucher}
        tiers={tiers}
        isLoading={saveMutation.isPending}
        canUpdate={selectedVoucher ? canUpdate : canAdd}
        onOpenChange={setFormOpen}
        onSubmit={save}
      />
      <DeleteConfirmDialog
        open={deleteVoucher !== null}
        itemId={deleteVoucher?.id ?? null}
        itemName={deleteVoucher?.name ?? deleteVoucher?.code}
        itemType="voucher"
        onConfirm={remove}
        onOpenChange={(open) => { if (!open) setDeleteVoucher(null); }}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
