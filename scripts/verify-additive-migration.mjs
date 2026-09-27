import { mkdtemp, copyFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, dirname, basename } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";

const backup = resolve(process.argv[2] ?? "data/backups/skillforge-2026-09-27T01-19-42-005Z.db");
const directory = await mkdtemp(join(tmpdir(), "skillforge-migration-"));
const copy = join(directory, "test.db");
try {
  await copyFile(backup, copy);
  execFileSync(process.execPath, ["scripts/migrate-content-identity.mjs", copy], { stdio: "inherit", windowsHide: true });
  execFileSync(process.execPath, ["scripts/migrate-content-identity.mjs", copy], { stdio: "inherit", windowsHide: true });
  const baseline = JSON.parse(await readFile(`${backup}.progress.json`, "utf8"));
  const db = new DatabaseSync(copy, { readOnly: true });
  const tables = baseline.tables ?? baseline;
  for (const [table, rows] of Object.entries(tables)) {
    if (!Array.isArray(rows)) continue;
    const current = db.prepare(`SELECT * FROM "${table}" ORDER BY id`).all();
    assert.equal(current.length, rows.length, `${table}: row count`);
    for (let i = 0; i < rows.length; i++) for (const [key, value] of Object.entries(rows[i])) assert.deepEqual(current[i][key], value, `${table}:${rows[i].id}.${key}`);
  }
  assert.equal(db.prepare("PRAGMA integrity_check").get().integrity_check, "ok");
  db.close();
  console.log("Additive migration is repeatable; all original learner values and database integrity are preserved.");
} finally {
  if (dirname(resolve(directory)) !== resolve(tmpdir()) || !basename(directory).startsWith("skillforge-migration-")) throw new Error("Unexpected test directory");
  await rm(directory, { recursive: true, force: true });
}
