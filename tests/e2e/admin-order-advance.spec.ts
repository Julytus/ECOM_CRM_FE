import { expect, test, type Page } from "@playwright/test";
import { hasSeededUser, loginAsSeededUser } from "./support/auth";

const orderId = 41;
const orderListItem = {
  id: orderId,
  code: "ORD-TEST-41",
  totalAmount: 125000,
  finalAmount: 125000,
  status: "NEW",
  paymentStatus: "UNPAID",
  paymentMethod: "COD",
  createdAt: "2026-10-22T08:00:00Z",
  items: []
};

async function openMockedOrderPage(page: Page, failAdvance = false) {
  let status = "NEW";
  await loginAsSeededUser(page);
  await page.route("**/order/list**", (route) =>
    route.fulfill({
      json: { code: 200, result: { items: [{ ...orderListItem, status }], page: 1, total: 1 } }
    })
  );
  await page.route(`**/order/detail/${orderId}`, (route) =>
    route.fulfill({
      json: {
        code: 200,
        result: {
          ...orderListItem,
          status,
          invoiceId: 77,
          invoiceCode: "INV-TEST-77",
          updatedAt: "2026-10-22T09:00:00Z"
        }
      }
    })
  );
  await page.route(`**/order/${orderId}/advance**`, async (route) => {
    if (failAdvance) {
      await route.fulfill({
        status: 400,
        json: { code: 400, message: "Order cannot be advanced right now." }
      });
      return;
    }
    status = new URL(route.request().url()).searchParams.get("to") ?? status;
    await route.fulfill({ json: { code: 200, message: "OK", result: status } });
  });

  await page.goto("/crm/order");
  await page.getByRole("button", { name: "Open menu" }).first().click();
  await page.getByRole("menuitem", { name: "Xem chi tiết" }).click();
}

test.describe("Admin order advance", () => {
  test("advances COD orders through each next status", async ({ page }) => {
    test.skip(!hasSeededUser, "Set E2E_USER_IDENTIFIER / E2E_USER_PASSWORD to run this test");

    await openMockedOrderPage(page);
    for (const [buttonName, nextButtonName] of [
      ["Xác nhận đơn", "Giao hàng"],
      ["Giao hàng", "Hoàn tất đơn hàng"]
    ]) {
      await page.getByRole("button", { name: buttonName }).click();
      await expect(page.getByRole("button", { name: nextButtonName })).toBeVisible();
    }
    await page.getByRole("button", { name: "Hoàn tất đơn hàng" }).click();
    await expect(page.getByText("Hoàn tất sẽ ghi nhận đã thu tiền.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Hoàn tất đơn hàng" })).toHaveCount(0);
  });

  test("shows the backend message when advance returns 400", async ({ page }) => {
    test.skip(!hasSeededUser, "Set E2E_USER_IDENTIFIER / E2E_USER_PASSWORD to run this test");

    await openMockedOrderPage(page, true);
    await page.getByRole("button", { name: "Xác nhận đơn" }).click();
    await expect(page.getByText("Order cannot be advanced right now.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Xác nhận đơn" })).toBeVisible();
  });
});
