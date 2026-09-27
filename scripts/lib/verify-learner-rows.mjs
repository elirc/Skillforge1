import { readFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

export async function compareLearnerRows(database, backup) {
  const baseline = JSON.parse(
    await readFile(`${backup}.progress.json`, "utf8"),
  );
  const db = new DatabaseSync(database, { readOnly: true });
  try {
    for (const [table, rows] of Object.entries(baseline)) {
      const current = db.prepare(`SELECT * FROM "${table}" ORDER BY id`).all();
      assert.equal(current.length, rows.length, `${table} row count`);
      for (let i = 0; i < rows.length; i++) {
        for (const [key, value] of Object.entries(rows[i])) {
          assert.deepEqual(
            current[i][key],
            value,
            `${table}:${rows[i].id}.${key}`,
          );
        }
      }
    }
    assert.equal(
      db.prepare("PRAGMA integrity_check").get().integrity_check,
      "ok",
    );
    assert.equal(db.prepare("PRAGMA foreign_key_check").all().length, 0);
    return Object.fromEntries(
      ["Course", "Lesson", "Problem"].map((table) => [
        table,
        db
          .prepare(`SELECT COUNT(*) AS count FROM "${table}" WHERE archived=0`)
          .get().count,
      ]),
    );
  } finally {
    db.close();
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  if (!process.argv[2] || !process.argv[3])
    throw new Error(
      "Usage: node scripts/lib/verify-learner-rows.mjs <database> <backup-with-progress-snapshot>",
    );
  console.log(
    "Original learner values preserved; integrity and foreign keys valid:",
    await compareLearnerRows(
      resolve(process.argv[2]),
      resolve(process.argv[3]),
    ),
  );
}
