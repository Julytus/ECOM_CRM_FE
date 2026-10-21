import { expect, test } from "@playwright/test";

test.describe("Storefront checkout", () => {
  test("submits COD with server totals and removes selected cart items", async ({ page }) => {
    let submittedPayload: Record<string, unknown> | undefined;

    await page.addInitScript(() => {
      localStorage.setItem(
        "cart-storage",
        JSON.stringify({
          state: { items: [{ productId: 10, variantId: 101, quantity: 2, selected: true }] },
          version: 0
        })
      );
    });

    await page.route("**/api/productVariant/detailByIds?**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          code: 200,
          result: [{ id: 101, productId: 10, productName: "Áo thun", sku: "TS-101", image: null, price: 100000, originalPrice: null, stock: 20, options: { size: "M", color: "Đen" } }]
        })
      });
    });

    await page.route("**/api/checkout/preview", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ code: 200, result: { subtotal: 200000, discount: 10000, shippingFee: 15000, finalAmount: 205000 } })
      });
    });

    await page.route("**/api/checkout/submit", async (route) => {
      submittedPayload = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          code: 200,
          result: { orderCode: "ORD-2026-001", invoiceCode: "INV-2026-001", finalAmount: 205000, paymentMethod: "COD", paymentStatus: "PENDING" }
        })
      });
    });

    await page.goto("/checkout");
    await page.getByLabel("Tên người nhận*").fill("Trần Văn A");
    await page.getByLabel("Số điện thoại người nhận*").fill("0901234567");
    await page.getByLabel("Địa chỉ*").fill("1 Lê Lợi, Quận 1, TP Hồ Chí Minh");
    await page.getByLabel("Họ và tên người mua*").fill("Trần Văn A");
    await page.getByLabel("Số điện thoại người mua*").fill("0901234567");
    await expect(page.getByText("205.000₫")).toBeVisible();
    await page.getByRole("button", { name: "Xác nhận đặt hàng" }).click();

    await expect(page.getByRole("heading", { name: "Đặt hàng thành công" })).toBeVisible();
    await expect(page.getByText("ORD-2026-001")).toBeVisible();
    await expect(page.getByText("INV-2026-001")).toBeVisible();
    await expect(page.getByText("205.000₫")).toBeVisible();
    await expect(page.getByText("Thanh toán khi nhận hàng", { exact: true })).toBeVisible();
    expect(submittedPayload).toMatchObject({
      paymentMethod: "COD",
      items: [{ productVariantId: 101, quantity: 2 }]
    });
    expect(submittedPayload).not.toHaveProperty("totalAmount");
    expect(submittedPayload).not.toHaveProperty("finalAmount");
    expect(submittedPayload).not.toHaveProperty("shippingFee");

    const cartState = await page.evaluate(() => JSON.parse(localStorage.getItem("cart-storage") ?? "{}"));
    expect(cartState.state.items).toEqual([]);
  });
});
