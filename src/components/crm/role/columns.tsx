import { type ColumnDef } from "@tanstack/react-table";
import { MoreVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import type { RoleDTO } from "@/lib/types/role";

export const createRoleColumns = ({
  onPermission,
  onEdit,
  onShowDeleteConfirm
}: {
  onPermission: (role: RoleDTO) => void;
  onEdit: (role: RoleDTO) => void;
  onShowDeleteConfirm: (id: number, name?: string) => void;
}): ColumnDef<RoleDTO>[] => [
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
    header: "Chức vụ",
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-foreground font-bold tracking-tight">{row.original.name}</span>
        {row.original.isDefault === 1 && <Badge variant="secondary">Mặc định</Badge>}
        {row.original.isOperator === 1 && <Badge variant="default">Toàn quyền</Badge>}
      </div>
    ),
    enableHiding: false
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
          <DropdownMenuItem onClick={() => onPermission(row.original)}>Phân quyền</DropdownMenuItem>
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
