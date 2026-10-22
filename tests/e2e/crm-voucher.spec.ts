import { expect, test, type Page } from "@playwright/test";

type Voucher = Record<string, unknown> & { id: number; code: string; name: string };

async function mockVoucherApis(page: Page) {
  const vouchers: Voucher[] = [{
    id: 7,
    code: "WELCOME10",
    name: "Ưu đãi chào mừng",
    description: "Giảm giá đơn đầu tiên",
    discountType: 0,
    discountValue: 10,
    maxDiscount: 50000,
    minInvoiceAmount: 100000,
    startDate: "2026-01-01T00:00:00Z",
    endDate: "2027-01-01T00:00:00Z",
    totalQuantity: 100,
    perUserLimit: 1,
    status: 1,
    usageQuantity: 2,
    pointsCost: 100,
    redeemStock: 8,
    redeemedCount: 5,
    minTierId: 2,
    branchId: 3,
    branchName: "Chi nhánh trung tâm"
  }];
  let nextId = 8;
  const submitted: Voucher[] = [];
  const deleted: number[] = [];

  await page.route("**/api/permission/resource", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ code: 200, result: [{ code: "VOUCHER", actions: "[\"VIEW\",\"ADD\",\"UPDATE\",\"DELETE\"]" }] })
  }));
  await page.route("**/api/loyalty/tier/list", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ code: 200, result: [{ id: 2, name: "Bạc", status: 1 }] })
  }));
  await page.route("**/api/voucher/list**", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ code: 200, result: { items: vouchers, page: 1, total: vouchers.length } })
  }));
  await page.route("**/api/voucher/get?**", (route) => {
    const id = Number(new URL(route.request().url()).searchParams.get("id"));
    const voucher = vouchers.find((item) => item.id === id);
    return route.fulfill({
      status: voucher ? 200 : 404,
      contentType: "application/json",
      body: JSON.stringify(voucher ? { code: 200, result: voucher } : { code: 404, message: "Không tìm thấy voucher" })
    });
  });
  await page.route("**/api/voucher/update", async (route) => {
    const body = route.request().postDataJSON() as Voucher;
    submitted.push(body);
    if (!body.id || body.id <= 0) {
      const saved = { ...body, id: nextId++ };
      vouchers.push(saved);
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ code: 200, result: saved }) });
      return;
    }
    const index = vouchers.findIndex((voucher) => voucher.id === body.id);
    if (index >= 0) vouchers[index] = body;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ code: 200, result: body }) });
  });
  await page.route("**/api/voucher/delete/*", async (route) => {
    const id = Number(new URL(route.request().url()).pathname.split("/").pop());
    deleted.push(id);
    const index = vouchers.findIndex((voucher) => voucher.id === id);
    if (index >= 0) vouchers.splice(index, 1);
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ code: 200, result: id }) });
  });

  return { submitted, deleted };
}

async function openCreateForm(page: Page) {
  await page.goto("/crm/voucher");
  await expect(page.getByRole("heading", { name: "Quản lý voucher" })).toBeVisible();
  await page.getByRole("button", { name: "Thêm voucher" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("Mã voucher").fill("SPRING20");
  await page.getByLabel("Tên voucher").fill("Ưu đãi mùa xuân");
  await page.getByLabel("Giá trị giảm").fill("20");
  await page.getByLabel("Bắt đầu").fill("2026-10-01T00:00");
  await page.getByLabel("Kết thúc").fill("2026-12-31T23:59");
}

test.describe("CRM voucher management", () => {
  test("creates a regular voucher", async ({ page }) => {
    const { submitted } = await mockVoucherApis(page);
    await openCreateForm(page);
    await page.getByRole("button", { name: "Tạo voucher" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
    expect(submitted).toHaveLength(1);
    expect(submitted[0]).toMatchObject({ code: "SPRING20", name: "Ưu đãi mùa xuân", discountValue: 20, status: 1 });
    expect(submitted[0]).not.toHaveProperty("pointsCost");
    expect(submitted[0]).not.toHaveProperty("redeemStock");
    expect(submitted[0]).not.toHaveProperty("minTierId");
  });

  test("creates a points redemption voucher and selects a tier", async ({ page }) => {
    const { submitted } = await mockVoucherApis(page);
    await openCreateForm(page);
    await page.getByLabel("Điểm cần đổi").fill("250");
    await page.getByLabel("Tồn voucher đổi điểm").fill("12");
    await page.getByRole("combobox", { name: "Hạng tối thiểu" }).click();
    await page.getByRole("option", { name: "Bạc" }).click();
    await page.getByRole("button", { name: "Tạo voucher" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
    expect(submitted[0]).toMatchObject({ pointsCost: 250, redeemStock: 12, minTierId: 2 });
  });

  test("rejects points cost at or below zero", async ({ page }) => {
    const { submitted } = await mockVoucherApis(page);
    await openCreateForm(page);
    await page.getByLabel("Điểm cần đổi").fill("0");
    await page.getByLabel("Tồn voucher đổi điểm").fill("10");
    await page.getByRole("button", { name: "Tạo voucher" }).click();
    await expect(page.getByRole("alert")).toHaveText("Điểm đổi phải là số nguyên lớn hơn 0.");
    expect(submitted).toHaveLength(0);
  });

  test("rejects redeem stock below redeemed count", async ({ page }) => {
    const { submitted } = await mockVoucherApis(page);
    await page.goto("/crm/voucher");
    await page.getByRole("button", { name: "Thao tác voucher WELCOME10" }).click();
    await page.getByRole("menuitem", { name: "Chỉnh sửa" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByLabel("Tồn voucher đổi điểm").fill("4");
    await page.getByRole("button", { name: "Cập nhật" }).click();
    await expect(page.getByRole("alert")).toHaveText("Tồn đổi không được nhỏ hơn số đã đổi (5).");
    expect(submitted).toHaveLength(0);
  });

  test("keeps fields outside the form when updating a voucher", async ({ page }) => {
    const { submitted } = await mockVoucherApis(page);
    await page.goto("/crm/voucher");
    await page.getByRole("button", { name: "Thao tác voucher WELCOME10" }).click();
    await page.getByRole("menuitem", { name: "Chỉnh sửa" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Cập nhật" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
    expect(submitted[0]).toMatchObject({
      id: 7,
      redeemedCount: 5,
      usageQuantity: 2,
      branchName: "Chi nhánh trung tâm"
    });
  });

  test("deletes a voucher", async ({ page }) => {
    const { deleted } = await mockVoucherApis(page);
    await page.goto("/crm/voucher");
    await page.getByRole("button", { name: "Thao tác voucher WELCOME10" }).click();
    await page.getByRole("menuitem", { name: "Xóa" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Xóa" }).click();
    await expect.poll(() => deleted).toEqual([7]);
  });
});
