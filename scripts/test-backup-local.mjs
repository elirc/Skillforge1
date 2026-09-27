// Runs tests/unit/backup-db.test.ts against a throwaway SQLite file under the
// OS temp dir. Never touches data/skillforge.db.
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { DatabaseSync } from "node:sqlite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scratch = await mkdtemp(path.join(tmpdir(), "skillforge-backup-"));
const databasePath = path.join(scratch, "test.db").replaceAll("\\", "/");
const env = { ...process.env, DATABASE_URL: `file:${databasePath}`, SKILLFORGE_BACKUP_TEST_DB: databasePath, NODE_ENV: "test" };
const require = createRequire(import.meta.url);

function run(entry, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [entry, ...args], { cwd: root, env, stdio: "inherit", windowsHide: true });
    child.once("error", reject);
    child.once("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${args.join(" ")} exited ${code}`))));
  });
}

try {
  new DatabaseSync(databasePath).close();
  const prismaRoot = path.dirname(require.resolve("prisma/package.json"));
  await run(path.join(prismaRoot, "build/index.js"), ["db", "push", "--skip-generate"]);
  await run(path.join(path.dirname(require.resolve("vitest/package.json")), "vitest.mjs"), [
    "run",
    "tests/unit/backup-db.test.ts",
    "--maxWorkers=1",
    "--minWorkers=1",
    "--testTimeout=90000",
    "--hookTimeout=90000",
  ]);
} finally {
  const resolved = path.resolve(scratch);
  if (path.dirname(resolved) !== path.resolve(tmpdir()) || !path.basename(resolved).startsWith("skillforge-backup-")) {
    throw new Error("Refusing to remove unexpected temporary directory");
  }
  await rm(resolved, { recursive: true, force: true });
}
