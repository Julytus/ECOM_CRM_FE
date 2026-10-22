import { expect, test, type Page } from "@playwright/test";

async function mockCheckoutForm(page: Page) {
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
  await page.route("**/api/checkout/preview", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        code: 200,
        result: { subtotal: 100000, discount: 0, shippingFee: 0, finalAmount: 100000 }
      })
    })
  );
  await page.goto("/checkout");
  await page.getByLabel("Tên người nhận*").fill("Trần Văn A");
  await page.getByLabel("Số điện thoại người nhận*").fill("0901234567");
  await page.getByLabel("Địa chỉ*").fill("1 Lê Lợi, Quận 1, TP Hồ Chí Minh");
  await page.getByLabel("Họ và tên người mua*").fill("Trần Văn A");
  await page.getByLabel("Số điện thoại người mua*").fill("0901234567");
  await page.getByText("Thanh toán trực tuyến", { exact: true }).click();
}

test.describe("PayOS checkout", () => {
  test("polls pending payment until the backend confirms paid", async ({ page }) => {
    let statusCalls = 0;
    await mockCheckoutForm(page);
    await page.route("**/api/checkout/submit", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          code: 200,
          result: {
            orderCode: "ORD-PAY-001",
            invoiceCode: "INV-PAY-001",
            invoiceId: 501,
            finalAmount: 100000,
            paymentMethod: "PAYOS",
            paymentStatus: "PENDING",
            checkoutUrl: "https://pay.example/one",
            qrCode: "aGVsbG8="
          }
        })
      })
    );
    await page.route("**/api/payment/status?**", (route) => {
      statusCalls += 1;
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          code: 200,
          result: {
            invoiceId: 501,
            orderCode: "ORD-PAY-001",
            invoiceStatus: statusCalls === 1 ? 3 : 1
          }
        })
      });
    });

    await page.getByRole("button", { name: "Xác nhận đặt hàng" }).click();
    await expect(page.getByRole("heading", { name: "Đang chờ thanh toán" })).toBeVisible();
    await expect(page.getByRole("img", { name: "Mã QR thanh toán PayOS" })).toHaveAttribute(
      "src",
      "data:image/png;base64,aGVsbG8="
    );
    await expect(page.getByRole("link", { name: /Mở trang thanh toán/ })).toHaveAttribute(
      "target",
      "_blank"
    );
    await expect(page.getByRole("heading", { name: "Thanh toán thành công" })).toBeVisible({
      timeout: 8_000
    });
    expect(statusCalls).toBeGreaterThanOrEqual(2);
  });

  test("shows expiry and starts a fresh waiting period after retry", async ({ page }) => {
    let statusCalls = 0;
    await mockCheckoutForm(page);
    await page.route("**/api/checkout/submit", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          code: 200,
          result: {
            orderCode: "ORD-PAY-002",
            invoiceCode: "INV-PAY-002",
            invoiceId: 502,
            finalAmount: 200000,
            paymentMethod: "PAYOS",
            checkoutUrl: "https://pay.example/old",
            qrCode: "b2xk"
          }
        })
      })
    );
    await page.route("**/api/payment/status?**", (route) => {
      statusCalls += 1;
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          code: 200,
          result: {
            invoiceId: 502,
            orderCode: "ORD-PAY-002",
            invoiceStatus: statusCalls === 1 ? 2 : 3
          }
        })
      });
    });
    await page.route("**/api/payment/retry?**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          code: 200,
          result: { checkoutUrl: "https://pay.example/new", qrCode: "bmV3" }
        })
      })
    );

    await page.getByRole("button", { name: "Xác nhận đặt hàng" }).click();
    await expect(
      page.getByRole("heading", { name: "Thanh toán đã hết hạn hoặc bị hủy" })
    ).toBeVisible();
    await page.getByRole("button", { name: "Thanh toán lại" }).click();
    await expect(page.getByRole("heading", { name: "Đang chờ thanh toán" })).toBeVisible();
    await expect(page.getByText(/^Hết hạn sau 2[0-9]:/)).toBeVisible();
    await expect(page.getByRole("img", { name: "Mã QR thanh toán PayOS" })).toHaveAttribute(
      "src",
      "data:image/png;base64,bmV3"
    );
    await expect(page.getByRole("link", { name: /Mở trang thanh toán/ })).toHaveAttribute(
      "href",
      "https://pay.example/new"
    );
  });

  test("trusts payment status rather than the PayOS return query string", async ({ page }) => {
    await page.route("**/api/payment/status?**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          code: 200,
          result: { invoiceId: 503, orderCode: "ORD-PAY-003", invoiceStatus: 1 }
        })
      })
    );

    await page.goto("/payment/ORD-PAY-003/return?status=CANCELLED");
    await expect(page.getByRole("heading", { name: "Thanh toán thành công" })).toBeVisible();
  });
});
