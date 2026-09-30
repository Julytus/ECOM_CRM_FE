export function formatVnd(value: number | string): string {
  const number = typeof value === "string" ? Number(value) : value;

  if (Number.isNaN(number)) return "0 ₫";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(number);
}

export function normalizeImages(image: unknown): string[] {
  if (Array.isArray(image)) return image;

  if (typeof image === "string") {
    try {
      const parsed = JSON.parse(image);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}
