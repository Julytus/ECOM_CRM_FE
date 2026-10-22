import { expect, test, type Page } from "@playwright/test";

const vouchers = [
  { id: 1, name: "Voucher 120 điểm", code: "SAVE120", pointsCost: 120, endDate: "2026-12-31T23:59:59Z", minTierId: 2, redeemStock: 8, redeemedCount: 3, affordable: true, tierOk: true },
  { id: 2, name: "Voucher 50 điểm", code: "SAVE50", pointsCost: 50, minTierId: 1, affordable: true, tierOk: true },
  { id: 3, name: "Voucher chưa đủ hạng", code: "TIER2", pointsCost: 80, minTierId: 2, affordable: true, tierOk: false },
  { id: 4, name: "Voucher thiếu điểm", code: "SAVE300", pointsCost: 300, minTierId: 1, affordable: false, tierOk: true }
];

async function authenticate(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("auth-storage", JSON.stringify({ state: { accessToken: "mock-token", refreshToken: null, userId: 1 }, version: 0 }));
  });
  await page.route("**/api/user/info", async (route) => {
    await route.fulfill({ json: { code: 200, result: { id: 1, name: "Test User", email: "test@example.test" } } });
  });
}

async function mockCatalog(page: Page, options: { balance?: number; catalog?: typeof vouchers; unlinked?: boolean } = {}) {
  let balance = options.balance ?? 200;
  let redeemableReads = 0;
  let redeemRequests = 0;
  await page.route("**/api/loyalty/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/loyalty/my")) {
      await route.fulfill(options.unlinked
        ? { status: 404, json: { code: 404, message: "Customer not linked" } }
        : { json: { code: 200, result: { balance, tierId: 1, tierName: "Bạc" } } });
    } else if (path.endsWith("/loyalty/redeemable")) {
      redeemableReads += 1;
      await route.fulfill({ json: { code: 200, result: options.catalog ?? vouchers } });
    } else if (path.endsWith("/loyalty/tier/list")) {
      await route.fulfill({ json: { code: 200, result: [{ id: 1, name: "Bạc" }, { id: 2, name: "Vàng" }] } });
    } else if (path.endsWith("/loyalty/redeem")) {
      redeemRequests += 1;
      const body = route.request().postDataJSON() as { voucherId: number };
      const voucher = (options.catalog ?? vouchers).find((item) => item.id === body.voucherId);
      balance -= voucher?.pointsCost ?? 0;
      await route.fulfill({ json: { code: 200, result: 0 } });
    } else {
      await route.continue();
    }
  });
  return {
    get balance() { return balance; },
    get redeemableReads() { return redeemableReads; },
    get redeemRequests() { return redeemRequests; }
  };
}

test.describe("Danh mục ưu đãi đổi điểm", () => {
  test("khách vãng lai nhận 401 thấy hướng dẫn đăng nhập, không hiện toast lỗi", async ({ page }) => {
    await page.route("**/api/loyalty/redeemable", async (route) => {
      await route.fulfill({ status: 401, json: { code: 401, message: "Chưa đăng nhập" } });
    });
    await page.route("**/api/loyalty/tier/list", async (route) => {
      await route.fulfill({ json: { code: 200, result: [] } });
    });

    await page.goto("/vouchers");

    await expect(page.getByText("Đăng nhập để xem ưu đãi đổi điểm", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Đăng nhập" })).toHaveAttribute("href", "/login");
    await expect(page.locator("[data-sonner-toast]")).toHaveCount(0);
  });

  test("khách vãng lai vẫn xem được danh sách công khai và được mời đăng nhập để đổi", async ({ page }) => {
    await mockCatalog(page, { catalog: [vouchers[0]] });

    await page.goto("/vouchers");

    await expect(page.getByRole("heading", { name: "Voucher 120 điểm" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Đăng nhập để đổi" })).toHaveAttribute("href", "/login");
    await expect(page.getByRole("button", { name: "Đổi", exact: true })).toHaveCount(0);
  });

  test("hiển thị điểm, hạng, số lượt và ưu tiên voucher đổi được", async ({ page }) => {
    await authenticate(page);
    await mockCatalog(page);

    await page.goto("/vouchers");

    await expect(page.getByText("200 điểm")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Voucher 50 điểm" })).toBeVisible();
    await expect(page.getByText("Yêu cầu hạng").first()).toBeVisible();
    await expect(page.getByText("Vàng", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Lượt còn").locator(".." )).toContainText("5");
    await expect(page.locator("article h3").first()).toHaveText("Voucher 50 điểm");
    await expect(page.locator("article h3").nth(1)).toHaveText("Voucher 120 điểm");
  });

  test("hiển thị trạng thái thiếu điểm và thiếu hạng", async ({ page }) => {
    await authenticate(page);
    await mockCatalog(page, { balance: 100 });

    await page.goto("/vouchers");

    await expect(page.getByText("Thiếu 200 điểm", { exact: true })).toBeVisible();
    await expect(page.getByText("Chưa đủ hạng", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Đổi", exact: true }).nth(2)).toBeDisabled();
  });

  test("danh sách rỗng có thông báo riêng", async ({ page }) => {
    await authenticate(page);
    await mockCatalog(page, { catalog: [] });

    await page.goto("/vouchers");

    await expect(page.getByText("Hiện chưa có voucher đổi điểm", { exact: true })).toBeVisible();
  });

  test("tài khoản chưa liên kết vẫn xem catalog nhưng không thể đổi", async ({ page }) => {
    await authenticate(page);
    await mockCatalog(page, { unlinked: true });

    await page.goto("/vouchers");

    await expect(page.getByRole("heading", { name: "Voucher 50 điểm" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Đổi", exact: true }).first()).toBeDisabled();
    await expect(page.getByText("Tài khoản chưa liên kết, liên hệ cửa hàng").first()).toBeVisible();
  });

  test("đổi voucher tại trang danh mục cập nhật số dư và danh sách", async ({ page }) => {
    await authenticate(page);
    const requests = await mockCatalog(page, { balance: 200, catalog: [vouchers[0]] });

    await page.goto("/vouchers");
    await page.getByRole("button", { name: "Đổi", exact: true }).click();
    await page.getByRole("button", { name: "Xác nhận đổi" }).click();

    await expect(page.getByText("Đổi voucher thành công.")).toBeVisible();
    await expect(page.getByText("80 điểm")).toBeVisible();
    await expect.poll(() => requests.redeemableReads).toBeGreaterThan(1);
    expect(requests.redeemRequests).toBe(1);
  });
});
