import { expect, test, type Page } from "@playwright/test";

type Tier = { id: number; name: string; minRankPoints: number; earnMultiplier: number; status: number };

async function mockLoyaltyApis(page: Page, actions: string[]) {
  let tiers: Tier[] = [
    { id: 1, name: "Thành viên", minRankPoints: 0, earnMultiplier: 1, status: 1 }
  ];
  let earnRate = 1000;
  const savedPayloads: Record<string, unknown>[] = [];

  await page.addInitScript(() => {
    localStorage.setItem(
      "auth-storage",
      JSON.stringify({ state: { accessToken: "mock-access", refreshToken: "mock-refresh", userId: 1 }, version: 0 })
    );
  });
  await page.route("**/api/user/info", (route) =>
    route.fulfill({ json: { code: 200, result: { id: 1, isOperator: 0, name: "CRM test" } } })
  );
  await page.route("**/api/permission/resource", (route) =>
    route.fulfill({
      json: { code: 200, result: [{ code: "LOYALTY", actions: JSON.stringify(actions) }] }
    })
  );
  await page.route("**/api/loyalty/tier/list", (route) =>
    route.fulfill({ json: { code: 200, result: tiers } })
  );
  await page.route("**/api/loyalty/config", (route) =>
    route.fulfill({ json: { code: 200, result: { id: 1, earnRate } } })
  );
  await page.route("**/api/loyalty/tier/save", async (route) => {
    const payload = route.request().postDataJSON() as Record<string, unknown>;
    savedPayloads.push(payload);
    if (payload.minRankPoints === 10 && payload.name === "Trùng") {
      await route.fulfill({ status: 400, json: { code: 400, message: "Ngưỡng điểm đã được sử dụng." } });
      return;
    }
    const tier = { ...payload, id: typeof payload.id === "number" ? payload.id : 2 } as Tier;
    tiers = payload.id ? tiers.map((item) => (item.id === payload.id ? tier : item)) : [...tiers, tier];
    await route.fulfill({ json: { code: 200, result: tier } });
  });
  await page.route("**/api/loyalty/tier/delete/*", async (route) => {
    const id = Number(new URL(route.request().url()).pathname.split("/").pop());
    tiers = tiers.filter((tier) => tier.id !== id);
    await route.fulfill({ json: { code: 200, result: 1 } });
  });
  await page.route("**/api/loyalty/config/update", async (route) => {
    const payload = route.request().postDataJSON() as { earnRate: number };
    earnRate = payload.earnRate;
    await route.fulfill({ json: { code: 200, result: { id: 1, earnRate } } });
  });

  return { savedPayloads };
}

test.describe("CRM loyalty administration", () => {
  test("creates, edits and deletes tiers, reports API errors, and updates earn rate", async ({ page }) => {
    const { savedPayloads } = await mockLoyaltyApis(page, ["VIEW", "ADD", "UPDATE", "DELETE"]);
    await page.goto("/crm/loyalty");

    await expect(page.getByRole("heading", { name: "Hạng thành viên", exact: true })).toBeVisible();
    await expect(page.getByText("Đổi hạng/ngưỡng chỉ tính lại hạng tài khoản ở lần ghi điểm kế tiếp.")).toBeVisible();
    await page.getByRole("button", { name: "Thêm hạng" }).click();
    await page.getByLabel("Tên hạng").fill("Bạc");
    await page.getByLabel("Điểm hạng tối thiểu").fill("10");
    await page.getByLabel("Hệ số tích điểm").fill("1.25");
    await page.getByRole("button", { name: "Thêm hạng", exact: true }).last().click();
    await expect(page.getByText("Bạc")).toBeVisible();
    expect(savedPayloads[0]).toMatchObject({ name: "Bạc", minRankPoints: 10, earnMultiplier: 1.25, status: 1 });

    await page.getByRole("button", { name: "Thao tác hạng Bạc" }).click();
    await page.getByRole("menuitem", { name: "Chỉnh sửa" }).click();
    await page.getByLabel("Tên hạng").fill("Bạc Plus");
    await page.getByRole("button", { name: "Cập nhật", exact: true }).click();
    await expect(page.getByText("Bạc Plus")).toBeVisible();
    expect(savedPayloads[1]).toMatchObject({ id: 2, name: "Bạc Plus" });

    await page.getByRole("button", { name: "Thao tác hạng Bạc Plus" }).click();
    await page.getByRole("menuitem", { name: "Xóa" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Xóa" }).click();
    await expect(page.getByText("Bạc Plus")).toHaveCount(0);

    await page.getByRole("button", { name: "Thêm hạng" }).click();
    await page.getByLabel("Tên hạng").fill("Trùng");
    await page.getByLabel("Điểm hạng tối thiểu").fill("10");
    await page.getByLabel("Hệ số tích điểm").fill("1.5");
    await page.getByRole("button", { name: "Thêm hạng", exact: true }).last().click();
    await expect(page.getByText("Ngưỡng điểm đã được sử dụng.").first()).toBeVisible();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("dialog").getByRole("button", { name: "Hủy" }).click();

    await page.getByLabel("Tỷ lệ quy đổi (đồng/điểm)").fill("1500");
    await page.getByRole("button", { name: "Lưu cấu hình" }).click();
    await expect(page.getByText("Cập nhật cấu hình tích điểm thành công.")).toBeVisible();
  });

  test("shows the page for VIEW-only users without mutation controls or loyalty menu", async ({ page }) => {
    await mockLoyaltyApis(page, ["VIEW"]);
    await page.goto("/crm/loyalty");

    await expect(page.getByRole("heading", { name: "Hạng thành viên", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Thêm hạng" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Lưu cấu hình" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Loyalty" })).toBeVisible();
  });

  test("denies users without VIEW permission", async ({ page }) => {
    await mockLoyaltyApis(page, []);
    await page.goto("/crm/loyalty");

    await expect(page.getByRole("heading", { name: "Truy cập bị từ chối" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Loyalty" })).toHaveCount(0);
  });
});
