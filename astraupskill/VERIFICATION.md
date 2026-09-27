# Use the owned-database command as evidence

The completion integration command is node scripts/test-completion-local.mjs. It creates a temporary SQLite database, supplies an ownership marker, applies the schema, and runs the five completion cases. It validates the temporary path before cleanup. The exact accepted command and terminal result are appended below only after execution succeeds.

These cases cover empty and unknown eligibility, successful completion with deterministic review dates and nested rewards, late rollback, and concurrent plus repeated completion. Ordinary unit runs intentionally skip the guarded suite when the owned environment is absent. Skips must not be counted as passing database regressions or added to a distinct passing-test total.

The ordinary unit command passed twenty-three cases and skipped seventeen: the five separately verified completion cases and twelve C# runner cases. The accepted distinct total is twenty-eight when combined with the owned SQLite run. No C# runner verification is claimed for this change.

The first helper attempt stopped before schema setup because the installed Prisma package root resolved to a missing exported file. The helper now resolves prisma/package.json and invokes its declared build/index.js CLI. The next attempt reached the owned database but reported a generic schema-engine error. A diagnostic rerun enables RUST_LOG=info; this setting alone does not establish the underlying cause or prove any test passed.

The diagnostic run initialized SQLite and passed four cases, but the concurrent case exceeded Prisma's default five-second transaction timeout by 164 milliseconds. The fixture now injects its own PrismaClient with sixty-second transaction and acquisition limits, and its runner allows ninety seconds per case. Application defaults and durable-state assertions are unchanged. Accepted results therefore establish atomicity under those test limits, not a production latency bound or unlimited contention tolerance.

The transaction assertions use actual SQLite through Prisma. They do not establish PostgreSQL behavior, a remote code-runner result, browser UI recovery, or learning mastery. The helper's fixed fixture isolates award semantics from the application's regular learner database, which is never used for destructive test cleanup.

Type checking complements behavioral evidence by verifying the added client parameters and action result shape. It cannot prove atomicity by itself. Failed installation, generation, or test attempts remain in the campaign history rather than being rewritten as successes. Original snapshots and the source-linked exercises allow review of the transaction change without discarding earlier project work. The bounded contention policy remains a local retry strategy, not a guarantee that every overloaded environment will eventually succeed.

## Source excerpt

From [scripts/test-completion-local.mjs](../scripts/test-completion-local.mjs).

```mjs
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scratch = await mkdtemp(path.join(tmpdir(), "skillforge-completion-"));
const databasePath = path.join(scratch, "test.db").replaceAll("\\", "/");
const env = { ...process.env, DATABASE_URL: `file:${databasePath}`, SKILLFORGE_COMPLETION_TEST_DB: databasePath, NODE_ENV: "test" };
const require = createRequire(import.meta.url);

function run(entry, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [entry, ...args], { cwd: root, env, stdio: "inherit", windowsHide: true });
    child.once("error", reject);
    child.once("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${args.join(" ")} exited ${code}`))));
  });
}

try {
  const prismaRoot = path.dirname(require.resolve("prisma/package.json"));
  await run(path.join(prismaRoot, "build/index.js"), ["db", "push", "--skip-generate"]);
  await run(path.join(path.dirname(require.resolve("vitest/package.json")), "vitest.mjs"), ["run", "tests/unit/completion.test.ts", "--maxWorkers=1", "--minWorkers=1", "--testTimeout=90000", "--hookTimeout=90000"]);
} finally {
  const resolved = path.resolve(scratch);
  if (path.dirname(resolved) !== path.resolve(tmpdir()) || !path.basename(resolved).startsWith("skillforge-completion-")) {
    throw new Error("Refusing to remove unexpected temporary directory");
  }
  await rm(resolved, { recursive: true, force: true });
}
```

## Course navigation

[README](README.md) / [01-CODEBASE-MAP](01-CODEBASE-MAP.md) / [02-CONCEPTS](02-CONCEPTS.md) / [03-WORKED-CHANGE](03-WORKED-CHANGE.md) / [04-TESTING-AND-DEBUGGING](04-TESTING-AND-DEBUGGING.md) / [05-PRACTICE](05-PRACTICE.md) / [06-SOLUTIONS-AND-REVIEW](06-SOLUTIONS-AND-REVIEW.md) / [07-TRACE-LAB](07-TRACE-LAB.md) / [VERIFICATION](VERIFICATION.md)

## Recorded command evidence

The accepted test evidence covers **28 distinct passing tests**. The commands below define the verified scope; repeated targeted runs do not increase the count.

| Check | Recorded command | Exit | Evidence |
|---|---|---:|---|
| `astra-skillforge-completion-r4` | `["node", "scripts/test-completion-local.mjs"]` | 0 | [record](evidence/astra-skillforge-completion-r4.json), [log](evidence/astra-skillforge-completion-r4.log) |
| `astra-skillforge-tests-r2` | `["node", "C:/Program Files/nodejs/node_modules/corepack/dist/pnpm.js", "run", "test", "--maxWorkers=1", "--minWorkers=1", "--testTimeout=60000", "--hookTimeout=60000"]` | 0 | [record](evidence/astra-skillforge-tests-r2.json), [log](evidence/astra-skillforge-tests-r2.log) |
| `astra-skillforge-typecheck-r1` | `["node", "C:/Program Files/nodejs/node_modules/corepack/dist/pnpm.js", "run", "typecheck"]` | 0 | [record](evidence/astra-skillforge-typecheck-r1.json), [log](evidence/astra-skillforge-typecheck-r1.log) |
