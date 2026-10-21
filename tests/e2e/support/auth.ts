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

export async function loginAsSeededUser(page: Page) {
  await login(page, E2E_USER.identifier!, E2E_USER.password!);
  await page.waitForURL((url) => !url.pathname.endsWith("/login"));
}

export async function getAccessToken(page: Page) {
  return page.evaluate(() => {
    const persistedAuth = localStorage.getItem("auth-storage");
    if (!persistedAuth) return null;

    try {
      const parsed: unknown = JSON.parse(persistedAuth);
      if (typeof parsed !== "object" || parsed === null || !("state" in parsed)) return null;
      const state = parsed.state;
      if (typeof state !== "object" || state === null || !("accessToken" in state)) return null;
      return typeof state.accessToken === "string" ? state.accessToken : null;
    } catch {
      return null;
    }
  });
}
