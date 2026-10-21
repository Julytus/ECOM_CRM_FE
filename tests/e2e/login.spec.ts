import { test, expect } from "@playwright/test";
import { E2E_USER, hasSeededUser, login } from "./support/auth";

test.describe("Login flow", () => {
  test("rejects invalid credentials and stays on /login", async ({ page }) => {
    await login(page, "no-such-user@example.com", "wrong-password");

    await expect(page).toHaveURL(/\/login$/);
  });

  test("requires both fields before submit is allowed through", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Đăng nhập" }).click();

    await expect(page).toHaveURL(/\/login$/);
  });

  test("logs a seeded user in and lands on the home page", async ({ page }) => {
    test.skip(!hasSeededUser, "Set E2E_USER_IDENTIFIER / E2E_USER_PASSWORD to run this test");

    await login(page, E2E_USER.identifier!, E2E_USER.password!);

    await expect(page).toHaveURL("/");
  });
});
