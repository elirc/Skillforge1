import { Worker } from "node:worker_threads";
import { buildHarnessSource, type SandboxRequest, type SandboxResponse } from "@/lib/sandbox/shared";

/**
 * `timeoutMs` is the budget for the learner's *code*, so the clock does not
 * start until the worker reports `online`. Spawning a Node worker costs
 * ~1s on a cold Windows machine, which would otherwise eat the whole budget
 * and time out correct solutions.
 */
export function runCodeInNodeWorker(request: SandboxRequest, timeoutMs = 2000, spawnTimeoutMs = 30_000) {
  return new Promise<SandboxResponse>((resolve, reject) => {
    const worker = new Worker(
      `
        const { parentPort } = require("node:worker_threads");
        try {
          const response = ${buildHarnessSource(request)};
          parentPort.postMessage({ ok: true, response });
        } catch (error) {
          parentPort.postMessage({ ok: false, error: error instanceof Error ? error.message : String(error) });
        }
      `,
      { eval: true },
    );

    let settled = false;
    let timer: NodeJS.Timeout = setTimeout(() => {
      void worker.terminate();
      reject(new Error("Sandbox failed to start."));
    }, spawnTimeoutMs);

    const settle = (finish: () => void) => {
      settled = true;
      clearTimeout(timer);
      void worker.terminate();
      finish();
    };

    worker.on("online", () => {
      // `online` can in principle arrive after an immediate error; arming a
      // fresh timer then would hold the event loop open for `timeoutMs`.
      if (settled) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        void worker.terminate();
        reject(new Error("Execution timed out."));
      }, timeoutMs);
    });

    worker.on("message", (message: { ok: boolean; response?: SandboxResponse; error?: string }) => {
      settle(() => {
        if (message.ok && message.response) {
          resolve(message.response);
        } else {
          reject(new Error(message.error ?? "Sandbox failed."));
        }
      });
    });

    worker.on("error", (error) => {
      settle(() => reject(error));
    });
  });
}
