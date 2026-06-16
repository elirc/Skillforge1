import { Worker } from "node:worker_threads";
import { buildHarnessSource, type SandboxRequest, type SandboxResponse } from "@/lib/sandbox/shared";

export function runCodeInNodeWorker(request: SandboxRequest, timeoutMs = 2000) {
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

    const timeout = setTimeout(() => {
      void worker.terminate();
      reject(new Error("Execution timed out."));
    }, timeoutMs);

    worker.on("message", (message: { ok: boolean; response?: SandboxResponse; error?: string }) => {
      clearTimeout(timeout);
      void worker.terminate();
      if (message.ok && message.response) {
        resolve(message.response);
      } else {
        reject(new Error(message.error ?? "Sandbox failed."));
      }
    });

    worker.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}
