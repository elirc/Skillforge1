import type { SandboxRequest, SandboxResponse } from "./shared";
export function runSqlInWorker(request: SandboxRequest, timeoutMs = 10_000): Promise<SandboxResponse> {
  return new Promise((resolve, reject) => {
    const worker = new Worker("/sql-worker.js");
    const timer = setTimeout(() => { worker.terminate(); reject(new Error("SQL execution timed out. Check recursive queries and joins.")); }, timeoutMs);
    const finish = () => { clearTimeout(timer); worker.terminate(); };
    worker.onmessage = ({ data }) => { finish(); if (data.error) reject(new Error(data.error)); else resolve(data.response); };
    worker.onerror = () => { finish(); reject(new Error("SQLite could not load. Restart the app to prepare the local runtime assets.")); };
    worker.postMessage(request);
  });
}
