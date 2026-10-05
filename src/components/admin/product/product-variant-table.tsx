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

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

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

interface ProductVariantTableProps {
  variants: ProductVariant[];
  attributes: Array<{
    name: string;
    fieldName: string;
  }>;
  onVariantsChange: (variants: ProductVariant[]) => void;
}

type EditableColumnId = "sku" | "price" | "originalPrice" | "stock";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const VARIANT_COLUMN_SIZE = {
  option: 90,
  image: 90,
  sku: 220,
  price: 170,
  originalPrice: 170,
  stock: 120
} as const;

/* -------------------------------------------------------------------------- */
/* Utils                                                                      */
/* -------------------------------------------------------------------------- */

function cellKey(rowIndex: number, columnId: string) {
  return `${rowIndex}:${columnId}`;
}

function formatCellValue(value: string | number) {
  if (typeof value === "number") {
    return value.toLocaleString("vi-VN");
  }

  return value;
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function ProductVariantTable({
  variants,
  attributes,
  onVariantsChange
}: ProductVariantTableProps) {
  /* ------------------------------------------------------------------------ */
  /* State                                                                    */
  /* ------------------------------------------------------------------------ */

  const [editingCell, setEditingCell] = React.useState<{
    rowIndex: number;
    columnId: EditableColumnId;
  } | null>(null);

  const [draftValue, setDraftValue] = React.useState("");

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const [history, setHistory] = React.useState<HistoryEntry[]>([]);

  const errorTimers = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  /* ------------------------------------------------------------------------ */
  /* Edit                                                                     */
  /* ------------------------------------------------------------------------ */

  function startEdit(rowIndex: number, columnId: EditableColumnId, currentValue: string | number) {
    setEditingCell({
      rowIndex,
      columnId
    });

    setDraftValue(String(currentValue));
  }

  function cancelEdit() {
    setEditingCell(null);
    setDraftValue("");
  }

  /* ------------------------------------------------------------------------ */
  /* Error                                                                    */
  /* ------------------------------------------------------------------------ */

  function flashError(key: string, message: string) {
    setErrors((prev) => ({
      ...prev,
      [key]: message
    }));

    clearTimeout(errorTimers.current[key]);

    errorTimers.current[key] = setTimeout(() => {
      setErrors((prev) => {
        const next = {
          ...prev
        };

        delete next[key];

        return next;
      });
    }, 2000);
  }

  /* ------------------------------------------------------------------------ */
  /* Validation                                                               */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /* Commit                                                                   */
  /* ------------------------------------------------------------------------ */

  function commitEdit(columnId: EditableColumnId) {
    if (!editingCell) {
      return;
    }

    const { rowIndex } = editingCell;

    const key = cellKey(rowIndex, columnId);

    const error = validate(columnId, draftValue);

    if (error) {
      flashError(key, error);
      return;
    }

    const parsedValue =
      columnId === "price" || columnId === "originalPrice" || columnId === "stock"
        ? Number(draftValue)
        : draftValue;

    const previousValue = variants[rowIndex][columnId] as string | number;

    setEditingCell(null);
    setDraftValue("");

    if (previousValue === parsedValue) {
      return;
    }

    const newVariants = [...variants];

    newVariants[rowIndex] = {
      ...newVariants[rowIndex],
      [columnId]: parsedValue
    };

    onVariantsChange(newVariants);

    setHistory((prev) => [
      ...prev,
      {
        rowIndex,
        columnId,
        previousValue
      }
    ]);
  }

  /* ------------------------------------------------------------------------ */
  /* Undo                                                                     */
  /* ------------------------------------------------------------------------ */

  function undo() {
    setHistory((prev) => {
      if (prev.length === 0) {
        return prev;
      }

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

  /* ------------------------------------------------------------------------ */
  /* Columns                                                                  */
  /* ------------------------------------------------------------------------ */

  const columns = React.useMemo<ColumnDef<ProductVariant>[]>(() => {
    /* ---------------------------------------------------------------------- */
    /* Dynamic attributes                                                     */
    /* ---------------------------------------------------------------------- */

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

    /* ---------------------------------------------------------------------- */
    /* Common editable column factory                                         */
    /* ---------------------------------------------------------------------- */

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

        const key = cellKey(row.index, columnId);

        const isEditing = editingCell?.rowIndex === row.index && editingCell?.columnId === columnId;

        return (
          <EditableVariantCell
            value={value}
            error={errors[key]}
            editing={isEditing}
            draftValue={draftValue}
            inputType={inputType}
            onStartEdit={() => startEdit(row.index, columnId, value)}
            onDraftChange={setDraftValue}
            onCommit={() => commitEdit(columnId)}
            onCancel={cancelEdit}
            formatValue={formatCellValue}
          />
        );
      }
    });

    /* ---------------------------------------------------------------------- */
    /* Image                                                                   */
    /* ---------------------------------------------------------------------- */

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
            const newVariants = [...variants];

            newVariants[row.index] = {
              ...newVariants[row.index],
              image: url
            };

            onVariantsChange(newVariants);
          }}
        />
      )
    };

    /* ---------------------------------------------------------------------- */
    /* Editable columns                                                        */
    /* ---------------------------------------------------------------------- */

    const editableColumns: ColumnDef<ProductVariant>[] = [
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

    return [...attributeColumns, ...editableColumns];
  }, [attributes, variants, editingCell, draftValue, errors]);

  /* ------------------------------------------------------------------------ */
  /* TanStack Table                                                           */
  /* ------------------------------------------------------------------------ */

  const table = useReactTable({
    data: variants,

    columns,

    getCoreRowModel: getCoreRowModel(),

    getRowId: (row, index) => `${index}-${row.sku}`
  });

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="w-full min-w-0">
      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          Click vào ô để chỉnh sửa. Enter để lưu, Esc để hủy.
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

      {/* Responsive table */}
      <div className="w-full min-w-0 overflow-x-auto rounded-lg border">
        <Table className="min-w-max">
          {/* Header */}
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const width = header.column.getSize();

                  return (
                    <TableHead
                      key={header.id}
                      className="font-bold whitespace-nowrap"
                      style={{
                        width,
                        minWidth: width
                      }}
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

          {/* Body */}
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  const width = cell.column.getSize();

                  return (
                    <TableCell
                      key={cell.id}
                      className="whitespace-nowrap"
                      style={{
                        width,
                        minWidth: width
                      }}
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
