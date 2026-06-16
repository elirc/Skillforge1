"use client";

import type { SandboxRequest, SandboxResponse } from "@/lib/sandbox/shared";

type WorkerMessage =
  | { ok: true; response: SandboxResponse }
  | { ok: false; error: string };

export function runCodeInWorker(request: SandboxRequest, timeoutMs = 2000) {
  return new Promise<SandboxResponse>((resolve, reject) => {
    const worker = new Worker(new URL("./browser-worker.ts", import.meta.url), { type: "module" });
    const timeout = window.setTimeout(() => {
      worker.terminate();
      reject(new Error("Execution timed out."));
    }, timeoutMs);

    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      window.clearTimeout(timeout);
      worker.terminate();
      if (event.data.ok) {
        resolve(event.data.response);
      } else {
        reject(new Error(event.data.error));
      }
    };

    worker.onerror = (event) => {
      window.clearTimeout(timeout);
      worker.terminate();
      reject(new Error(event.message));
    };

    worker.postMessage(request);
  });
}
