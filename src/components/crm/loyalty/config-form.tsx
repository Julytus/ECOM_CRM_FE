"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { components } from "@/lib/api/schema.gen";

type LoyaltyConfig = components["schemas"]["LoyaltyConfig"];

export function LoyaltyConfigForm({
  config,
  canUpdate,
  isLoading,
  isSaving,
  onSubmit
}: {
  config?: LoyaltyConfig;
  canUpdate: boolean;
  isLoading: boolean;
  isSaving: boolean;
  onSubmit: (earnRate: number) => void;
}) {
  const [earnRate, setEarnRate] = React.useState("");

  React.useEffect(() => {
    setEarnRate(config?.earnRate === undefined ? "" : String(config.earnRate));
  }, [config?.earnRate]);

  return (
    <form
      className="space-y-4 rounded-lg border p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(Number(earnRate));
      }}
    >
      <div>
        <h2 className="text-xl font-semibold">Cấu hình tích điểm</h2>
        <p className="text-muted-foreground text-sm">Chỉ ảnh hưởng đơn tương lai.</p>
      </div>
      <div className="max-w-sm space-y-2">
        <Label htmlFor="loyalty-earn-rate">Tỷ lệ quy đổi (đồng/điểm)</Label>
        <Input
          id="loyalty-earn-rate"
          type="number"
          min="1"
          step="1"
          value={earnRate}
          onChange={(event) => setEarnRate(event.target.value)}
          disabled={isLoading || !canUpdate}
          required
        />
      </div>
      {canUpdate && (
        <Button type="submit" disabled={isLoading || isSaving}>
          {isSaving ? "Đang lưu..." : "Lưu cấu hình"}
        </Button>
      )}
    </form>
  );
}
