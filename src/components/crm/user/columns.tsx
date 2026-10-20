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
import type { CrmUserDTO } from "@/lib/types/crm-user";

export const createCrmUserColumns = ({
  onEdit,
  onShowDeleteConfirm
}: {
  onEdit: (user: CrmUserDTO) => void;
  onShowDeleteConfirm: (id: number, name?: string) => void;
}): ColumnDef<CrmUserDTO>[] => [
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
    header: "Người dùng",
    cell: ({ row }) => (
      <div className="flex flex-col truncate">
        <span className="text-foreground max-w-[200px] truncate font-bold tracking-tight">
          {row.original.name}
        </span>
        <span className="text-muted-foreground line-clamp-1 text-[11px] font-medium tracking-wider uppercase">
          ID: {row.original.id}
        </span>
      </div>
    ),
    enableHiding: false
  },
  {
    id: "contact",
    header: "Email/SĐT",
    cell: ({ row }) => (
      <div className="flex flex-col text-sm">
        <span>{row.original.email || "—"}</span>
        <span className="text-muted-foreground">{row.original.phone || "—"}</span>
      </div>
    )
  },
  {
    accessorKey: "roleName",
    header: "Chức vụ",
    cell: ({ row }) => <span>{row.original.roleName || "—"}</span>
  },
  {
    accessorKey: "active",
    header: "Trạng thái",
    cell: ({ row }) =>
      row.original.active === 1 ? (
        <Badge variant="default">Hoạt động</Badge>
      ) : (
        <Badge variant="secondary">Vô hiệu hóa</Badge>
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
