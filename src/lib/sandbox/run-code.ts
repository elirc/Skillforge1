"use client";

import { runCodeInWorker } from "@/lib/sandbox/client-runner";
import {
  SandboxCompileError,
  runtimeForLanguage,
  type CompileDiagnostic,
  type SandboxRequest,
  type SandboxResponse,
} from "@/lib/sandbox/shared";

export interface CodeRunOutcome {
  response: SandboxResponse;
  /** Anything the learner printed. C# only; the JavaScript harness captures nothing. */
  stdout: string | null;
}

interface CsharpPayload {
  ok: boolean;
  kind?: string;
  response?: SandboxResponse;
  stdout?: string | null;
  diagnostics?: CompileDiagnostic[];
  error?: string;
}

async function runCsharpOnServer(request: SandboxRequest): Promise<CodeRunOutcome> {
  const response = await fetch("/api/sandbox/csharp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  });

  const payload = (await response.json()) as CsharpPayload;

  if (payload.kind === "compile" && payload.diagnostics) {
    throw new SandboxCompileError(payload.diagnostics);
  }

  if (!response.ok || !payload.ok || !payload.response) {
    throw new Error(payload.error ?? "The C# runner failed.");
  }

  return { response: payload.response, stdout: payload.stdout ?? null };
}

/**
 * Runs a submission with the runtime its language needs: the in-browser worker
 * for JavaScript, the .NET host behind an API route for C#.
 */
export async function runCode(request: SandboxRequest, language: string | null | undefined): Promise<CodeRunOutcome> {
  if (runtimeForLanguage(language) === "csharp") {
    return runCsharpOnServer(request);
  }

  return { response: await runCodeInWorker(request), stdout: null };
}
