import { expect, test, type Page } from "@playwright/test";
import { getAccessToken, hasSeededUser, loginAsSeededUser } from "./support/auth";

interface ModuleItem {
  id: number;
  name: string;
}

const apiBaseUrl = process.env.VITE_API_URL ?? "http://localhost:9100/api";

async function listModules(page: Page, token: string, keyword: string) {
  const response = await page.request.get(
    `${apiBaseUrl}/module/list?keyword=${encodeURIComponent(keyword)}&page=1&limit=20`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  expect(response.ok(), "GET /module/list should succeed").toBeTruthy();
  const body = (await response.json()) as { result?: { items?: ModuleItem[] } };
  return body.result?.items ?? [];
}

async function createModules(page: Page, token: string, prefix: string, count: number) {
  for (let i = 1; i <= count; i++) {
    const response = await page.request.post(`${apiBaseUrl}/module/update`, {
      data: { name: `${prefix}-${i}`, code: `${prefix.toUpperCase()}_${i}`.replace(/-/g, "_") },
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(response.ok(), `Seeding module ${i} should succeed`).toBeTruthy();
  }
  return (await listModules(page, token, prefix)).sort((a, b) => a.id - b.id);
}

/** Best-effort cleanup: xóa mọi module còn sót theo prefix, bỏ qua lỗi. */
async function cleanup(page: Page, token: string | null, prefix: string) {
  if (!token) return;
  for (const item of await listModules(page, token, prefix)) {
    await page.request.delete(`${apiBaseUrl}/module/delete/${item.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}

async function filterByKeyword(page: Page, keyword: string) {
  await page.getByRole("button", { name: "Bộ lọc" }).click();
  await page.getByLabel("Từ khóa").fill(keyword);
}

test.describe("Module bulk delete", () => {
  test.skip(!hasSeededUser, "Set E2E_USER_IDENTIFIER / E2E_USER_PASSWORD to run this test");

  test("deletes all selected modules after confirmation", async ({ page }) => {
    const prefix = `e2e-bulk-${Date.now()}`;
    let token: string | null = null;

    try {
      await loginAsSeededUser(page);
      token = await getAccessToken(page);
      expect(token, "Login should persist an access token").toBeTruthy();
      await createModules(page, token!, prefix, 3);

      await page.goto("/crm/module");
      await filterByKeyword(page, prefix);
      const rows = page.getByRole("row").filter({ hasText: prefix });
      await expect(rows).toHaveCount(3);

      const deleteButton = page.getByRole("button", { name: "Xóa mục đã chọn" });
      await expect(deleteButton).toBeDisabled();

      await page.getByRole("checkbox", { name: "Select all" }).check();
      await expect(deleteButton).toBeEnabled();

      let confirmMessage = "";
      page.once("dialog", (dialog) => {
        confirmMessage = dialog.message();
        void dialog.accept();
      });
      await deleteButton.click();

      await expect(page.getByText("Xóa thành công")).toBeVisible();
      await expect(rows).toHaveCount(0);
      expect(confirmMessage).toContain("3 module");
      expect(await listModules(page, token!, prefix)).toHaveLength(0);
    } finally {
      await cleanup(page, token, prefix);
    }
  });

  test("keeps selected modules when the confirmation is dismissed", async ({ page }) => {
    const prefix = `e2e-bulk-cancel-${Date.now()}`;
    let token: string | null = null;

    try {
      await loginAsSeededUser(page);
      token = await getAccessToken(page);
      expect(token, "Login should persist an access token").toBeTruthy();
      await createModules(page, token!, prefix, 2);

      await page.goto("/crm/module");
      await filterByKeyword(page, prefix);
      const rows = page.getByRole("row").filter({ hasText: prefix });
      await expect(rows).toHaveCount(2);

      await page.getByRole("checkbox", { name: "Select all" }).check();
      page.once("dialog", (dialog) => void dialog.dismiss());
      await page.getByRole("button", { name: "Xóa mục đã chọn" }).click();

      await expect(rows).toHaveCount(2);
      expect(await listModules(page, token!, prefix)).toHaveLength(2);
    } finally {
      await cleanup(page, token, prefix);
    }
  });

  test("reports a partial failure and refreshes the table", async ({ page }) => {
    const prefix = `e2e-bulk-fail-${Date.now()}`;
    let token: string | null = null;

    try {
      await loginAsSeededUser(page);
      token = await getAccessToken(page);
      expect(token, "Login should persist an access token").toBeTruthy();
      const seeded = await createModules(page, token!, prefix, 3);
      expect(seeded).toHaveLength(3);
      const failing = seeded[1];

      // Ép đúng 1 request xóa thất bại, các request còn lại đi thẳng tới BE.
      await page.route(`**/module/delete/${failing.id}`, (route) =>
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ message: "forced failure" })
        })
      );

      await page.goto("/crm/module");
      await filterByKeyword(page, prefix);
      const rows = page.getByRole("row").filter({ hasText: prefix });
      await expect(rows).toHaveCount(3);

      await page.getByRole("checkbox", { name: "Select all" }).check();
      page.once("dialog", (dialog) => void dialog.accept());
      await page.getByRole("button", { name: "Xóa mục đã chọn" }).click();

      await expect(page.getByText("Đã xóa 2/3, 1 bản ghi thất bại")).toBeVisible();
      await expect(rows).toHaveCount(1);
      await expect(rows.first()).toContainText(failing.name);
    } finally {
      await page.unrouteAll({ behavior: "ignoreErrors" });
      await cleanup(page, token, prefix);
    }
  });
});
