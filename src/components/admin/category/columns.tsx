import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import type { CategoryDTO } from "@/lib/types/category";

export const createCategoryColumns = ({
  onEdit,
  onDelete
}: {
  onEdit: (c: CategoryDTO) => void;
  onDelete: (id: number) => void;
}): ColumnDef<CategoryDTO>[] => [
  {
    accessorKey: "name",
    header: "Tên danh mục"
  },
  {
    accessorKey: "description",
    header: "Mô tả"
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const c = row.original;
      return (
        <div className="flex justify-end gap-2">
          <Button size="icon" variant="ghost" onClick={() => onEdit(c)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => onDelete(c.id)}>
            <Trash className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      );
    }
  }
];
