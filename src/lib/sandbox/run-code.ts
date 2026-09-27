"use client";

import { runCodeInWorker } from "@/lib/sandbox/client-runner";
import { runSqlInWorker } from "@/lib/sandbox/sql-client";
import { runReactInFrame } from "@/lib/sandbox/react-client";
import {
  SandboxCompileError,
  runtimeForLanguage,
  successfulTypeCheck,
  type CompileDiagnostic,
  type SandboxRequest,
  type SandboxResponse,
} from "@/lib/sandbox/shared";

export interface CodeRunOutcome {
  response: SandboxResponse;
  /** Bounded console output from the selected runtime. */
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
export async function runCode(request: SandboxRequest, language: string | null | undefined, preview?: HTMLElement | null): Promise<CodeRunOutcome> {
  if (language === "react") return { response: await runReactInFrame(request, preview), stdout: null };
  if (runtimeForLanguage(language) === "sql") return { response: await runSqlInWorker(request), stdout: null };
  if (runtimeForLanguage(language) === "csharp") {
    return runCsharpOnServer(request);
  }

  if (runtimeForLanguage(language) === "typescript") {
    const response = await fetch("/api/sandbox/typescript", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: request.code + (request.typeChecks ? `\n${request.typeChecks}` : "") }) });
    const compiled = await response.json();
    if (!response.ok) throw new Error(compiled.error ?? "TypeScript compilation failed.");
    if (compiled.diagnostics?.length) throw new SandboxCompileError(compiled.diagnostics);
    if (request.typeChecks) return { response: successfulTypeCheck(), stdout: null };
    request = { ...request, code: compiled.code };
  }
  const response = await runCodeInWorker(request);
  return { response, stdout: response.stdout ?? null };
}
