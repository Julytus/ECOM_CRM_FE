import { type ColumnDef } from "@tanstack/react-table";
import { MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import type { ModuleDTO } from "@/lib/types/module";

export const createModuleColumns = ({
  onEdit,
  onShowDeleteConfirm,
  onToggleActive
}: {
  onEdit: (module: ModuleDTO) => void;
  onShowDeleteConfirm: (id: number, name?: string) => void;
  onToggleActive: (module: ModuleDTO, active: boolean) => void;
  onAssign?: (module: ModuleDTO) => void;
}): ColumnDef<ModuleDTO>[] => [
  {
    accessorKey: "name",
    header: "Tên module",
    cell: ({ row }) => (
      <span className="text-foreground font-bold tracking-tight">{row.original.name}</span>
    ),
    enableHiding: false
  },
  { accessorKey: "code", header: "Code" },
  {
    accessorKey: "description",
    header: "Mô tả",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.description || "—"}</span>
    )
  },
  {
    accessorKey: "active",
    header: "Kích hoạt",
    cell: ({ row }) => (
      <Switch
        checked={row.original.active === 1}
        onCheckedChange={(checked) => onToggleActive(row.original, checked)}
        aria-label={`Bật hoặc tắt module ${row.original.name}`}
      />
    )
  },
  {
    id: "rowActions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="text-muted-foreground data-[state=open]:bg-muted flex size-8"
            size="icon"
          >
            <MoreVertical className="size-4" />
            <span className="sr-only">Mở menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem onClick={() => onEdit(row.original)}>Sửa</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => onShowDeleteConfirm(row.original.id, row.original.name)}
          >
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
];
