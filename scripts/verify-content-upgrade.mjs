import { mkdtemp, rm, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, dirname, basename } from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { compareLearnerRows } from "./lib/verify-learner-rows.mjs";
const require = createRequire(import.meta.url);
const backup = resolve(
  process.argv[2] ?? "data/backups/skillforge-2026-09-27T01-19-42-005Z.db",
);
const directory = await mkdtemp(join(tmpdir(), "skillforge-upgrade-"));
const database = join(directory, "test.db");
const env = {
  ...process.env,
  DATABASE_URL: `file:${database.replaceAll("\\", "/")}`,
};
function run(entry, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [entry, ...args], {
      env,
      stdio: "inherit",
      windowsHide: true,
    });
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`Upgrade step exited ${code}`)),
    );
  });
}
try {
  await copyFile(backup, database);
  await run("scripts/migrate-content-identity.mjs", [database]);
  await run(require.resolve("tsx/cli"), ["prisma/seed.ts"]);
  console.log(
    "Upgraded copy, original learner values preserved:",
    await compareLearnerRows(database, backup),
  );
  // Retain the verified copy for browser checks and inspectability.
  await copyFile(database, resolve("data/backups/verified-content-upgrade.db"));
} finally {
  if (
    dirname(resolve(directory)) !== resolve(tmpdir()) ||
    !basename(directory).startsWith("skillforge-upgrade-")
  )
    throw new Error("Unexpected upgrade directory");
  await rm(directory, { recursive: true, force: true });
}
