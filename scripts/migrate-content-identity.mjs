import { DatabaseSync } from "node:sqlite";
import { resolve } from "node:path";
import { existsSync } from "node:fs";

const path = resolve(process.argv[2] ?? "data/skillforge.db");
if (!existsSync(path)) throw new Error(`Database does not exist: ${path}. Use db:setup for a new installation.`);
const db = new DatabaseSync(path);
db.exec("PRAGMA busy_timeout=30000; BEGIN IMMEDIATE");
try {
  const additions = {
    User: { dailyMinutes: "INTEGER NOT NULL DEFAULT 15" },
    Course: { prerequisites: "TEXT NOT NULL DEFAULT '[]'", version: "TEXT NOT NULL DEFAULT '1'", archived: "BOOLEAN NOT NULL DEFAULT 0" },
    Module: { contentKey: "TEXT", archived: "BOOLEAN NOT NULL DEFAULT 0" },
    Lesson: { contentKey: "TEXT", archived: "BOOLEAN NOT NULL DEFAULT 0", estimatedMinutes: "INTEGER NOT NULL DEFAULT 10", prerequisites: "TEXT NOT NULL DEFAULT '[]'" },
    KnowledgeItem: { contentKey: "TEXT", archived: "BOOLEAN NOT NULL DEFAULT 0" },
    Problem: { archived: "BOOLEAN NOT NULL DEFAULT 0" },
    LessonCompletion: { assisted: "BOOLEAN NOT NULL DEFAULT 0" },
    ProblemSubmission: { assisted: "BOOLEAN NOT NULL DEFAULT 0" },
  };
  for (const [table, fields] of Object.entries(additions)) {
    const columns = new Set(db.prepare(`PRAGMA table_info("${table}")`).all().map(row => row.name));
    for (const [field, type] of Object.entries(fields)) if (!columns.has(field)) db.exec(`ALTER TABLE "${table}" ADD COLUMN "${field}" ${type}`);
    if ("contentKey" in fields) db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS "${table}_contentKey_key" ON "${table}" ("contentKey")`);
  }
  db.exec('CREATE TABLE IF NOT EXISTS "AppMetadata" ("key" TEXT NOT NULL PRIMARY KEY, "value" TEXT NOT NULL, "updatedAt" DATETIME NOT NULL)');
  db.exec("COMMIT");
  console.log(`Migrated content identity without replacing learner rows: ${path}`);
} catch (error) { db.exec("ROLLBACK"); throw error; } finally { db.close(); }
