import { Worker } from "node:worker_threads";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { SandboxRequest, SandboxResponse } from "../../src/lib/sandbox/shared";

export function runSqlInNode(request: SandboxRequest, timeoutMs = 10_000): Promise<SandboxResponse> {
  const require = createRequire(import.meta.url);
  const script = readFileSync(resolve("public/sql-worker.js"), "utf8").replace('importScripts("/runtimes/sql-wasm.js");', "").replace('initSqlJs({ locateFile: name => `/runtimes/${name}` })', "initSqlJs()");
  return new Promise((resolveResult, reject) => {
    const worker = new Worker(`const {parentPort,workerData}=require('node:worker_threads'); const initSqlJs=require(${JSON.stringify(require.resolve("sql.js"))}); const self={postMessage:value=>parentPort.postMessage(value)}; ${script}; self.onmessage({data:workerData});`, { eval: true, workerData: request });
    const timer = setTimeout(() => { void worker.terminate(); reject(new Error("SQL execution timed out.")); }, timeoutMs);
    worker.once("message", data => { clearTimeout(timer); void worker.terminate(); if (data.error) reject(new Error(data.error)); else resolveResult(data.response); });
    worker.once("error", error => { clearTimeout(timer); void worker.terminate(); reject(error); });
  });
}
