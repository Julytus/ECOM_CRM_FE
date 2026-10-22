// Seed demo loyalty tiers and point redemption vouchers.
// Usage: node scripts/seed-loyalty.mjs [--apply]
// Configure SEED_ADMIN_IDENTIFIER, SEED_ADMIN_PASSWORD and optionally SEED_API_URL.

import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const apply = process.argv.includes("--apply");

const tiers = [
  { name: "Đồng", minRankPoints: 0, earnMultiplier: 1, status: 1 },
  { name: "Bạc", minRankPoints: 1_000, earnMultiplier: 1.2, status: 1 },
  { name: "Vàng", minRankPoints: 5_000, earnMultiplier: 1.5, status: 1 },
  { name: "Kim cương", minRankPoints: 20_000, earnMultiplier: 2, status: 1 }
];

const today = new Date();
const startDate = new Date(today);
startDate.setHours(0, 0, 0, 0);
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString();
};

const voucherDefinitions = [
  { code: "LOY-POINT-20K", name: "Đổi điểm giảm 20.000đ", description: "Giảm 20.000đ khi đổi 100 điểm.", discountType: 1, discountValue: 20_000, pointsCost: 100, minTier: "Đồng" },
  { code: "LOY-POINT-50K", name: "Đổi điểm giảm 50.000đ", description: "Giảm 50.000đ khi đổi 250 điểm.", discountType: 1, discountValue: 50_000, pointsCost: 250, minTier: "Đồng" },
  { code: "LOY-POINT-10PCT", name: "Đổi điểm giảm 10%", description: "Giảm 10%, tối đa 100.000đ; đổi 500 điểm.", discountType: 2, discountValue: 10, maxDiscount: 100_000, pointsCost: 500, minTier: "Bạc" },
  { code: "LOY-POINT-15PCT", name: "Đổi điểm giảm 15%", description: "Giảm 15%, tối đa 200.000đ; đổi 1.200 điểm.", discountType: 2, discountValue: 15, maxDiscount: 200_000, pointsCost: 1_200, minTier: "Vàng" },
  { code: "LOY-POINT-VIP", name: "Đổi điểm VIP giảm 300.000đ", description: "Giảm 300.000đ khi đổi 3.000 điểm.", discountType: 1, discountValue: 300_000, pointsCost: 3_000, minTier: "Kim cương" },
  { code: "LOY-POINT-LIMITED", name: "Đổi điểm ưu đãi giới hạn", description: "Giảm 50.000đ; chỉ có 3 lượt đổi.", discountType: 1, discountValue: 50_000, pointsCost: 300, minTier: "Đồng", redeemStock: 3 },
  { code: "LOY-POINT-SOON", name: "Đổi điểm ưu đãi sắp hết hạn", description: "Giảm 20.000đ; voucher hết hạn sau 3 ngày.", discountType: 1, discountValue: 20_000, pointsCost: 120, minTier: "Đồng", expiresInDays: 3 }
];

const vouchers = voucherDefinitions.map(({ minTier, expiresInDays = 30, ...voucher }) => ({
  ...voucher,
  minTier,
  startDate: startDate.toISOString(),
  endDate: addDays(today, expiresInDays),
  totalQuantity: 100,
  redeemStock: voucher.redeemStock ?? 100,
  perUserLimit: 1,
  status: 1
}));

async function readViteApiUrl() {
  let value;
  for (const name of [".env", ".env.local", ".env.development", ".env.development.local"]) {
    try {
      const contents = await readFile(resolve(root, name), "utf8");
      const match = contents.match(/^\s*VITE_API_URL\s*=\s*(.*?)\s*$/m);
      if (match) value = match[1].replace(/^(?:"(.*)"|'(.*)')$/, (_, doubleQuoted, singleQuoted) => doubleQuoted ?? singleQuoted);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  return value;
}

function responseMessage(body, status) {
  return body?.message || `HTTP ${status}`;
}

async function request(baseUrl, path, { token, ...options } = {}) {
  const headers = { Accept: "application/json", ...options.headers };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  const url = `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  const response = await fetch(url, { ...options, headers });
  let body;
  try {
    body = await response.json();
  } catch {
    body = undefined;
  }
  if (!response.ok) {
    const error = new Error(responseMessage(body, response.status));
    error.status = response.status;
    throw error;
  }
  if (body?.code !== undefined && body.code !== 200) {
    throw new Error(responseMessage(body, response.status));
  }
  return body?.result;
}

async function authenticate(baseUrl) {
  const identifier = process.env.SEED_ADMIN_IDENTIFIER;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!identifier || !password) return undefined;
  const loginField = identifier.includes("@") ? "email" : "phone";
  const result = await request(baseUrl, "/user/authenticate", {
    method: "POST",
    body: JSON.stringify({ [loginField]: identifier, plainPassword: password })
  });
  if (!result?.token) throw new Error("Login response did not include an access token.");
  return result.token;
}

function report(label, status, detail = "") {
  console.log(`${status}: ${label}${detail ? ` — ${detail}` : ""}`);
}

const apiUrl = process.env.SEED_API_URL || process.env.VITE_API_URL || await readViteApiUrl() || "http://localhost:9100/api";
console.log(`Loyalty seed (${apply ? "APPLY" : "DRY-RUN"}) → ${apiUrl}`);
console.log("Freeship voucher omitted: backend does not support a freeship discount type.");

let token;
let currentTiers;
let tierLookupError;
let apiAvailable = true;
if (process.env.SEED_ADMIN_IDENTIFIER && process.env.SEED_ADMIN_PASSWORD) {
  try {
    token = await authenticate(apiUrl);
    currentTiers = await request(apiUrl, "/loyalty/tier/list", { token }) ?? [];
    for (const tier of tiers) {
      const existing = currentTiers.find((item) => item.name === tier.name);
      if (existing) report(`tier ${tier.name}`, "SKIP", `đã tồn tại${existing.id == null ? "" : ` (id=${existing.id})`}`);
    }
  } catch (error) {
    tierLookupError = error.message;
    apiAvailable = false;
    report("tier lookup", "ERROR", error.message);
  }
} else {
  tierLookupError = "chưa đăng nhập, không tra được hiện trạng";
  report("tier lookup", "UNAVAILABLE", tierLookupError);
}

if (!token || !apiAvailable) {
  for (const voucher of vouchers) {
    report(`voucher ${voucher.code}`, apply ? "ERROR" : "WOULD CREATE", `${voucher.pointsCost} points; tier ${voucher.minTier} ID ${tierLookupError ? "chưa tra được" : "chưa có"}`);
  }
  if (apply) {
    console.error("Apply requires a running API and valid admin credentials; no changes were written.");
    process.exitCode = 1;
  }
} else {
  const tierIds = new Map(currentTiers.filter((item) => item.id != null).map((item) => [item.name, item.id]));
  const failedTiers = new Set();
  for (const tier of tiers) {
    if (tierIds.has(tier.name)) continue;
    if (!apply) {
      report(`tier ${tier.name}`, "WOULD CREATE", `${tier.minRankPoints} points ×${tier.earnMultiplier}`);
      continue;
    }
    try {
      const created = await request(apiUrl, "/loyalty/tier/save", { token, method: "POST", body: JSON.stringify(tier) });
      if (created?.id == null) throw new Error("API response did not include the new tier ID.");
      tierIds.set(tier.name, created.id);
      report(`tier ${tier.name}`, "CREATED", `id=${created.id}`);
    } catch (error) {
      failedTiers.add(tier.name);
      report(`tier ${tier.name}`, "ERROR", error.message);
      process.exitCode = 1;
    }
  }

  for (const voucher of vouchers) {
    try {
      const query = new URLSearchParams({ code: voucher.code });
      let existing;
      try {
        existing = await request(apiUrl, `/voucher/getByCode?${query}`, { token });
      } catch (error) {
        if (error.status !== 404) throw error;
      }
      if (existing) {
        report(`voucher ${voucher.code}`, "SKIP", `đã tồn tại${existing.id == null ? "" : ` (id=${existing.id})`}`);
        continue;
      }
      if (failedTiers.has(voucher.minTier)) throw new Error(`tier ${voucher.minTier} tạo thất bại, không có ID để gán.`);
      const minTierId = tierIds.get(voucher.minTier);
      if (minTierId == null) throw new Error(`không tra được ID của tier ${voucher.minTier}.`);
      const payload = { ...voucher, minTierId };
      delete payload.minTier;
      if (!apply) {
        report(`voucher ${voucher.code}`, "WOULD CREATE", `${voucher.pointsCost} points; minTierId=${minTierId}; discountType=${voucher.discountType}; expires ${payload.endDate.slice(0, 10)}`);
        continue;
      }
      await request(apiUrl, "/voucher/update", { token, method: "POST", body: JSON.stringify(payload) });
      report(`voucher ${voucher.code}`, "CREATED");
    } catch (error) {
      report(`voucher ${voucher.code}`, "ERROR", error.message);
      process.exitCode = 1;
    }
  }
}
