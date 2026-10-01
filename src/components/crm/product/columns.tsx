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
import type { ProductDetailsDTO } from "@/lib/types/product";

export const createProductColumns = ({
  onEdit,
  onDelete
}: {
  onEdit: (id: number) => void;
  onDelete: (ids: number[]) => void;
}): ColumnDef<ProductDetailsDTO>[] => [
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
    accessorKey: "image",
    header: "",
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        {row.original.thumbnail || row.original.image ? (
          <img
            src={row.original.thumbnail || row.original.image || ""}
            alt={row.original.name}
            className="h-10 w-10 rounded object-cover"
          />
        ) : (
          <div className="bg-muted h-10 w-10 rounded" />
        )}
      </div>
    ),
    enableHiding: false
  },
  {
    accessorKey: "name",
    header: "Tên sản phẩm",
    cell: ({ row }) => (
      <Button
        variant="link"
        className="text-foreground w-fit px-0 text-left"
        onClick={() => onEdit(row.original.id)}
      >
        {row.original.name}
      </Button>
    ),
    enableHiding: false
  },
  {
    accessorKey: "categoryName",
    header: "Danh mục",
    cell: ({ row }) => (
      <div className="text-muted-foreground">{row.original.categoryName || "—"}</div>
    )
  },
  {
    accessorKey: "minPrice",
    header: "Giá",
    cell: ({ row }) => {
      const { minPrice, maxPrice } = row.original;
      if (minPrice === maxPrice) {
        return <div className="font-medium">{minPrice.toLocaleString()}₫</div>;
      }
      return (
        <div className="font-medium">
          {minPrice.toLocaleString()}₫ - {maxPrice.toLocaleString()}₫
        </div>
      );
    }
  },
  {
    accessorKey: "active",
    header: "Trạng thái",
    cell: ({ row }) => (
      <Badge variant={row.original.active === 1 ? "default" : "secondary"}>
        {row.original.active === 1 ? "Hoạt động" : "Tắt"}
      </Badge>
    )
  },
  {
    accessorKey: "avgRating",
    header: "Đánh giá",
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {row.original.avgRating ? `${row.original.avgRating.toFixed(1)}⭐` : "—"}
      </div>
    )
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        {row.original.id}
      </Badge>
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
          <DropdownMenuItem onClick={() => onEdit(row.original.id)}>Chỉnh sửa</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => onDelete([row.original.id])}
          >
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
];
