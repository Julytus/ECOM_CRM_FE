import * as React from "react";
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
import type { CategoryDTO } from "@/lib/types/category";

export const createCategoryColumns = ({
  onDelete,
  onEdit,
  onShowDeleteConfirm
}: {
  onDelete: (id: number) => void;
  onEdit: (category: CategoryDTO) => void;
  onShowDeleteConfirm: (id: number, name?: string) => void;
}): ColumnDef<CategoryDTO>[] => [
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
    header: "Tên danh mục",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col truncate">
          <span className="text-foreground max-w-[200px] truncate font-bold tracking-tight">
            {row.original.name}
          </span>
          <span className="text-muted-foreground line-clamp-1 text-[11px] font-medium tracking-wider uppercase">
            ID: {row.original.id}
          </span>
        </div>
      );
    },
    enableHiding: false
  },
  {
    accessorKey: "featured",
    header: "Mô tả",
    cell: ({ row }) => (
      <div className="text-muted-foreground max-w-md truncate">{row.original.featured || "—"}</div>
    )
  },
  {
    id: "actions",
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
          <DropdownMenuItem>Sao chép</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={() => onShowDeleteConfirm(row.original.id, row.original.name)}>
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
];
