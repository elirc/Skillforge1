import { compileTypeScript } from "@/lib/sandbox/typescript-compiler";
import { runCodeInNodeWorker } from "@/lib/sandbox/node-runner";
import { runCsharp } from "@/lib/sandbox/dotnet-host";
import { runSqlInNode } from "../../scripts/lib/sql-runner";
import { runReactInNode } from "../../scripts/lib/react-runner";
import { SandboxCompileError, successfulTypeCheck, type SandboxRequest, type SandboxResponse } from "@/lib/sandbox/shared";

export async function gradeCode(request: SandboxRequest, language: string): Promise<SandboxResponse> {
  if (request.code.length > 50_000) throw new Error("Submission is too long.");
  if (language === "react") return runReactInNode(request);
  if (language === "csharp") {
    const result = await runCsharp(request);
    if (result.compileErrors?.length) throw new SandboxCompileError(result.compileErrors);
    return result;
  }
  if (language === "sql") return runSqlInNode(request);
  if (language === "typescript") {
    const compiled = compileTypeScript(request.code + (request.typeChecks ? `\n${request.typeChecks}` : ""));
    if (compiled.diagnostics.length) throw new SandboxCompileError(compiled.diagnostics);
    if (request.typeChecks) return successfulTypeCheck();
    request = { ...request, code: compiled.code };
  }
  return runCodeInNodeWorker(request);
}
