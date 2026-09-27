import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
test("mobile navigation, URL filters, and empty results stay accessible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/problems?q=not-a-real-problem-name");
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Problems", exact: true }).first(),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    page.getByText("No problems match these filters."),
  ).toBeVisible();
  await expect(
    page.getByRole("combobox", { name: "Topic language" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(
    page.getByRole("textbox", { name: "Search problems" }),
  ).toHaveValue("");
  await page
    .getByRole("combobox", { name: "Status", exact: true })
    .selectOption("unsolved");
  await page.reload();
  await expect(
    page.getByRole("combobox", { name: "Status", exact: true }),
  ).toHaveValue("unsolved");
  await page.goto("/projects");
  // Start from a known document element, avoiding the browser chrome and
  // Next's initial navigation focus restoration during hydration.
  await expect(async () => {
    await page.getByRole("link", { name: "Skillforge home" }).focus();
    await page.keyboard.press("Shift+Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  }).toPass({ timeout: 30_000 });
  await page.screenshot({ path: "test-results/projects-mobile.png", fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
test("drafts survive reload and changed code clears its test verdict", async ({
  page,
}) => {
  await page.goto("/problems/sum-array");
  const editor = page.locator(".cm-content");
  await expect(editor).toBeVisible({ timeout: 180_000 });
  await editor.fill(
    "function sumArray(values) { return values.reduce((sum, value) => sum + value, 0); }",
  );
  await expect(page.getByRole("status")).toContainText("Draft saved");
  await page.reload();
  await expect(editor).toContainText("values.reduce");
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByText("3 / 3 tests passed", { exact: true })).toBeVisible();
  await editor.fill("function sumArray() { return 0; }");
  await expect(page.getByText(/tests passed$/)).toHaveCount(0);
  await page.reload();
  await expect(editor).toContainText("return 0");
});
test("a failed progress save keeps the draft and reports a retry", async ({
  page,
}) => {
  await page.goto("/problems/sum-array");
  const editor = page.locator(".cm-content");
  await expect(editor).toBeVisible({ timeout: 180_000 });
  await editor.fill(
    "function sumArray(values) { return values.reduce((sum, value) => sum + value, 0); }",
  );
  await page.route("**/problems/sum-array", (route) =>
    route.request().method() === "POST" ? route.abort() : route.continue(),
  );
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "progress could not be saved",
  );
  await expect(editor).toContainText("values.reduce");
  await page.unroute("**/problems/sum-array");
});
test("HTTP playground shows actual validation and precondition responses", async ({
  page,
}) => {
  await page.goto("/playground/http");
  await page
    .getByRole("combobox", { name: "Scenario" })
    .selectOption({ label: "Submit invalid data" });
  await page.getByRole("button", { name: "Send local request" }).click();
  await expect(
    page.getByRole("heading", { name: /Response: 400/ }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Scenario" })
    .selectOption({ label: "Try a stale version" });
  await page.getByRole("button", { name: "Send local request" }).click();
  await expect(
    page.getByRole("heading", { name: /Response: 412/ }),
  ).toBeVisible();
});
test("empty review queue and project download are clear", async ({ page }) => {
  if (!process.env.SKILLFORGE_E2E_TEST_DB)
    throw new Error("Use the isolated e2e helper.");
  const prisma = new PrismaClient();
  try {
    await prisma.reviewState.updateMany({
      data: { dueAt: new Date("2099-01-01") },
    });
  } finally {
    await prisma.$disconnect();
  }
  await page.goto("/reviews");
  await expect(
    page.getByText(/No reviews due|Nothing due/).first(),
  ).toBeVisible();
  await page.goto("/projects");
  const download = page.waitForEvent("download");
  await page
    .getByRole("link", { name: "Download Inventory Desk source" })
    .click();
  expect((await download).suggestedFilename()).toBe("inventory-desk.zip");
});
