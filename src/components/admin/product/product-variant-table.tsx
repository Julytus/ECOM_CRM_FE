"use client";

import * as React from "react";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Undo2, ImageIcon } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ImageUploader } from "@/components/image/image-upload";

export type ProductVariant = {
  id?: number | null;
  sku: string;
  price: number;
  originalPrice: number;
  stock: number;
  image?: string | null;
  options: Record<string, string>;
  optionsLabel?: string;
};

interface HistoryEntry {
  rowIndex: number;
  columnId: string;
  previousValue: string | number;
}

function cellKey(rowIndex: number, columnId: string) {
  return `${rowIndex}:${columnId}`;
}

interface ProductVariantTableProps {
  variants: ProductVariant[];
  attributes: Array<{ name: string; fieldName: string }>;
  onVariantsChange: (variants: ProductVariant[]) => void;
}

export function ProductVariantTable({
  variants,
  attributes,
  onVariantsChange
}: ProductVariantTableProps) {
  const [editingCell, setEditingCell] = React.useState<{
    rowIndex: number;
    columnId: string;
  } | null>(null);
  const [draftValue, setDraftValue] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);
  const errorTimers = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  function startEdit(rowIndex: number, columnId: string, currentValue: string | number) {
    setEditingCell({ rowIndex, columnId });
    setDraftValue(String(currentValue));
  }

  function cancelEdit() {
    setEditingCell(null);
  }

  function flashError(key: string, message: string) {
    setErrors((prev) => ({ ...prev, [key]: message }));
    clearTimeout(errorTimers.current[key]);
    errorTimers.current[key] = setTimeout(() => {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }, 2000);
  }

  function validate(columnId: string, raw: string): string | null {
    if (columnId === "sku") {
      return raw.trim().length > 0 ? null : "SKU bắt buộc";
    }
    if (columnId === "price" || columnId === "originalPrice") {
      const n = Number(raw);
      if (raw.trim() === "" || Number.isNaN(n)) return "Nhập số";
      if (n < 0) return "Phải >= 0";
      return null;
    }
    if (columnId === "stock") {
      const n = Number(raw);
      if (raw.trim() === "" || Number.isNaN(n) || !Number.isInteger(n)) {
        return "Nhập số nguyên";
      }
      if (n < 0) return "Phải >= 0";
      return null;
    }
    return null;
  }

  function commitEdit(columnId: string) {
    if (!editingCell) return;
    const { rowIndex } = editingCell;
    const key = cellKey(rowIndex, columnId);
    const error = validate(columnId, draftValue);

    if (error) {
      flashError(key, error);
      setEditingCell(null);
      return;
    }

    const parsedValue =
      columnId === "price" || columnId === "originalPrice" || columnId === "stock"
        ? Number(draftValue)
        : draftValue;

    const previousValue = variants[rowIndex][columnId as keyof ProductVariant] as string | number;
    setEditingCell(null);

    if (previousValue === parsedValue) return;

    const newVariants = [...variants];
    newVariants[rowIndex] = { ...newVariants[rowIndex], [columnId]: parsedValue };
    onVariantsChange(newVariants);

    setHistory((prev) => [...prev, { rowIndex, columnId, previousValue }]);
  }

  function undo() {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const newVariants = [...variants];
      newVariants[last.rowIndex] = {
        ...newVariants[last.rowIndex],
        [last.columnId]: last.previousValue
      };
      onVariantsChange(newVariants);
      return prev.slice(0, -1);
    });
  }

  const columns = React.useMemo<ColumnDef<ProductVariant>[]>(() => {
    const attributeColumns: ColumnDef<ProductVariant>[] = attributes.map((attr) => ({
      id: `option_${attr.fieldName}`,
      header: attr.name,
      accessorFn: (row) => row.options[attr.fieldName],
      cell: ({ getValue }) => (
        <div className="px-2 py-1 text-sm font-medium">{getValue() as string}</div>
      )
    }));

    const editableColumns: ColumnDef<ProductVariant>[] = [
      {
        id: "image",
        header: "Hình ảnh",
        cell: ({ row }) => (
          <div className="flex items-center justify-center h-20 w-20 mx-auto" onClick={(e) => e.stopPropagation()}>
            <div className="h-16 w-16 overflow-hidden rounded-md border">
              <ImageUploader
                compact
                value={row.original.image || ""}
                onChange={(url) => {
                  const newVariants = [...variants];
                  newVariants[row.index] = { ...newVariants[row.index], image: url };
                  onVariantsChange(newVariants);
                }}
              />
            </div>
          </div>
        )
      },
      {
        id: "sku",
        header: "SKU",
        accessorKey: "sku",
        cell: ({ row, getValue }) => {
          const key = cellKey(row.index, "sku");
          const isEditing = editingCell?.rowIndex === row.index && editingCell.columnId === "sku";
          const error = errors[key];
          const value = getValue() as string;

          if (isEditing) {
            return (
              <Input
                autoFocus
                value={draftValue}
                onChange={(e) => setDraftValue(e.target.value)}
                onBlur={() => commitEdit("sku")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitEdit("sku");
                  if (e.key === "Escape") cancelEdit();
                }}
                className="h-8 px-2"
              />
            );
          }

          return (
            <button
              type="button"
              onClick={() => startEdit(row.index, "sku", value)}
              className={cn(
                "hover:bg-muted w-full rounded px-2 py-1 text-left text-sm",
                error && "text-destructive"
              )}
            >
              {error ?? value}
            </button>
          );
        }
      },
      {
        id: "price",
        header: "Giá bán (VNĐ)",
        accessorKey: "price",
        cell: ({ row, getValue }) => {
          const key = cellKey(row.index, "price");
          const isEditing = editingCell?.rowIndex === row.index && editingCell.columnId === "price";
          const error = errors[key];
          const value = getValue() as number;

          if (isEditing) {
            return (
              <Input
                autoFocus
                type="number"
                value={draftValue}
                onChange={(e) => setDraftValue(e.target.value)}
                onBlur={() => commitEdit("price")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitEdit("price");
                  if (e.key === "Escape") cancelEdit();
                }}
                className="h-8 px-2"
              />
            );
          }

          return (
            <button
              type="button"
              onClick={() => startEdit(row.index, "price", value)}
              className={cn(
                "hover:bg-muted w-full rounded px-2 py-1 text-left text-sm",
                error && "text-destructive"
              )}
            >
              {error ?? (value != null ? value.toLocaleString("vi-VN") : "0")}
            </button>
          );
        }
      },
      {
        id: "originalPrice",
        header: "Giá gốc (VNĐ)",
        accessorKey: "originalPrice",
        cell: ({ row, getValue }) => {
          const key = cellKey(row.index, "originalPrice");
          const isEditing =
            editingCell?.rowIndex === row.index && editingCell.columnId === "originalPrice";
          const error = errors[key];
          const value = getValue() as number;

          if (isEditing) {
            return (
              <Input
                autoFocus
                type="number"
                value={draftValue}
                onChange={(e) => setDraftValue(e.target.value)}
                onBlur={() => commitEdit("originalPrice")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitEdit("originalPrice");
                  if (e.key === "Escape") cancelEdit();
                }}
                className="h-8 px-2"
              />
            );
          }

          return (
            <button
              type="button"
              onClick={() => startEdit(row.index, "originalPrice", value)}
              className={cn(
                "hover:bg-muted w-full rounded px-2 py-1 text-left text-sm",
                error && "text-destructive"
              )}
            >
              {error ?? (value != null ? value.toLocaleString("vi-VN") : "0")}
            </button>
          );
        }
      },
      {
        id: "stock",
        header: "Tồn kho",
        accessorKey: "stock",
        cell: ({ row, getValue }) => {
          const key = cellKey(row.index, "stock");
          const isEditing = editingCell?.rowIndex === row.index && editingCell.columnId === "stock";
          const error = errors[key];
          const value = getValue() as number;

          if (isEditing) {
            return (
              <Input
                autoFocus
                type="number"
                value={draftValue}
                onChange={(e) => setDraftValue(e.target.value)}
                onBlur={() => commitEdit("stock")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitEdit("stock");
                  if (e.key === "Escape") cancelEdit();
                }}
                className="h-8 px-2"
              />
            );
          }

          return (
            <button
              type="button"
              onClick={() => startEdit(row.index, "stock", value)}
              className={cn(
                "hover:bg-muted w-full rounded px-2 py-1 text-left text-sm",
                error && "text-destructive"
              )}
            >
              {error ?? value}
            </button>
          );
        }
      }
    ];

    return [...attributeColumns, ...editableColumns];
  }, [attributes, variants, editingCell, draftValue, errors]);

  const table = useReactTable({
    data: variants,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row, index) => `${index}-${row.sku}`
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Click vào ô để chỉnh sửa. Enter để lưu, Esc để hủy.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={undo}
          disabled={history.length === 0}
        >
          <Undo2 className="mr-2 h-3.5 w-3.5" />
          Hoàn tác{history.length > 0 ? ` (${history.length})` : ""}
        </Button>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-bold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
