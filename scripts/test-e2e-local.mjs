import { mkdtemp, copyFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { DatabaseSync } from "node:sqlite";
const require=createRequire(import.meta.url);
const directory=await mkdtemp(path.join(tmpdir(),"skillforge-browser-"));
const database=path.join(directory,"test.db");
const env={...process.env,DATABASE_URL:`file:${database.replaceAll("\\","/")}`,SKILLFORGE_E2E_TEST_DB:database,SKILLFORGE_E2E_PORT:"3107",SKILLFORGE_E2E_PRODUCTION:process.argv.includes("--production")?"1":process.env.SKILLFORGE_E2E_PRODUCTION??"0"};
function run(entry,args) { return new Promise((resolve,reject)=>{ const child=spawn(process.execPath,[entry,...args],{env,stdio:"inherit",windowsHide:true});child.once("error",reject);child.once("exit",code=>code===0?resolve():reject(new Error(`${entry} exited ${code}`))); }); }
try {
  if(process.argv[2]) await copyFile(path.resolve(process.argv[2]),database);
  else { const db=new DatabaseSync(path.resolve("data/skillforge.db"),{readOnly:true});try{db.prepare("VACUUM INTO ?").run(database);}finally{db.close();} }
  await run("scripts/migrate-content-identity.mjs",[database]);
  // Seed this isolated copy, never the learner's working database.
  await run(require.resolve("tsx/cli"),["prisma/seed.ts"]);
  await run(require.resolve("@playwright/test/cli"),["test",...process.argv.slice(3).filter(arg=>arg!=="--production")]);
} finally {
  if(path.dirname(path.resolve(directory))!==path.resolve(tmpdir())||!path.basename(directory).startsWith("skillforge-browser-"))throw new Error("Unexpected browser fixture directory");
  await rm(directory,{recursive:true,force:true,maxRetries:5,retryDelay:500});
}
