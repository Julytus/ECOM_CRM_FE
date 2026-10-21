"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface TableSearchFilterField {
  key: string;
  label: string;
  placeholder?: string;
}

export interface TableSearchFilterProps {
  fields: TableSearchFilterField[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}

export function TableSearchFilter({ fields, values, onChange }: TableSearchFilterProps) {
  const [draftValues, setDraftValues] = React.useState(values);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEmittedValuesRef = React.useRef(values);

  React.useEffect(() => {
    lastEmittedValuesRef.current = values;
    setDraftValues(values);
  }, [values]);

  React.useEffect(() => {
    if (JSON.stringify(draftValues) === JSON.stringify(lastEmittedValuesRef.current)) return;
    timeoutRef.current = setTimeout(() => onChange(draftValues), 400);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [draftValues, onChange]);

  const clearFilters = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const clearedValues = Object.fromEntries(fields.map(({ key }) => [key, ""]));
    lastEmittedValuesRef.current = clearedValues;
    setDraftValues(clearedValues);
    onChange(clearedValues);
  };

  return (
    <div className="bg-card flex flex-wrap items-end gap-3 rounded-lg border p-4">
      {fields.map((field) => (
        <div key={field.key} className="grid w-full max-w-sm gap-2">
          <label htmlFor={`table-filter-${field.key}`} className="text-sm font-medium">
            {field.label}
          </label>
          <Input
            id={`table-filter-${field.key}`}
            value={draftValues[field.key] ?? ""}
            placeholder={field.placeholder}
            onChange={(event) =>
              setDraftValues((current) => ({ ...current, [field.key]: event.target.value }))
            }
          />
        </div>
      ))}
      <Button type="button" variant="outline" onClick={clearFilters}>
        Xóa lọc
      </Button>
    </div>
  );
}
