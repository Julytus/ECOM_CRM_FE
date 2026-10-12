import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Star, Eye, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import type { ProductDTO } from "@/lib/types/product";
import { ImageWithFallback } from "@/components/image/image-with-fallback";
import { cn } from "@/lib/utils";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  }).format(value);
};

export const createProductColumns = ({
  onEdit,
  onDelete,
  onShowDeleteConfirm
}: {
  onEdit: (id: number) => void;
  onDelete?: (ids: number[]) => void;
  onShowDeleteConfirm?: (id: number, name?: string) => void;
}): ColumnDef<ProductDTO>[] => [
  {
    id: "filter"
  },
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-[6px]"
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-[6px]"
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
      />
    ),
    enableSorting: false,
    enableHiding: false
  },

  {
    accessorKey: "thumbnail",
    header: "Sản phẩm",
    cell: ({ row }) => {
      const src = row.original.thumbnail || row.original.image?.[0];
      return (
        <div className="flex items-center gap-4">
          <div className="border-border relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border shadow-sm">
            {src ? (
              <ImageWithFallback
                src={src}
                alt={row.original.name}
                className="h-full w-full object-cover transition-transform hover:scale-110"
              />
            ) : (
              <div className="bg-muted flex h-full w-full items-center justify-center">
                <span className="text-muted-foreground text-[10px]">No Image</span>
              </div>
            )}
          </div>
          <div className="flex flex-col truncate">
            <span className="text-foreground max-w-[200px] truncate font-bold tracking-tight">
              {row.original.name}
            </span>
            <span className="text-muted-foreground line-clamp-1 text-[11px] font-medium tracking-wider uppercase">
              ID: {row.original.id}
            </span>
          </div>
        </div>
      );
    }
  },

  {
    accessorKey: "categoryName",
    header: "Danh mục",
    cell: ({ row }) => (
      <div className="flex">
        {row.original.categoryName ? (
          <Badge
            variant="secondary"
            className="bg-muted/50 text-muted-foreground rounded-full border-none px-3 font-medium"
          >
            {row.original.categoryName}
          </Badge>
        ) : (
          <span className="text-muted-foreground/50 text-xs">—</span>
        )}
      </div>
    )
  },

  {
    id: "price",
    header: "Giá bán",
    cell: ({ row }) => {
      const { minPrice, maxPrice, originalMinPrice, originalMaxPrice } = row.original;
      const hasDiscount = originalMinPrice > minPrice || originalMaxPrice > maxPrice;

      return (
        <div className="flex flex-col">
          <span className="text-primary font-bold tracking-tight">{formatCurrency(minPrice)}</span>
          {hasDiscount && (
            <span className="text-muted-foreground decoration-destructive/50 text-[10px] line-through">
              {formatCurrency(originalMinPrice)}
            </span>
          )}
        </div>
      );
    }
  },

  {
    accessorKey: "avgRating",
    header: "Đánh giá",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Star
          className={cn(
            "h-3.5 w-3.5",
            row.original.avgRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
          )}
        />
        <span
          className={cn(
            "text-sm font-medium",
            row.original.avgRating ? "text-foreground" : "text-muted-foreground/50"
          )}
        >
          {row.original.avgRating ? row.original.avgRating.toFixed(1) : "0.0"}
        </span>
      </div>
    )
  },

  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          className={cn(
            "rounded-full border-none px-3 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
            status
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
              : "bg-orange-100 text-orange-700 hover:bg-orange-100"
          )}
        >
          {status ? "Đang bán" : "Tạm ngưng"}
        </Badge>
      );
    }
  },

  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="hover:bg-muted h-8 w-8 rounded-full">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="shadow-foreground/5 w-48 rounded-2xl border-0 p-2 shadow-xl"
        >
          <DropdownMenuItem
            className="cursor-pointer rounded-xl py-2"
            onSelect={() => onEdit(row.original.id)}
          >
            <Pencil className="text-muted-foreground mr-3 h-4 w-4" />
            <span className="font-medium">Chỉnh sửa</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer rounded-xl py-2"
            onSelect={() => window.open(`/product/${row.original.id}`, "_blank")}
          >
            <Eye className="text-muted-foreground mr-3 h-4 w-4" />
            <span className="font-medium">Xem trên web</span>
          </DropdownMenuItem>
          {onDelete ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer rounded-xl py-2"
                onSelect={() => onShowDeleteConfirm?.(row.original.id, row.original.name)}
              >
                <Trash2 className="mr-3 h-4 w-4" />
                <span className="font-medium">Xóa sản phẩm</span>
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
];
