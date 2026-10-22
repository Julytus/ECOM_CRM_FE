import { expect, test, type Page } from "@playwright/test";

const customer = { id: 37, name: "Nguyễn An", phone: "0901234567", accountUserId: 81 };

async function mockBase(page: Page, actions = ["VIEW", "UPDATE"]) {
  await page.route("**/api/permission/resource", (route) => route.fulfill({
    status: 200, contentType: "application/json", body: JSON.stringify({ result: [{ code: "LOYALTY", actions: JSON.stringify(actions) }] })
  }));
  await page.route("**/api/customer/list?**", (route) => route.fulfill({
    status: 200, contentType: "application/json", body: JSON.stringify({ result: { items: [customer], page: 1, total: 1 } })
  }));
  await page.route("**/api/loyalty/tier/list", (route) => route.fulfill({
    status: 200, contentType: "application/json", body: JSON.stringify({ result: [{ id: 2, name: "Bạc" }] })
  }));
  await page.route("**/api/loyalty/account?**", (route) => route.fulfill({
    status: 200, contentType: "application/json", body: JSON.stringify({ result: { customerId: 37, balance: 120, rankPoints: 450, tierId: 2 } })
  }));
  await page.route("**/api/loyalty/transactions?**", (route) => route.fulfill({
    status: 200, contentType: "application/json", body: JSON.stringify({ result: { items: [{ id: 1, type: "ADJUST", points: -5, balanceAfter: 120, rankPointsDelta: 2, note: "Điều chỉnh", refType: "ADMIN", refId: "A1", createdAt: "2026-10-22T09:00:00Z", createdBy: 9 }], page: 1, total: 11 } })
  }));
}

async function chooseCustomer(page: Page) {
  await page.goto("/crm/loyalty-customer");
  await page.getByLabel("Tìm khách hàng theo tên hoặc số điện thoại").fill("An");
  await page.getByRole("button", { name: /Nguyễn An.*0901234567/ }).click();
  await expect(page.getByRole("heading", { name: "Nguyễn An" })).toBeVisible();
}

test.describe("CRM loyalty customer lookup", () => {
  test("searches customers and shows their account and paginated transaction history", async ({ page }) => {
    await mockBase(page);
    await chooseCustomer(page);
    await expect(page.getByRole("region", { name: "Tài khoản điểm" }).getByText("120", { exact: true })).toBeVisible();
    await expect(page.getByText("Bạc", { exact: true })).toBeVisible();
    await expect(page.getByText("ADJUST", { exact: true })).toBeVisible();
    await expect(page.getByText("Điều chỉnh", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Sau" }).click();
    await expect(page.getByText("Trang 2 / 2 · 11 giao dịch")).toBeVisible();
  });

  test("blocks an adjustment without a reason", async ({ page }) => {
    await mockBase(page);
    await chooseCustomer(page);
    await page.getByRole("button", { name: "Điều chỉnh điểm" }).click();
    await page.getByLabel("Điểm cộng/trừ").fill("10");
    await page.getByRole("button", { name: "Tiếp tục" }).click();
    await expect(page.getByRole("heading", { name: "Xác nhận điều chỉnh điểm?" })).toHaveCount(0);
  });

  test("confirms an adjustment, submits it, and refreshes account queries", async ({ page }) => {
    let payload: Record<string, unknown> | undefined;
    await mockBase(page);
    await page.route("**/api/loyalty/adjust", async (route) => {
      payload = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ result: true }) });
    });
    await chooseCustomer(page);
    await page.getByRole("button", { name: "Điều chỉnh điểm" }).click();
    await page.getByLabel("Điểm cộng/trừ").fill("10");
    await page.getByLabel("Điểm xếp hạng thay đổi").fill("0");
    await page.getByLabel("Lý do").fill("Bổ sung thủ công");
    await page.getByRole("button", { name: "Tiếp tục" }).click();
    await expect(page.getByRole("heading", { name: "Xác nhận điều chỉnh điểm?" })).toBeVisible();
    await page.getByRole("button", { name: "Xác nhận" }).click();
    await expect.poll(() => payload).toMatchObject({ customerId: 37, points: 10, rankDelta: 0, reason: "Bổ sung thủ công" });
  });

  test("shows the backend message when the account is linked to another customer", async ({ page }) => {
    await mockBase(page);
    await page.route("**/api/customer/linkAccount", (route) => route.fulfill({
      status: 409, contentType: "application/json", body: JSON.stringify({ message: "Tài khoản đã gắn cho khách khác" })
    }));
    await chooseCustomer(page);
    await page.getByRole("button", { name: "Liên kết tài khoản" }).click();
    await page.getByLabel("Account user ID").fill("92");
    await page.getByRole("button", { name: "Liên kết" }).click();
    await expect(page.getByText("Tài khoản đã gắn cho khách khác").first()).toBeVisible();
  });

  test("hides update actions for a view-only role", async ({ page }) => {
    await mockBase(page, ["VIEW"]);
    await chooseCustomer(page);
    await expect(page.getByRole("button", { name: "Điều chỉnh điểm" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Liên kết tài khoản" })).toHaveCount(0);
  });
});
