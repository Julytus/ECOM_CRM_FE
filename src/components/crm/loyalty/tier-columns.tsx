import { type ColumnDef } from "@tanstack/react-table";
import { MoreVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import type { components } from "@/lib/api/schema.gen";

type Tier = components["schemas"]["LoyaltyTier"] & { id: number };

export const createTierColumns = ({
  canUpdate,
  canDelete,
  onEdit,
  onShowDeleteConfirm
}: {
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (tier: Tier) => void;
  onShowDeleteConfirm: (tier: Tier) => void;
}): ColumnDef<Tier>[] => [
  {
    accessorKey: "name",
    header: "Tên hạng",
    cell: ({ row }) => <span className="font-medium">{row.original.name ?? "—"}</span>
  },
  {
    accessorKey: "minRankPoints",
    header: "Điểm hạng tối thiểu",
    cell: ({ row }) => row.original.minRankPoints?.toLocaleString("vi-VN") ?? "—"
  },
  {
    accessorKey: "earnMultiplier",
    header: "Hệ số tích điểm",
    cell: ({ row }) => row.original.earnMultiplier ?? "—"
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.original.status;
      const active = status === 1;
      return (
        <Badge
          variant="outline"
          className={active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""}
        >
          {status === undefined ? "—" : active ? "Hoạt động" : "Ngừng hoạt động"}
        </Badge>
      );
    }
  },
  ...(canUpdate || canDelete
    ? [
        {
          id: "actions",
          cell: ({ row }) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-muted-foreground data-[state=open]:bg-muted flex size-8"
                  size="icon"
                  aria-label={`Thao tác hạng ${row.original.name ?? ""}`}
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {canUpdate && (
                  <DropdownMenuItem onClick={() => onEdit(row.original)}>
                    Chỉnh sửa
                  </DropdownMenuItem>
                )}
                {canUpdate && canDelete && <DropdownMenuSeparator />}
                {canDelete && (
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onShowDeleteConfirm(row.original)}
                  >
                    Xóa
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        } satisfies ColumnDef<Tier>
      ]
    : [])
];
