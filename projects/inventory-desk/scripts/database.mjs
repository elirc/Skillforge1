import { DatabaseSync } from "node:sqlite";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, copyFile, access } from "node:fs/promises";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dbPath = process.env.Inventory__DatabasePath ? resolve(process.env.Inventory__DatabasePath) : resolve(root, "InventoryDesk.Api/data/inventory.db");
const backupDir = process.env.INVENTORY_BACKUP_DIRECTORY ? resolve(process.env.INVENTORY_BACKUP_DIRECTORY) : resolve(root, "backups");
const command = process.argv[2];
await mkdir(backupDir, { recursive: true });
if (command === "backup") {
  const target = resolve(backupDir, `inventory-${new Date().toISOString().replace(/[:.]/g,"-")}.db`);
  const db = new DatabaseSync(dbPath, { readOnly: true });
  try { db.prepare("VACUUM INTO ?").run(target); console.log(`Consistent backup: ${target}`); } finally { db.close(); }
} else if (command === "restore") {
  if (!process.argv[3] || !process.argv.includes("--server-stopped")) throw new Error("Stop Inventory Desk, then run: npm run restore -- <backup.db> --server-stopped");
  const source = resolve(process.argv[3]);
  const db = new DatabaseSync(source, { readOnly: true });
  try { if (db.prepare("PRAGMA integrity_check").get().integrity_check !== "ok") throw new Error("Backup integrity check failed."); db.prepare("SELECT COUNT(*) FROM Products").get(); db.prepare("SELECT COUNT(*) FROM Users").get(); } finally { db.close(); }
  await mkdir(dirname(dbPath), { recursive: true });
  try { await access(dbPath); await copyFile(dbPath, resolve(backupDir, `before-restore-${Date.now()}.db`)); } catch (error) { if (error.code !== "ENOENT") throw error; }
  for (const suffix of ["-wal", "-shm"]) { try { await access(dbPath + suffix); throw new Error("A SQLite sidecar exists. Shut down the server cleanly before restoring."); } catch (error) { if (error.code !== "ENOENT") throw error; } }
  await copyFile(source, dbPath); console.log(`Restored ${source}. Restart Inventory Desk and sign in again.`);
} else throw new Error("Use backup or restore.");
