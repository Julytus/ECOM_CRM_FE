"use client";

import * as React from "react";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Undo2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import { cn, validateNonNegativeInteger, validateNonNegativeNumber } from "@/lib/utils";
import { EditableVariantCell } from "./editable-variant-cell";
import { VariantImageCell } from "./variant-image-cell";

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

type EditableColumnId = "sku" | "price" | "originalPrice" | "stock";
type MoveDirection = "next" | "previous" | "next-row";

interface HistoryEntry {
  variantKey: string;
  columnId: EditableColumnId;
  previousValue: string | number;
}

interface ProductVariantTableProps {
  variants: ProductVariant[];
  attributes: Array<{
    name: string;
    fieldName: string;
  }>;
  onVariantsChange: (variants: ProductVariant[]) => void;
}

const VARIANT_COLUMN_SIZE = {
  option: 90,
  image: 90,
  sku: 220,
  price: 170,
  originalPrice: 170,
  stock: 120
} as const;

const EDITABLE_COLUMNS: EditableColumnId[] = ["sku", "price", "originalPrice", "stock"];

function variantKey(variant: ProductVariant, index: number) {
  // Existing variants use the database id. Newly generated variants do not have an id,
  // so their immutable attribute combination is used as the stable identity.
  if (variant.id != null) return `id:${variant.id}`;

  const options = Object.keys(variant.options || {})
    .sort()
    .map((key) => `${key}=${variant.options[key]}`)
    .join("|");

  return `new:${options || `index:${index}`}`;
}

function cellKey(key: string, columnId: string) {
  return `${key}:${columnId}`;
}

function formatCellValue(value: string | number) {
  return typeof value === "number" ? value.toLocaleString("vi-VN") : value;
}

export function ProductVariantTable({
  variants,
  attributes,
  onVariantsChange
}: ProductVariantTableProps) {
  const [editingCell, setEditingCell] = React.useState<{
    variantKey: string;
    columnId: EditableColumnId;
  } | null>(null);
  const [draftValue, setDraftValue] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);
  const errorTimers = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Keep the current edit draft independent from parent renders. This prevents a form
  // update from unexpectedly replacing the value while the user is typing.
  const variantsRef = React.useRef(variants);
  React.useEffect(() => {
    variantsRef.current = variants;
  }, [variants]);

  React.useEffect(() => {
    return () => {
      Object.values(errorTimers.current).forEach(clearTimeout);
    };
  }, []);

  const getVariantKey = React.useCallback((variant: ProductVariant, index: number) => {
    return variantKey(variant, index);
  }, []);

  const clearEditing = React.useCallback(() => {
    setEditingCell(null);
    setDraftValue("");
  }, []);

  function startEdit(index: number, columnId: EditableColumnId, currentValue: string | number) {
    const variant = variantsRef.current[index];
    if (!variant) return;

    setEditingCell({
      variantKey: getVariantKey(variant, index),
      columnId
    });
    setDraftValue(String(currentValue));

    const key = cellKey(getVariantKey(variant, index), columnId);
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function cancelEdit() {
    clearEditing();
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

  function validate(columnId: EditableColumnId, raw: string): string | null {
    switch (columnId) {
      case "sku":
        return raw.trim().length > 0 ? null : "SKU bắt buộc";
      case "price":
      case "originalPrice":
        return validateNonNegativeNumber(raw);
      case "stock":
        return validateNonNegativeInteger(raw);
      default:
        return null;
    }
  }

  /**
   * Commits the current draft into the form-owned variants array.
   * Returns false when validation fails so Enter/Tab cannot move away from an invalid cell.
   */
  function commitEdit(): boolean {
    if (!editingCell) return false;

    const { variantKey: key, columnId } = editingCell;
    const currentVariants = variantsRef.current;
    const rowIndex = currentVariants.findIndex(
      (variant, index) => getVariantKey(variant, index) === key
    );

    if (rowIndex < 0) {
      clearEditing();
      return false;
    }

    const error = validate(columnId, draftValue);
    const errorKey = cellKey(key, columnId);

    if (error) {
      flashError(errorKey, error);
      return false;
    }

    const parsedValue =
      columnId === "price" || columnId === "originalPrice" || columnId === "stock"
        ? Number(draftValue)
        : draftValue.trim();

    const previousValue = currentVariants[rowIndex][columnId] as string | number;

    clearEditing();

    if (previousValue === parsedValue) return true;

    const newVariants = currentVariants.map((variant, index) =>
      index === rowIndex
        ? {
            ...variant,
            [columnId]: parsedValue
          }
        : variant
    );

    variantsRef.current = newVariants;
    onVariantsChange(newVariants);

    setHistory((prev) => [
      ...prev,
      {
        variantKey: key,
        columnId,
        previousValue
      }
    ]);

    return true;
  }

  function moveAfterCommit(direction: MoveDirection) {
    if (!editingCell) return;

    const { variantKey: key, columnId } = editingCell;
    const currentVariants = variantsRef.current;
    const rowIndex = currentVariants.findIndex(
      (variant, index) => getVariantKey(variant, index) === key
    );

    if (rowIndex < 0) return;

    let nextRow = rowIndex;
    let nextColumnIndex = EDITABLE_COLUMNS.indexOf(columnId);

    if (direction === "next") {
      nextColumnIndex += 1;
      if (nextColumnIndex >= EDITABLE_COLUMNS.length) {
        nextColumnIndex = 0;
        nextRow += 1;
      }
    } else if (direction === "previous") {
      nextColumnIndex -= 1;
      if (nextColumnIndex < 0) {
        nextColumnIndex = EDITABLE_COLUMNS.length - 1;
        nextRow -= 1;
      }
    } else {
      nextRow += 1;
    }

    if (nextRow < 0 || nextRow >= currentVariants.length) {
      clearEditing();
      return;
    }

    const nextColumn = EDITABLE_COLUMNS[nextColumnIndex];
    const nextVariant = currentVariants[nextRow];
    const nextValue = nextVariant[nextColumn] as string | number;
    const nextKey = getVariantKey(nextVariant, nextRow);

    setEditingCell({
      variantKey: nextKey,
      columnId: nextColumn
    });
    setDraftValue(String(nextValue));
  }

  function undo() {
    const currentVariants = variantsRef.current;
    const last = history[history.length - 1];
    if (!last) return;

    const rowIndex = currentVariants.findIndex(
      (variant, index) => getVariantKey(variant, index) === last.variantKey
    );

    if (rowIndex < 0) {
      setHistory((prev) => prev.slice(0, -1));
      return;
    }

    const newVariants = currentVariants.map((variant, index) =>
      index === rowIndex
        ? {
            ...variant,
            [last.columnId]: last.previousValue
          }
        : variant
    );

    variantsRef.current = newVariants;
    onVariantsChange(newVariants);
    setHistory((prev) => prev.slice(0, -1));
  }

  const columns = React.useMemo<ColumnDef<ProductVariant>[]>(() => {
    const attributeColumns: ColumnDef<ProductVariant>[] = attributes.map((attribute) => ({
      id: `option_${attribute.fieldName}`,
      header: attribute.name,
      size: VARIANT_COLUMN_SIZE.option,
      minSize: VARIANT_COLUMN_SIZE.option,
      maxSize: VARIANT_COLUMN_SIZE.option,
      accessorFn: (row) => row.options[attribute.fieldName],
      cell: ({ getValue }) => (
        <div
          className={cn(
            "min-w-0 px-2 py-1",
            "overflow-hidden",
            "text-sm font-medium",
            "text-ellipsis whitespace-nowrap"
          )}
        >
          {getValue() as string}
        </div>
      )
    }));

    const createEditableColumn = (
      columnId: EditableColumnId,
      header: string,
      size: number,
      inputType: "text" | "number"
    ): ColumnDef<ProductVariant> => ({
      id: columnId,
      header,
      accessorKey: columnId,
      size,
      minSize: size,
      maxSize: size,
      cell: ({ row, getValue }) => {
        const value = getValue() as string | number;
        const key = getVariantKey(row.original, row.index);
        const errorKey = cellKey(key, columnId);
        const isEditing = editingCell?.variantKey === key && editingCell?.columnId === columnId;

        return (
          <EditableVariantCell
            value={value}
            error={errors[errorKey]}
            editing={isEditing}
            draftValue={draftValue}
            inputType={inputType}
            onStartEdit={() => startEdit(row.index, columnId, value)}
            onDraftChange={setDraftValue}
            onCommit={commitEdit}
            onCancel={cancelEdit}
            onMove={moveAfterCommit}
            formatValue={formatCellValue}
          />
        );
      }
    });

    const imageColumn: ColumnDef<ProductVariant> = {
      id: "image",
      header: "Hình ảnh",
      size: VARIANT_COLUMN_SIZE.image,
      minSize: VARIANT_COLUMN_SIZE.image,
      maxSize: VARIANT_COLUMN_SIZE.image,
      cell: ({ row }) => (
        <VariantImageCell
          value={row.original.image}
          onChange={(url) => {
            const newVariants = variantsRef.current.map((variant, index) =>
              index === row.index ? { ...variant, image: url } : variant
            );
            variantsRef.current = newVariants;
            onVariantsChange(newVariants);
          }}
        />
      )
    };

    return [
      ...attributeColumns,
      imageColumn,
      createEditableColumn("sku", "SKU", VARIANT_COLUMN_SIZE.sku, "text"),
      createEditableColumn("price", "Giá bán (VNĐ)", VARIANT_COLUMN_SIZE.price, "number"),
      createEditableColumn(
        "originalPrice",
        "Giá gốc (VNĐ)",
        VARIANT_COLUMN_SIZE.originalPrice,
        "number"
      ),
      createEditableColumn("stock", "Tồn kho", VARIANT_COLUMN_SIZE.stock, "number")
    ];
  }, [attributes, editingCell, draftValue, errors]);

  const table = useReactTable({
    data: variants,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row, index) => getVariantKey(row, index)
  });

  return (
    <div className="w-full min-w-0">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          Click vào ô để chỉnh sửa. Enter: ô cùng cột ở dòng tiếp theo · Tab: ô tiếp theo · Esc:
          hủy.
        </p>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={undo}
          disabled={history.length === 0}
          className="w-fit"
        >
          <Undo2 className="mr-2 h-3.5 w-3.5" />
          Hoàn tác
          {history.length > 0 ? ` (${history.length})` : ""}
        </Button>
      </div>

      <div className="w-full min-w-0 overflow-x-auto rounded-lg border">
        <Table className="min-w-max">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const width = header.column.getSize();
                  return (
                    <TableHead
                      key={header.id}
                      className="font-bold whitespace-nowrap"
                      style={{ width, minWidth: width }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  const width = cell.column.getSize();
                  return (
                    <TableCell
                      key={cell.id}
                      className="whitespace-nowrap"
                      style={{ width, minWidth: width }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
