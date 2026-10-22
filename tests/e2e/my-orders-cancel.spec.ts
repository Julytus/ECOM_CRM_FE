import { expect, test } from "@playwright/test";

const order = {
  id: 731,
  code: "ORD-MY-731",
  status: "NEW",
  paymentStatus: "UNPAID",
  paymentMethod: "COD",
  createdAt: "2026-10-20T09:30:00Z",
  totalAmount: 250000,
  finalAmount: 250000,
  items: []
};

async function prepareOrdersPage(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      "auth-storage",
      JSON.stringify({ state: { accessToken: "e2e-token", refreshToken: "e2e-refresh", userId: 1 }, version: 0 })
    );
  });

  await page.route("**/api/user/info", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ code: 200, result: { id: 1, name: "Người mua", email: "buyer@example.test" } })
    })
  );
  await page.route("**/api/order/my?**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ code: 200, result: { items: [order], page: 1, total: 1 } })
    })
  );
  await page.route("**/api/order/my/731", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ code: 200, result: order })
    })
  );
  await page.goto("/orders");
  await page.getByRole("button", { name: "Đơn hàng ORD-MY-731" }).click();
}

test.describe("my-orders cancellation", () => {
  test("confirms cancellation and shows the API success message", async ({ page }) => {
    let cancelCalls = 0;
    await page.route("**/api/order/my/731/cancel", (route) => {
      cancelCalls += 1;
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ code: 200, result: "Order cancelled" })
      });
    });

    await prepareOrdersPage(page);
    await expect(page.getByRole("button", { name: "Hủy đơn hàng" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Thanh toán lại" })).toHaveCount(0);
    await page.getByRole("button", { name: "Hủy đơn hàng" }).click();
    await expect(page.getByRole("alertdialog")).toBeVisible();
    await page.getByRole("button", { name: "Xác nhận hủy" }).click();

    await expect(page.getByText("Đã hủy đơn hàng thành công.")).toBeVisible();
    await expect(page.getByRole("alertdialog")).toHaveCount(0);
    expect(cancelCalls).toBe(1);
  });

  test("shows the backend Vietnamese error when cancellation is rejected", async ({ page }) => {
    await page.route("**/api/order/my/731/cancel", (route) =>
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ code: 400, message: "Không thể hủy đơn hàng này." })
      })
    );

    await prepareOrdersPage(page);
    await page.getByRole("button", { name: "Hủy đơn hàng" }).click();
    await page.getByRole("button", { name: "Xác nhận hủy" }).click();

    await expect(page.getByText("Không thể hủy đơn hàng này.")).toBeVisible();
  });
});
