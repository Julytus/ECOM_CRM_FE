import { expect, test } from "@playwright/test";
import { hasSeededUser, loginAsSeededUser } from "./support/auth";

test.describe("Permission matrix", () => {
  test("shows module groups, collapses resources, and selects a role by URL", async ({ page }) => {
    test.skip(!hasSeededUser, "Set E2E_USER_IDENTIFIER / E2E_USER_PASSWORD to run this test");

    await loginAsSeededUser(page);
    await page.goto("/crm/permission");

    const groups = page.locator('[data-testid^="module-group-"]');
    await expect(groups.first()).toBeVisible();
    const expandableGroup = groups.filter({ has: page.locator("button[aria-expanded]") }).first();
    await expect(expandableGroup).toBeVisible();

    const groupButton = expandableGroup.locator("button[aria-expanded]");
    const resourceRow = expandableGroup.locator("xpath=following-sibling::tr[1]");
    await expect(groupButton).toHaveAttribute("aria-expanded", "true");
    await expect(resourceRow).toBeVisible();
    await groupButton.click();
    await expect(groupButton).toHaveAttribute("aria-expanded", "false");
    await expect(resourceRow).toBeHidden();
    await groupButton.click();
    await expect(groupButton).toHaveAttribute("aria-expanded", "true");
    await expect(resourceRow).toBeVisible();

    await expect(page).toHaveURL(/roleId=\d+/);
    const roleSelect = page.getByRole("combobox");
    await expect(roleSelect).not.toHaveText("Chọn chức vụ");
    const selectedRoleName = await roleSelect.innerText();
    await page.goto(`/crm/permission?roleId=${new URL(page.url()).searchParams.get("roleId")}`);
    await expect(page).toHaveURL(/roleId=\d+/);
    await expect(roleSelect).toHaveText(selectedRoleName);
  });
});
