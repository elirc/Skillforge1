import { test, expect } from "@playwright/test";

test("guest learner takes a lesson and completes a review", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Course catalog" })).toBeVisible();
  await page.getByText("JavaScript Foundations").first().click();
  await page.getByText("Variables Hold Values").click();

  await page.getByRole("button", { name: "const" }).click();
  await page.getByRole("button", { name: "Check" }).first().click();
  await page.getByPlaceholder(/A variable gives/).fill("name");
  await page.getByRole("button", { name: "Check" }).nth(1).click();

  const editor = page.locator(".cm-content").first();
  await editor.click();
  await page.keyboard.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
  await page.keyboard.type("function addXp(current, earned) { return current + earned; }");
  await page.getByRole("button", { name: "Run" }).click();
  await expect(page.getByText("Pass: adds a small reward")).toBeVisible();
  await page.getByRole("button", { name: "Complete lesson" }).click();

  await page.getByRole("link", { name: /Reviews/ }).click();
  await expect(page.getByRole("heading", { name: "Reviews due" })).toBeVisible();
  await page.getByRole("button", { name: "Reveal answer" }).click();
  await page.getByRole("button", { name: "Good" }).click();
});
