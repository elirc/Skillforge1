"use client";

import type { SandboxRequest, SandboxResponse } from "@/lib/sandbox/shared";

type WorkerMessage =
  | { ready: true }
  | { ok: true; response: SandboxResponse }
  | { ok: false; error: string };

/**
 * `timeoutMs` is the budget for the learner's *code*. The clock does not start
 * until the worker reports `ready`, because loading the worker module on a cold
 * page can take longer than the budget itself and would otherwise time out a
 * correct solution.
 */
export function runCodeInWorker(request: SandboxRequest, timeoutMs = 2000, spawnTimeoutMs = 30_000) {
  return new Promise<SandboxResponse>((resolve, reject) => {
    const worker = new Worker(new URL("./browser-worker.ts", import.meta.url), { type: "module" });

    let settled = false;
    let timer = window.setTimeout(() => {
      worker.terminate();
      reject(new Error("Sandbox failed to start."));
    }, spawnTimeoutMs);

    const settle = (finish: () => void) => {
      settled = true;
      window.clearTimeout(timer);
      worker.terminate();
      finish();
    };

    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;

      if ("ready" in message) {
        if (settled) return;
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          worker.terminate();
          reject(new Error("Execution timed out."));
        }, timeoutMs);
        return;
      }

      settle(() => {
        if (message.ok) {
          resolve(message.response);
        } else {
          reject(new Error(message.error));
        }
      });
    };

    worker.onerror = (event) => {
      settle(() => reject(new Error(event.message)));
    };

    worker.postMessage(request);
  });
}
