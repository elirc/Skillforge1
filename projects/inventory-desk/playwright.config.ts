import { defineConfig } from "@playwright/test";
import { join } from "node:path";
const directory = process.env.INVENTORY_BROWSER_DIRECTORY;
if (!directory)
  throw new Error(
    "Run npm run test:e2e so the browser database is isolated and cleaned up after the server exits.",
  );
export default defineConfig({
  testDir: "./browser-tests",
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 30_000 },
  use: { baseURL: "http://127.0.0.1:5081", trace: "retain-on-failure" },
  webServer: {
    command: "dotnet run --project InventoryDesk.Api --no-launch-profile",
    cwd: import.meta.dirname,
    url: "http://127.0.0.1:5081/health/ready",
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ASPNETCORE_URLS: "http://127.0.0.1:5081",
      Inventory__DatabasePath: join(directory, "browser.db"),
    },
  },
});
