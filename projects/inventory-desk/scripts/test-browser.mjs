import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, basename, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const directory = await mkdtemp(join(tmpdir(), "inventory-desk-browser-"));
try {
  const code = await new Promise((done, reject) => {
    const child = spawn(process.execPath, [require.resolve("@playwright/test/cli"), "test"], { cwd: root, env: { ...process.env, INVENTORY_BROWSER_DIRECTORY: directory }, stdio: "inherit", windowsHide: true });
    child.once("error", reject); child.once("exit", done);
  });
  process.exitCode = code ?? 1;
} finally {
  // Playwright has shut down its web server before this cleanup runs.
  if (dirname(resolve(directory)) !== resolve(tmpdir()) || !basename(directory).startsWith("inventory-desk-browser-")) throw new Error("Unexpected browser directory");
  await rm(directory, { recursive: true, force: true, maxRetries:10, retryDelay:500 });
}
