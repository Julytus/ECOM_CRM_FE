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
  if (Array.isArray(image)) {
    return image
      .filter((url): url is string => typeof url === "string")
      .map((url) => url.trim())
      .filter(Boolean);
  }

  if (typeof image === "string") {
    const value = image.trim();

    if (!value) return [];

    // Trường hợp chuỗi JSON: ["url1", "url2"]
    try {
      const parsed: unknown = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed
          .filter((url): url is string => typeof url === "string")
          .map((url) => url.trim())
          .filter(Boolean);
      }
    } catch {
      // Không phải JSON, xử lý chuỗi URL bên dưới
    }

    // Trường hợp chuỗi URL phân cách bằng dấu phẩy
    return value
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);
  }

  return [];
}
