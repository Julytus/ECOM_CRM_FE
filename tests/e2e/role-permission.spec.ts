import { expect, test } from "@playwright/test";
import { hasSeededUser, loginAsSeededUser } from "./support/auth";

test.describe("Role to permission navigation", () => {
  test("opens permissions for the selected role", async ({ page }) => {
    test.skip(!hasSeededUser, "Set E2E_USER_IDENTIFIER / E2E_USER_PASSWORD to run this test");

    await loginAsSeededUser(page);
    await page.goto("/crm/role");

    const firstRoleRow = page.getByRole("row").nth(1);
    await expect(firstRoleRow).toBeVisible();
    const roleName = (await firstRoleRow.getByRole("cell").nth(1).locator("span").first().innerText()).trim();

    await firstRoleRow.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("menuitem", { name: "Phân quyền" }).click();

    await expect(page).toHaveURL(/\/crm\/permission\?roleId=\d+$/);
    await expect(page.getByRole("combobox")).toHaveText(roleName);
  });
});
