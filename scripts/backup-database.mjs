import { DatabaseSync } from "node:sqlite";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const source = path.resolve(process.argv[2] ?? "data/skillforge.db");
const directory = path.resolve("data/backups");
await mkdir(directory, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const target = path.join(directory, `skillforge-${stamp}.db`);
const db = new DatabaseSync(source, { readOnly: true });
try {
  db.prepare("VACUUM INTO ?").run(target);
  const copy = new DatabaseSync(target, { readOnly: true });
  try {
    const tables = [
      "User",
      "Progress",
      "LessonCompletion",
      "ReviewState",
      "Attempt",
      "ProblemSubmission",
      "XpEvent",
      "Quest",
      "UserAchievement",
    ];
    const snapshot = Object.fromEntries(
      tables.map((table) => [
        table,
        copy.prepare(`SELECT * FROM "${table}" ORDER BY id`).all(),
      ]),
    );
    await writeFile(
      target + ".progress.json",
      JSON.stringify(snapshot, null, 2),
    );
    console.log(
      JSON.stringify({
        backup: target,
        rows: Object.fromEntries(
          Object.entries(snapshot).map(([key, rows]) => [key, rows.length]),
        ),
      }),
    );
  } finally {
    copy.close();
  }
} finally {
  db.close();
}
