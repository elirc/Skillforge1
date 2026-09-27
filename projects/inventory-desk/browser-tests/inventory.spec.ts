import { test, expect } from "@playwright/test";
test("create, edit, reserve and delete through the real UI", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Create an account", exact: true })
    .click();
  await page
    .getByLabel("Email", { exact: true })
    .fill(`browser-${Date.now()}@example.test`);
  await page
    .getByLabel("Password", { exact: true })
    .fill("browser-test-password");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your inventory" }),
  ).toBeVisible();
  await page.getByLabel("SKU", { exact: true }).fill("BOOK");
  await page.getByLabel("Name", { exact: true }).fill("Notebook");
  await page.getByLabel("Price in cents").fill("250");
  await page.getByLabel("Starting stock").fill("2");
  await page.getByRole("button", { name: "Add product", exact: true }).click();
  await expect(page.getByRole("cell", { name: "Notebook BOOK" })).toBeVisible();
  await page.getByRole("button", { name: "Reserve one BOOK" }).click();
  await expect(page.getByText("Stock adjusted.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByLabel("Name", { exact: true }).fill("Updated notebook");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByRole("cell", { name: "Updated notebook BOOK" }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/inventory-desk.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Confirm delete" }).click();
  await expect(
    page.getByText("Your inventory is empty.", { exact: false }),
  ).toBeVisible();
});
