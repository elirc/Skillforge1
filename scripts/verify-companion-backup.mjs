import { DatabaseSync } from "node:sqlite";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, dirname, basename } from "node:path";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
const directory=await mkdtemp(join(tmpdir(),"inventory-backup-check-"));
const target=join(directory,"inventory.db");const backups=join(directory,"backups");
const env={...process.env,Inventory__DatabasePath:target,INVENTORY_BACKUP_DIRECTORY:backups};
try {
  let db=new DatabaseSync(target);db.exec("CREATE TABLE Users (Id TEXT PRIMARY KEY); CREATE TABLE Products (Id INTEGER PRIMARY KEY, Stock INTEGER); INSERT INTO Users VALUES ('fixture'); INSERT INTO Products VALUES (1,7);");db.close();
  execFileSync(process.execPath,["projects/inventory-desk/scripts/database.mjs","backup"],{env,stdio:"inherit",windowsHide:true});
  const source=join(backups,(await readdir(backups))[0]);db=new DatabaseSync(target);db.exec("UPDATE Products SET Stock = 0");db.close();
  execFileSync(process.execPath,["projects/inventory-desk/scripts/database.mjs","restore",source,"--server-stopped"],{env,stdio:"inherit",windowsHide:true});
  db=new DatabaseSync(target);assert.equal(db.prepare("SELECT Stock FROM Products").get().Stock,7);assert.equal(db.prepare("PRAGMA integrity_check").get().integrity_check,"ok");db.close();
  assert.equal((await readdir(backups)).length,2);console.log("Companion backup, restore, and pre-restore recovery copy verified.");
} finally { if(dirname(resolve(directory))!==resolve(tmpdir())||!basename(directory).startsWith("inventory-backup-check-"))throw new Error("Unexpected directory");await rm(directory,{recursive:true,force:true}); }
