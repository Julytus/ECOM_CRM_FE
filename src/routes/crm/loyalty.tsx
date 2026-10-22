import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";

import { CrmPermissionGuard } from "@/components/crm/crm-permission-guard";
import { DataTableAdvanced } from "@/components/crm/table/data-table-advanced";
import { DeleteConfirmDialog } from "@/components/crm/delete-confirm-dialog";
import { LoyaltyConfigForm } from "@/components/crm/loyalty/config-form";
import { createTierColumns } from "@/components/crm/loyalty/tier-columns";
import { TierDialog } from "@/components/crm/loyalty/tier-dialog";
import { useResourceAction } from "@/lib/hooks/use-resource-action";
import type { components } from "@/lib/api/schema.gen";
import {
  deleteTierMutationOptions,
  loyaltyConfigQueryOptions,
  saveTierMutationOptions,
  tiersQueryOptions,
  updateLoyaltyConfigMutationOptions
} from "@/lib/tanstack/options/loyalty";

type Tier = components["schemas"]["LoyaltyTier"] & { id: number };
type TierRequest = components["schemas"]["LoyaltyTierRequest"];
type ActionError = AxiosError<{ message?: string }>;

export const Route = createFileRoute("/crm/loyalty")({
  component: () => (
    <CrmPermissionGuard code="LOYALTY">
      <LoyaltyAdminPage />
    </CrmPermissionGuard>
  )
});

function getErrorMessage(error: unknown, fallback: string) {
  return (error as ActionError)?.response?.data?.message || fallback;
}

function LoyaltyAdminPage() {
  const queryClient = useQueryClient();
  const canResourceAction = useResourceAction();
  const canAdd = canResourceAction("LOYALTY", "ADD");
  const canUpdate = canResourceAction("LOYALTY", "UPDATE");
  const canDelete = canResourceAction("LOYALTY", "DELETE");

  const tiersQuery = useQuery(tiersQueryOptions);
  const configQuery = useQuery(loyaltyConfigQueryOptions);
  const saveTierMutation = useMutation(saveTierMutationOptions());
  const deleteTierMutation = useMutation(deleteTierMutationOptions());
  const updateConfigMutation = useMutation(updateLoyaltyConfigMutationOptions());

  const [selectedTier, setSelectedTier] = React.useState<Tier | null>(null);
  const [tierDialogOpen, setTierDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [tierToDelete, setTierToDelete] = React.useState<Tier | null>(null);

  React.useEffect(() => {
    if (tiersQuery.error)
      toast.error(getErrorMessage(tiersQuery.error, "Không thể tải danh sách hạng thành viên."));
  }, [tiersQuery.error]);

  React.useEffect(() => {
    if (configQuery.error)
      toast.error(getErrorMessage(configQuery.error, "Không thể tải cấu hình tích điểm."));
  }, [configQuery.error]);

  const tiers = React.useMemo(
    () => (tiersQuery.data ?? []).filter((tier): tier is Tier => typeof tier.id === "number"),
    [tiersQuery.data]
  );

  const columns = React.useMemo(
    () =>
      createTierColumns({
        canUpdate,
        canDelete,
        onEdit: (tier) => {
          setSelectedTier(tier);
          setTierDialogOpen(true);
        },
        onShowDeleteConfirm: (tier) => {
          setTierToDelete(tier);
          setDeleteDialogOpen(true);
        }
      }),
    [canDelete, canUpdate]
  );

  const handleSaveTier = (values: TierRequest) =>
    saveTierMutation.mutate(values, {
      onSuccess: async () => {
        setTierDialogOpen(false);
        await queryClient.invalidateQueries({ queryKey: ["loyalty-tiers"] });
        toast.success("Lưu hạng thành viên thành công.");
      }
    });

  const handleDeleteTier = (id: number) =>
    deleteTierMutation.mutate(id, {
      onSuccess: async () => {
        setDeleteDialogOpen(false);
        setTierToDelete(null);
        await queryClient.invalidateQueries({ queryKey: ["loyalty-tiers"] });
        toast.success("Xóa hạng thành viên thành công.");
      }
    });

  return (
    <div className="space-y-5 p-6">
      <section>
        <h1 className="text-3xl font-bold tracking-tight">Quản lý hạng thành viên</h1>
        <p className="text-muted-foreground text-sm">
          Đổi hạng/ngưỡng chỉ tính lại hạng tài khoản ở lần ghi điểm kế tiếp.
        </p>
      </section>

      <DataTableAdvanced
        data={tiers}
        columns={columns}
        total={tiers.length}
        pageSize={10}
        pageIndex={0}
        onPaginationChange={() => undefined}
        isLoading={tiersQuery.isFetching}
        onRefresh={() => void tiersQuery.refetch()}
        onAdd={canAdd ? () => {
          setSelectedTier(null);
          setTierDialogOpen(true);
        } : undefined}
        addLabel="Thêm hạng"
        title="Hạng thành viên"
        description="Ngưỡng điểm và hệ số tích điểm theo từng hạng."
      />

      <LoyaltyConfigForm
        config={configQuery.data}
        canUpdate={canUpdate}
        isLoading={configQuery.isFetching}
        isSaving={updateConfigMutation.isPending}
        onSubmit={(earnRate) =>
          updateConfigMutation.mutate(
            { earnRate },
            {
              onSuccess: async () => {
                await queryClient.invalidateQueries({ queryKey: ["loyalty-config"] });
                toast.success("Cập nhật cấu hình tích điểm thành công.");
              }
            }
          )
        }
      />

      <TierDialog
        open={tierDialogOpen}
        tier={selectedTier}
        isLoading={saveTierMutation.isPending}
        onOpenChange={setTierDialogOpen}
        onSubmit={handleSaveTier}
      />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        itemId={tierToDelete?.id ?? null}
        itemName={tierToDelete?.name}
        itemType="hạng thành viên"
        onConfirm={handleDeleteTier}
        onOpenChange={setDeleteDialogOpen}
        isLoading={deleteTierMutation.isPending}
      />
    </div>
  );
}
