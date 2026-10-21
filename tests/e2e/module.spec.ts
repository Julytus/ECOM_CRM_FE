import { expect, test, type Page } from "@playwright/test";
import { getAccessToken, hasSeededUser, loginAsSeededUser } from "./support/auth";

interface ApiListResult<T> {
  result?: {
    items?: T[];
  };
}

interface ResourceItem {
  id: number;
  name: string;
}

interface ModuleItem {
  id: number;
  name: string;
}

const apiBaseUrl = process.env.VITE_API_URL ?? "http://localhost:9100/api";

async function getApiList<T>(page: Page, path: string, token: string) {
  const response = await page.request.get(`${apiBaseUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  expect(response.ok(), `GET ${path} should succeed`).toBeTruthy();
  return (await response.json()) as ApiListResult<T>;
}

async function removeCreatedModule(
  page: Page,
  token: string,
  moduleId: number,
  assignedResourceIds: number[]
) {
  if (assignedResourceIds.length > 0) {
    const unassignResponse = await page.request.post(
      `${apiBaseUrl}/module/unassign-resources`,
      {
        data: { resourceIds: assignedResourceIds },
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    expect(unassignResponse.ok(), "Created resources should be unassigned before cleanup").toBeTruthy();
  }

  const deleteResponse = await page.request.delete(`${apiBaseUrl}/module/delete/${moduleId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  expect(deleteResponse.ok(), "The created module should be deleted during cleanup").toBeTruthy();
}

test.describe("Module CRUD and resource assignment", () => {
  test("creates a module, assigns an unassigned resource, and cleans up", async ({ page }) => {
    test.skip(!hasSeededUser, "Set E2E_USER_IDENTIFIER / E2E_USER_PASSWORD to run this test");

    const moduleName = `e2e-module-${Date.now()}`;
    const moduleCode = `E2E_MODULE_${Date.now()}`;
    const assignedResourceIds: number[] = [];
    let accessToken: string | null = null;
    let moduleId: number | undefined;
    let creationAttempted = false;

    try {
      await loginAsSeededUser(page);
      accessToken = await getAccessToken(page);
      expect(accessToken, "Login should persist an access token").toBeTruthy();

      const resourcesResponse = await getApiList<ResourceItem>(
        page,
        "/resource/list?unassigned=true&page=1&limit=10",
        accessToken!
      );
      const resource = resourcesResponse.result?.items?.[0];

      await page.goto("/crm/module");
      await page.getByRole("button", { name: "Thêm module" }).click();
      await page.getByLabel("Tên module").fill(moduleName);
      await page.getByLabel("Code").fill(moduleCode);
      creationAttempted = true;
      await page.getByRole("button", { name: "Tạo mới" }).click();

      const createdRow = page.getByRole("row").filter({ hasText: moduleName });
      await expect(createdRow).toBeVisible();

      const modulesResponse = await getApiList<ModuleItem>(
        page,
        `/module/list?keyword=${encodeURIComponent(moduleName)}&page=1&limit=10`,
        accessToken!
      );
      moduleId = modulesResponse.result?.items?.find((item) => item.name === moduleName)?.id;
      expect(moduleId, "The newly created module should be returned by the API").toBeDefined();

      if (!resource) {
        test.skip(true, "No unassigned resource is available to assign");
      }

      await createdRow.getByRole("button", { name: "Mở menu" }).click();
      await page.getByRole("menuitem", { name: "Gán tài nguyên" }).click();
      const dialog = page.getByRole("dialog", { name: "Gán tài nguyên" });
      await expect(dialog).toBeVisible();
      await dialog.getByRole("checkbox", { name: `Chọn ${resource!.name}` }).check();
      assignedResourceIds.push(resource!.id);
      await dialog.getByRole("button", { name: "Gán (1)" }).click();
      await expect(dialog).toBeHidden();

      await createdRow.getByRole("button", { name: "Mở menu" }).click();
      await page.getByRole("menuitem", { name: "Gán tài nguyên" }).click();
      const reopenedDialog = page.getByRole("dialog", { name: "Gán tài nguyên" });
      await reopenedDialog.getByLabel("Tìm kiếm tài nguyên").fill(resource!.name);
      await expect(reopenedDialog.getByText("Không có tài nguyên chưa gán.")).toBeVisible();
    } finally {
      if (accessToken && creationAttempted) {
        if (moduleId === undefined) {
          const modulesResponse = await getApiList<ModuleItem>(
            page,
            `/module/list?keyword=${encodeURIComponent(moduleName)}&page=1&limit=10`,
            accessToken
          );
          moduleId = modulesResponse.result?.items?.find((item) => item.name === moduleName)?.id;
        }

        expect(moduleId, "The created module should be identifiable for cleanup").toBeDefined();
        await removeCreatedModule(page, accessToken, moduleId!, assignedResourceIds);
      }
    }
  });
});
