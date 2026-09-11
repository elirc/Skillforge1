import "server-only";

import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { createInterface, type Interface } from "node:readline";
import type { SandboxRequest } from "@/lib/sandbox/shared";

/**
 * Manages the long-lived .NET process that compiles and runs C# submissions.
 *
 * Roslyn's first compilation costs ~20s of JIT, so the host is started once and
 * kept warm; a process per submission would be unusable. Requests are framed as
 * one JSON object per line in each direction.
 *
 * Learner code runs inside that process with full trust, and .NET cannot abort a
 * runaway thread, so the host gives up on its own budget and exits. This module
 * owns a backstop deadline as well, and kills the process if no reply arrives.
 */

export interface DotnetCompileError {
  id: string;
  message: string;
  line: number;
  column: number;
}

export interface DotnetRunResult {
  name: string;
  passed: boolean;
  expected: unknown;
  actual: unknown;
  error: string | null;
  hidden: boolean;
}

export interface DotnetRunResponse {
  results: DotnetRunResult[];
  passed: boolean;
  compileErrors?: DotnetCompileError[];
  stdout?: string;
  timedOut?: boolean;
}

/** Budget for the learner's code. Compilation is deliberately not counted. */
const EXECUTION_TIMEOUT_MS = 2000;
/** Compile plus execute, measured on our side as a backstop. */
const REQUEST_TIMEOUT_MS = 20_000;
/** Roslyn JIT on a cold machine has been measured at ~22s. */
const START_TIMEOUT_MS = 90_000;
/** Collectible load contexts are not free; recycle rather than grow forever. */
const MAX_RUNS_PER_HOST = 200;

const RUNNER_DLL = join(
  process.cwd(),
  "tools",
  "csharp-runner",
  "bin",
  "Release",
  "net10.0",
  "skillforge-csharp-runner.dll",
);

export class DotnetUnavailableError extends Error {}

interface Pending {
  resolve: (value: DotnetRunResponse) => void;
  reject: (error: Error) => void;
  timer: NodeJS.Timeout;
}

class DotnetHost {
  private child: ChildProcessWithoutNullStreams | null = null;
  private reader: Interface | null = null;
  private starting: Promise<void> | null = null;
  private pending: Pending | null = null;
  private queue: Promise<unknown> = Promise.resolve();
  private runs = 0;

  private failStart: ((error: Error) => void) | null = null;

  private dispose(reason?: Error) {
    const pending = this.pending;
    this.pending = null;

    if (pending) {
      clearTimeout(pending.timer);
      pending.reject(reason ?? new Error("The C# runner stopped unexpectedly."));
    }

    // A process that dies during startup must reject the start promise too.
    // Without this every later request queues behind a promise that never
    // settles, and the app looks permanently stuck on "Compiling...".
    const failStart = this.failStart;
    this.failStart = null;
    failStart?.(reason ?? new Error("The C# runner stopped before it was ready."));

    this.reader?.close();
    this.reader = null;

    if (this.child) {
      this.child.removeAllListeners();
      this.child.kill();
      this.child = null;
    }

    this.starting = null;
    this.runs = 0;
  }

  private async start(): Promise<void> {
    if (this.child) return;
    if (this.starting) return this.starting;

    if (!existsSync(RUNNER_DLL)) {
      throw new DotnetUnavailableError(
        "The C# runner is not built. Run `npm run csharp:build` (requires the .NET SDK).",
      );
    }

    this.starting = new Promise<void>((resolve, reject) => {
      let child: ChildProcessWithoutNullStreams;
      try {
        child = spawn("dotnet", [RUNNER_DLL], { stdio: ["pipe", "pipe", "pipe"] });
      } catch {
        reject(new DotnetUnavailableError("Could not start `dotnet`. Is the .NET SDK installed and on PATH?"));
        return;
      }

      this.failStart = reject;

      const startTimer = setTimeout(() => {
        this.dispose(new Error("The C# runner did not start in time."));
      }, START_TIMEOUT_MS);

      // Bounded: learner code can write to stderr without limit.
      let stderr = "";
      child.stderr.on("data", (chunk) => {
        stderr = (stderr + String(chunk)).slice(-2000);
      });

      child.on("error", () => {
        clearTimeout(startTimer);
        this.dispose();
        reject(new DotnetUnavailableError("Could not start `dotnet`. Is the .NET SDK installed and on PATH?"));
      });

      // `close` rather than `exit`: the host flushes its last response and then
      // exits on purpose after a timeout, and `exit` can fire before readline
      // has delivered that line -- which would report a crash instead.
      child.on("close", () => {
        clearTimeout(startTimer);
        // A crash with a request in flight is how a stack overflow surfaces.
        this.dispose(new Error(stderr.trim() ? `The C# runner crashed: ${stderr.trim().slice(0, 300)}` : "The C# runner crashed."));
      });

      const reader = createInterface({ input: child.stdout });
      reader.on("line", (line) => {
        if (!line) return;
        this.handleLine(line, () => {
          clearTimeout(startTimer);
          this.failStart = null;
          resolve();
        });
      });

      this.child = child;
      this.reader = reader;
    });

    try {
      await this.starting;
    } finally {
      this.starting = null;
    }
  }

  private handleLine(line: string, onReady: () => void) {
    let message: { ready?: boolean; ok?: boolean; response?: DotnetRunResponse; error?: string };
    try {
      message = JSON.parse(line);
    } catch {
      return;
    }

    if (message.ready) {
      onReady();
      return;
    }

    const pending = this.pending;
    if (!pending) return;
    this.pending = null;
    clearTimeout(pending.timer);

    if (message.ok && message.response) {
      pending.resolve(message.response);
    } else {
      pending.reject(new Error(message.error ?? "The C# runner failed."));
    }
  }

  /** Stops the child process, if any. */
  shutdown() {
    this.dispose();
  }

  /** Requests are serialized: one learner, one submission at a time. */
  run(request: SandboxRequest): Promise<DotnetRunResponse> {
    const result = this.queue.then(() => this.runExclusive(request));
    this.queue = result.catch(() => undefined);
    return result;
  }

  private async runExclusive(request: SandboxRequest): Promise<DotnetRunResponse> {
    await this.start();

    const child = this.child;
    if (!child) throw new Error("The C# runner is not running.");

    const response = await new Promise<DotnetRunResponse>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending = null;
        // The host could not give up on its own; take it down and start fresh.
        this.dispose(new Error("Execution timed out."));
        reject(new Error("Execution timed out."));
      }, REQUEST_TIMEOUT_MS);

      this.pending = { resolve, reject, timer };
      child.stdin.write(
        `${JSON.stringify({
          code: request.code,
          functionName: request.functionName,
          tests: request.tests,
          executionTimeoutMs: EXECUTION_TIMEOUT_MS,
        })}\n`,
      );
    });

    this.runs += 1;
    // The host exits itself after a timeout; drop our handle to match.
    if (response.timedOut || this.runs >= MAX_RUNS_PER_HOST) {
      this.dispose();
    }

    return response;
  }
}

// Next's dev server re-evaluates modules on HMR. Without this the app would
// accumulate orphaned `dotnet` processes.
const globalForHost = globalThis as unknown as {
  skillforgeDotnetHost?: DotnetHost;
  skillforgeDotnetExitHook?: boolean;
};

export const dotnetHost = globalForHost.skillforgeDotnetHost ?? new DotnetHost();

if (process.env.NODE_ENV !== "production") {
  globalForHost.skillforgeDotnetHost = dotnetHost;
}

// Learner code can leave a foreground thread spinning, which keeps the runner
// alive after its parent goes away.
if (!globalForHost.skillforgeDotnetExitHook) {
  globalForHost.skillforgeDotnetExitHook = true;
  process.once("exit", () => dotnetHost.shutdown());
}

export function runCsharp(request: SandboxRequest): Promise<DotnetRunResponse> {
  return dotnetHost.run(request);
}
