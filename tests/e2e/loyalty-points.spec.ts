import { expect, test } from "@playwright/test";

test.describe("Storefront loyalty points", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "auth-storage",
        JSON.stringify({ state: { accessToken: "mock-token", refreshToken: null, userId: 1 }, version: 0 })
      );
    });
    await page.route("**/api/user/info", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ code: 200, result: { name: "Nguyễn An", email: "an@example.test" } })
      });
    });
  });

  test("shows points, tier progress, and transaction history", async ({ page }) => {
    await page.route("**/api/loyalty/my", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ code: 200, result: { balance: 1250, tierName: "Bạc", rankPoints: 60, nextTierId: 2, nextTierName: "Vàng", nextTierMinRankPoints: 100, pointsToNextTier: 40 } })
      });
    });
    await page.route("**/api/loyalty/my/transactions?**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ code: 200, result: { page: 1, total: 1, items: [{ id: 1, type: "EARN", points: 250, balanceAfter: 1250, note: "Đơn hàng ORD-1", createdAt: "2026-10-22T09:00:00Z" }] } })
      });
    });

    await page.goto("/loyalty");

    await expect(page.getByRole("heading", { name: "Điểm của tôi" })).toBeVisible();
    await expect(page.getByText("1.250", { exact: true })).toBeVisible();
    await expect(page.getByText("Bạc", { exact: true })).toBeVisible();
    await expect(page.getByText("Còn 40 điểm")).toBeVisible();
    await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "60");
    await expect(page.getByText("Đơn hàng ORD-1")).toBeVisible();
    await expect(page.getByText("+250 điểm")).toBeVisible();
  });

  test("marks a negative balance and transaction in red with a neutral note", async ({ page }) => {
    await page.route("**/api/loyalty/my", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ code: 200, result: { balance: -20, tierName: "Đồng", rankPoints: 10 } }) });
    });
    await page.route("**/api/loyalty/my/transactions?**", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ code: 200, result: { page: 1, total: 1, items: [{ id: 2, type: "REDEEM", points: 20, balanceAfter: -20 }] } }) });
    });

    await page.goto("/loyalty");

    await expect(page.getByText("-20", { exact: true })).toHaveClass(/text-destructive/);
    await expect(page.getByText("Số dư đang âm").first()).toBeVisible();
    await expect(page.getByText("Số dư sau giao dịch: -20")).toHaveClass(/text-destructive/);
  });

  test("shows a dedicated state when the account is not linked", async ({ page }) => {
    await page.route("**/api/loyalty/my", async (route) => {
      await route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ code: 404, message: "Customer not linked" }) });
    });

    await page.goto("/loyalty");

    await expect(page.getByRole("heading", { name: "Tài khoản chưa liên kết, liên hệ cửa hàng" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Lịch sử điểm" })).toHaveCount(0);
    await expect(page.getByText("Customer not linked")).toHaveCount(0);
  });

  test("shows the highest-tier state without a progress bar", async ({ page }) => {
    await page.route("**/api/loyalty/my", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ code: 200, result: { balance: 0, tierName: "Kim cương", rankPoints: 999 } }) });
    });
    await page.route("**/api/loyalty/my/transactions?**", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ code: 200, result: { page: 1, total: 0, items: [] } }) });
    });

    await page.goto("/loyalty");

    await expect(page.getByText("Hạng cao nhất")).toBeVisible();
    await expect(page.getByRole("progressbar")).toHaveCount(0);
  });
});
