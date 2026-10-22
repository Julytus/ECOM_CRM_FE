"use client";

import * as React from "react";
import { FormDialog } from "@/components/ui/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import type { components } from "@/lib/api/schema.gen";

type Tier = components["schemas"]["LoyaltyTier"] & { id: number };
type TierRequest = components["schemas"]["LoyaltyTierRequest"];

export function TierDialog({
  open,
  tier,
  isLoading,
  onOpenChange,
  onSubmit
}: {
  open: boolean;
  tier: Tier | null;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TierRequest) => void;
}) {
  const [name, setName] = React.useState("");
  const [minRankPoints, setMinRankPoints] = React.useState("");
  const [earnMultiplier, setEarnMultiplier] = React.useState("");
  const [status, setStatus] = React.useState("1");

  React.useEffect(() => {
    setName(tier?.name ?? "");
    setMinRankPoints(tier?.minRankPoints === undefined ? "" : String(tier.minRankPoints));
    setEarnMultiplier(tier?.earnMultiplier === undefined ? "" : String(tier.earnMultiplier));
    setStatus(String(tier?.status ?? 1));
  }, [tier, open]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({
      ...(tier ? { id: tier.id } : {}),
      name: name.trim(),
      minRankPoints: Number(minRankPoints),
      earnMultiplier: Number(earnMultiplier),
      status: Number(status)
    });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={tier ? "Chỉnh sửa hạng" : "Thêm hạng thành viên"}
      featured="Thiết lập ngưỡng điểm và hệ số tích điểm cho hạng thành viên."
      onSubmit={handleSubmit}
      submitLabel={tier ? "Cập nhật" : "Thêm hạng"}
      isLoading={isLoading}
    >
      <div className="space-y-2">
        <Label htmlFor="tier-name">Tên hạng</Label>
        <Input
          id="tier-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tier-min-rank-points">Điểm hạng tối thiểu</Label>
        <Input
          id="tier-min-rank-points"
          type="number"
          min="0"
          step="1"
          value={minRankPoints}
          onChange={(event) => setMinRankPoints(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tier-earn-multiplier">Hệ số tích điểm</Label>
        <Input
          id="tier-earn-multiplier"
          type="number"
          min="0.000000000001"
          step="any"
          value={earnMultiplier}
          onChange={(event) => setEarnMultiplier(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Trạng thái</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger aria-label="Trạng thái">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Hoạt động</SelectItem>
            <SelectItem value="0">Ngừng hoạt động</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </FormDialog>
  );
}
