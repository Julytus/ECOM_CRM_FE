"use client";

import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { type Table } from "@tanstack/react-table";
import { ListFilter } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  /** Optional mapping of column IDs to friendly display names */
  columnLabels?: Record<string, string>;
}

export function DataTableViewOptions<TData>({
  table,
  columnLabels = {}
}: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "border-muted-foreground/20 ml-auto hidden h-11 rounded-full px-5 lg:flex",
            "hover:bg-accent hover:text-accent-foreground gap-2 transition-all"
          )}
        >
          <ListFilter className="text-muted-foreground h-4 w-4" />
          <span className="text-sm font-semibold tracking-tight">Hiển thị</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="shadow-foreground/5 animate-in fade-in zoom-in-95 w-[200px] rounded-2xl border-0 p-2 shadow-xl duration-200"
      >
        <DropdownMenuLabel className="text-muted-foreground/70 px-3 py-2 text-[11px] font-bold tracking-widest uppercase">
          Tùy chỉnh cột
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-muted/60 mx-1 my-1" />

        <div className="flex flex-col gap-0.5">
          {table
            .getAllColumns()
            .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
            .map((column) => {
              // Priority: Provided label > Capitalized ID
              const displayName =
                columnLabels[column.id] || column.id.charAt(0).toUpperCase() + column.id.slice(1);

              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className={cn(
                    "cursor-pointer rounded-xl px-3 py-2 capitalize transition-colors",
                    "focus:bg-primary/5 focus:text-primary data-[state=checked]:text-primary"
                  )}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  <span className="text-sm font-medium tracking-tight">{displayName}</span>
                </DropdownMenuCheckboxItem>
              );
            })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
