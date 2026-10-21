import type { Page } from "@playwright/test";

/**
 * Credentials for a seeded test account, injected via env so no secrets live in the repo.
 * Tests that need a real session skip themselves when these are absent.
 */
export const E2E_USER = {
  identifier: process.env.E2E_USER_IDENTIFIER,
  password: process.env.E2E_USER_PASSWORD
};

export const hasSeededUser = Boolean(E2E_USER.identifier && E2E_USER.password);

export async function login(page: Page, identifier: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email hoặc số điện thoại*").fill(identifier);
  await page.getByLabel("Mật khẩu*").fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
}
