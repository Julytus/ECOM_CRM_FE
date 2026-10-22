import { expect, test, type Page } from "@playwright/test";

async function setupCheckout(page: Page, authenticated = true, unlinked = false) {
  await page.addInitScript(() => {
    localStorage.setItem(
      "cart-storage",
      JSON.stringify({
        state: { items: [{ productId: 10, variantId: 101, quantity: 1, selected: true }] },
        version: 0
      })
    );
  });

  await page.route("**/api/productVariant/detailByIds?**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        code: 200,
        result: [
          {
            id: 101,
            productId: 10,
            productName: "Áo thun",
            sku: "TS-101",
            image: null,
            price: 100000,
            originalPrice: null,
            stock: 20,
            options: { size: "M", color: "Đen" }
          }
        ]
      })
    })
  );
  await page.route("**/api/loyalty/my/vouchers?**", (route) =>
    unlinked
      ? route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ message: "Not linked" }) })
      : route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            code: 200,
            result: {
              page: 1,
              total: 1,
              items: [{ id: 781, name: "Voucher đổi 500 điểm", code: "LOYALTY-5", status: "AVAILABLE" }]
            }
          })
        })
  );
  await page.route("**/api/user/info", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ code: 200, result: { id: 1, name: "Test customer", email: "test@example.com" } })
    })
  );
  await page.route("**/api/wishlist", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ code: 200, result: [] })
    })
  );
  await page.goto("/checkout");
  if (authenticated) {
    await page.evaluate(() => {
      localStorage.setItem(
        "auth-storage",
        JSON.stringify({ state: { accessToken: "test-token", refreshToken: null, userId: 1 }, version: 0 })
      );
    });
    await page.reload();
  }
  await page.getByLabel("Tên người nhận*").fill("Trần Văn A");
  await page.getByLabel("Số điện thoại người nhận*").fill("0901234567");
  await page.getByLabel("Địa chỉ*").fill("1 Lê Lợi, Quận 1, TP Hồ Chí Minh");
  await page.getByLabel("Họ và tên người mua*").fill("Trần Văn A");
  await page.getByLabel("Số điện thoại người mua*").fill("0901234567");
}

test.describe("Checkout loyalty voucher", () => {
  test("uses the same voucher data for preview and submit and shows both discounts", async ({ page }) => {
    const previewPayloads: Record<string, unknown>[] = [];
    let submittedPayload: Record<string, unknown> | undefined;

    await page.route("**/api/checkout/preview", async (route) => {
      const payload = route.request().postDataJSON() as Record<string, unknown>;
      previewPayloads.push(payload);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          code: 200,
          result: {
            subtotal: 100000,
            discount: payload.voucherCode ? 10000 : 0,
            loyaltyDiscount: payload.customerVoucherId ? 5000 : 0,
            shippingFee: 15000,
            finalAmount: payload.customerVoucherId ? 100000 : 105000
          }
        })
      });
    });
    await page.route("**/api/checkout/submit", async (route) => {
      submittedPayload = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          code: 200,
          result: { orderCode: "ORD-LOYALTY-001", invoiceCode: "INV-LOYALTY-001", finalAmount: 100000, paymentMethod: "COD", paymentStatus: "PENDING" }
        })
      });
    });

    await setupCheckout(page);
    await expect(page.getByLabel("Voucher đổi điểm")).toBeVisible();
    await page.getByLabel("Mã voucher").fill("SAVE10");
    await page.getByLabel("Voucher đổi điểm").click();
    await expect(page.getByRole("option", { name: "Không dùng" })).toBeVisible();
    await page.getByRole("option", { name: "Voucher đổi 500 điểm" }).click();

    await expect(page.getByText("Giảm giá (voucher)").locator("..")).toContainText("10.000");
    await expect(page.getByText("Giảm giá (đổi điểm)").locator("..")).toContainText("5.000");
    await expect(page.getByText("Tổng", { exact: true }).locator("..")).toContainText("100.000");
    await expect.poll(() => previewPayloads.at(-1)).toMatchObject({ voucherCode: "SAVE10", customerVoucherId: 781 });
    await page.getByRole("button", { name: "Xác nhận đặt hàng" }).click();
    await expect(page.getByRole("heading", { name: "Đặt hàng thành công" })).toBeVisible();
    expect(submittedPayload).toMatchObject({ voucherCode: "SAVE10", customerVoucherId: 781 });
    expect(submittedPayload).toMatchObject({
      voucherCode: previewPayloads.at(-1)?.voucherCode,
      customerVoucherId: previewPayloads.at(-1)?.customerVoucherId
    });
  });

  test("hides loyalty voucher selection when the customer is not linked", async ({ page }) => {
    await setupCheckout(page, true, true);
    await expect(page.getByLabel("Voucher đổi điểm")).toHaveCount(0);
    await expect(page.getByLabel("Mã voucher")).toBeVisible();
  });

  test("hides loyalty voucher selection for guests", async ({ page }) => {
    await setupCheckout(page, false);
    await expect(page.getByLabel("Voucher đổi điểm")).toHaveCount(0);
    await expect(page.getByLabel("Mã voucher")).toBeVisible();
  });
});
