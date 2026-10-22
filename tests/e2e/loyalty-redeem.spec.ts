import { expect, test } from "@playwright/test";
import type { Page, Route } from "@playwright/test";

const voucher = {
  id: 17,
  name: "Giảm 50.000đ",
  code: "SAVE50",
  pointsCost: 120,
  endDate: "2026-12-31T23:59:59Z",
  redeemStock: 8,
  redeemedCount: 3,
  affordable: true,
  tierOk: true
};

async function mockLoyalty(page: Page, options: {
  balance?: number;
  redeemable?: typeof voucher[];
  redeem?: (route: Route, updateBalance: (balance: number) => void) => Promise<void>;
} = {}) {
  let balance = options.balance ?? 500;
  const redeemable = options.redeemable ?? [voucher];
  let redeemableReads = 0;
  let accountReads = 0;
  let redeemRequests = 0;

  await page.route("**/api/loyalty/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/loyalty/my")) {
      accountReads += 1;
      await route.fulfill({ json: { code: 200, result: { balance, rankPoints: 200, tierId: 1, tierName: "Bạc" } } });
      return;
    }
    if (url.pathname.endsWith("/loyalty/redeemable")) {
      redeemableReads += 1;
      await route.fulfill({ json: { code: 200, result: redeemable } });
      return;
    }
    if (url.pathname.endsWith("/loyalty/my/vouchers")) {
      const status = url.searchParams.get("status");
      await route.fulfill({
        json: {
          code: 200,
          result: {
            page: Number(url.searchParams.get("page") ?? 1),
            total: 1,
            items: [{ id: 99, voucherId: 17, name: "Ưu đãi của tôi", code: "OWNED50", status, expiresAt: "2026-11-30T00:00:00Z", pointsSpent: 120 }]
          }
        }
      });
      return;
    }
    if (url.pathname.endsWith("/loyalty/redeem")) {
      redeemRequests += 1;
      if (options.redeem) {
        await options.redeem(route, (nextBalance) => { balance = nextBalance; });
      } else {
        balance -= voucher.pointsCost;
        await route.fulfill({ json: { code: 200, result: 0 } });
      }
      return;
    }
    await route.continue();
  });

  return {
    get redeemRequests() { return redeemRequests; },
    get redeemableReads() { return redeemableReads; },
    get accountReads() { return accountReads; }
  };
}

test.describe("Voucher đổi điểm", () => {
  test("đổi thành công, refresh số dư và voucher; bấm đúp chỉ gửi một request", async ({ page }) => {
    let finishRedeem!: () => void;
    const redeemGate = new Promise<void>((resolve) => { finishRedeem = resolve; });
    const requests = await mockLoyalty(page, {
      redeem: async (route, updateBalance) => {
        await redeemGate;
        updateBalance(380);
        await route.fulfill({ json: { code: 200, result: 0 } });
      }
    });

    await page.goto("/loyalty-vouchers");
    await expect(page.getByRole("heading", { name: "Giảm 50.000đ" })).toBeVisible();
    await expect(page.getByText("Lượt còn").locator(".." )).toContainText("5");
    await page.getByRole("button", { name: "Đổi", exact: true }).click();
    await expect(page.getByRole("alertdialog")).toContainText("120 điểm");

    const confirm = page.getByRole("button", { name: "Xác nhận đổi" });
    await confirm.dblclick();
    await expect(page.getByRole("button", { name: "Đang đổi..." })).toBeDisabled();
    expect(requests.redeemRequests).toBe(1);
    finishRedeem();

    await expect(page.getByText("Đổi voucher thành công.")).toBeVisible();
    await expect.poll(() => requests.accountReads).toBeGreaterThan(1);
    await expect.poll(() => requests.redeemableReads).toBeGreaterThan(1);
    await expect(page.getByText("Số dư:").locator(".." )).toContainText("380 điểm");
    await page.getByRole("tab", { name: "Khả dụng" }).click();
    await expect(page.getByText("Ưu đãi của tôi")).toBeVisible();
    await expect(page.getByText("30/11/2026")).toBeVisible();
  });

  test("khóa đổi theo số dư âm, thiếu hạng, rồi thiếu điểm", async ({ page }) => {
    const cases = [
      { balance: -1, voucher: { ...voucher, tierOk: false, affordable: false }, reason: "Số dư điểm đang âm" },
      { balance: 500, voucher: { ...voucher, tierOk: false, affordable: false }, reason: "Chưa đủ hạng" },
      { balance: 500, voucher: { ...voucher, affordable: false }, reason: "Không đủ điểm" }
    ];

    for (const item of cases) {
      await page.unrouteAll();
      await mockLoyalty(page, { balance: item.balance, redeemable: [item.voucher] });
      await page.goto("/loyalty-vouchers");
      const redeem = page.getByRole("button", { name: "Đổi", exact: true });
      await expect(redeem).toBeDisabled();
      await expect(page.getByText(item.reason, { exact: true })).toBeVisible();
      await expect(page.getByText(/Số dư điểm đang âm|Chưa đủ hạng|Không đủ điểm/)).toHaveCount(1);
    }
  });

  test("hiện lỗi hết lượt từ backend và tải lại danh sách đổi điểm", async ({ page }) => {
    const requests = await mockLoyalty(page, {
      redeem: async (route) => route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({ code: 409, message: "Voucher đã hết lượt đổi" })
      })
    });
    await page.goto("/loyalty-vouchers");
    await page.getByRole("button", { name: "Đổi", exact: true }).click();
    await page.getByRole("button", { name: "Xác nhận đổi" }).click();
    await expect(page.getByText("Voucher đã hết lượt đổi").first()).toBeVisible();
    await expect.poll(() => requests.redeemableReads).toBeGreaterThan(1);
    expect(requests.redeemRequests).toBe(1);
  });
});
