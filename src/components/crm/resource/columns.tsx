import { type ColumnDef } from "@tanstack/react-table";
import { MoreVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import type { ResourceDTO } from "@/lib/types/resource";

export const createResourceColumns = ({
  onEdit,
  onShowDeleteConfirm,
  onToggleActive
}: {
  onEdit: (resource: ResourceDTO) => void;
  onShowDeleteConfirm: (id: number, name?: string) => void;
  onToggleActive: (resource: ResourceDTO, active: boolean) => void;
}): ColumnDef<ResourceDTO>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: "name",
    header: "Tài nguyên",
    cell: ({ row }) => (
      <div className="flex flex-col truncate">
        <span className="text-foreground max-w-[220px] truncate font-bold tracking-tight">
          {row.original.name}
        </span>
        <span className="text-muted-foreground line-clamp-1 text-[11px] font-medium tracking-wider uppercase">
          {row.original.code}
        </span>
      </div>
    ),
    enableHiding: false
  },
  {
    accessorKey: "uri",
    header: "URI",
    cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.uri}</span>
  },
  {
    accessorKey: "actions",
    header: "Hành động hỗ trợ",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.actions.map((action) => (
          <Badge key={action} variant="secondary">
            {action}
          </Badge>
        ))}
      </div>
    )
  },
  {
    accessorKey: "active",
    header: "Kích hoạt",
    cell: ({ row }) => (
      <Switch
        checked={row.original.active === 1}
        onCheckedChange={(checked) => onToggleActive(row.original, checked)}
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
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem onClick={() => onEdit(row.original)}>Chỉnh sửa</DropdownMenuItem>
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
