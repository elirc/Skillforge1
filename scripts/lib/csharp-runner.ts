/**
 * Build-time driver for the .NET runner, used by `validate:content`.
 *
 * The app talks to the same process through `src/lib/sandbox/dotnet-host.ts`,
 * but that module is server-only and Next-flavoured. This is the plain Node
 * version: start one host, run every C# exercise through it, shut it down.
 */
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";
import type { SandboxTest } from "../../src/lib/sandbox/shared";

const RUNNER_DLL = join(
  process.cwd(),
  "tools",
  "csharp-runner",
  "bin",
  "Release",
  "net10.0",
  "skillforge-csharp-runner.dll",
);

export interface CsharpRunResult {
  name: string;
  passed: boolean;
  expected: unknown;
  actual: unknown;
  error: string | null;
}

export interface CsharpRunResponse {
  results: CsharpRunResult[];
  passed: boolean;
  compileErrors?: { id: string; message: string; line: number; column: number }[];
  timedOut?: boolean;
}

export function isCsharpRunnerBuilt(): boolean {
  return existsSync(RUNNER_DLL);
}

export class CsharpRunnerHost {
  private child: ChildProcessWithoutNullStreams | null = null;
  private queue: { resolve: (value: CsharpRunResponse) => void; reject: (error: Error) => void }[] = [];
  private ready: Promise<void> | null = null;

  async start(): Promise<void> {
    if (this.ready) return this.ready;

    if (!isCsharpRunnerBuilt()) {
      throw new Error(
        "The C# runner is not built. Run `npm run csharp:build` first, or set SKILLFORGE_SKIP_CSHARP=1 to skip C# content.",
      );
    }

    this.ready = new Promise<void>((resolve, reject) => {
      const child = spawn("dotnet", [RUNNER_DLL], { stdio: ["pipe", "pipe", "pipe"] });
      this.child = child;

      let stderr = "";
      child.stderr.on("data", (chunk) => {
        stderr = (stderr + String(chunk)).slice(-2000);
      });

      child.on("close", (code) => {
        const error = new Error(
          `The C# runner exited (code ${code}).${stderr.trim() ? ` ${stderr.trim().slice(0, 300)}` : ""}`,
        );
        this.child = null;
        // Also fails a start that never reached `ready`, so a missing runtime
        // reports an error instead of hanging the validator forever.
        reject(error);
        while (this.queue.length > 0) this.queue.shift()!.reject(error);
      });

      child.on("error", reject);

      createInterface({ input: child.stdout }).on("line", (line) => {
        if (!line) return;

        let message: { ready?: boolean; ok?: boolean; response?: CsharpRunResponse; error?: string };
        try {
          message = JSON.parse(line);
        } catch {
          return;
        }

        if (message.ready) {
          resolve();
          return;
        }

        const pending = this.queue.shift();
        if (!pending) return;

        if (message.ok && message.response) pending.resolve(message.response);
        else pending.reject(new Error(message.error ?? "The C# runner failed."));
      });
    });

    return this.ready;
  }

  async run(code: string, functionName: string, tests: SandboxTest[]): Promise<CsharpRunResponse> {
    await this.start();

    const child = this.child;
    if (!child) throw new Error("The C# runner is not running.");

    return new Promise<CsharpRunResponse>((resolve, reject) => {
      this.queue.push({ resolve, reject });
      child.stdin.write(`${JSON.stringify({ code, functionName, tests, executionTimeoutMs: 2000 })}\n`);
    });
  }

  stop() {
    this.child?.stdin.end();
    this.child?.kill();
    this.child = null;
    this.ready = null;
  }
}
