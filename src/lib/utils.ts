import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type VariantEditableColumn = "sku" | "price" | "originalPrice" | "stock";

/**
 * Validate số >= 0
 */
export function validateNonNegativeNumber(raw: string): string | null {
  const value = raw.trim();

  if (value === "") {
    return "Nhập số";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return "Nhập số";
  }

  if (number < 0) {
    return "Phải >= 0";
  }

  return null;
}

/**
 * Validate số nguyên >= 0
 */
export function validateNonNegativeInteger(raw: string): string | null {
  const value = raw.trim();

  if (value === "") {
    return "Nhập số nguyên";
  }

  const number = Number(value);

  if (Number.isNaN(number) || !Number.isInteger(number)) {
    return "Nhập số nguyên";
  }

  if (number < 0) {
    return "Phải >= 0";
  }

  return null;
}

/**
 * Validate SKU
 */
export function validateSku(raw: string): string | null {
  return raw.trim().length > 0 ? null : "SKU bắt buộc";
}

/**
 * Validate field của Product Variant
 */
export function validateVariantField(columnId: VariantEditableColumn, raw: string): string | null {
  switch (columnId) {
    case "sku":
      return validateSku(raw);

    case "price":
    case "originalPrice":
      return validateNonNegativeNumber(raw);

    case "stock":
      return validateNonNegativeInteger(raw);

    default:
      return null;
  }
}
