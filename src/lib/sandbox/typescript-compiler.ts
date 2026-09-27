import ts from "typescript";
import { resolve } from "node:path";
import type { CompileDiagnostic } from "./shared";

// Library declarations are immutable across submissions. Reuse their parsed
// syntax trees instead of repeatedly reading/parsing DOM + ES libraries.
const librarySources = new Map<string, ts.SourceFile>();

/** Real semantic checking, including the standard library, before execution. */
export function compileTypeScript(code: string): { code: string; diagnostics: CompileDiagnostic[] } {
  const filename = resolve("__skillforge_submission__.ts").replaceAll("\\", "/");
  const source = ts.createSourceFile(filename, `${code}\nexport {};`, ts.ScriptTarget.ES2022, true);
  if (source.statements.some(node => ts.isImportDeclaration(node) || ts.isImportEqualsDeclaration(node) || (ts.isExportDeclaration(node) && node.moduleSpecifier))) {
    return { code: "", diagnostics: [{ id: "SF001", line: 1, column: 1, message: "Exercises are self-contained. External imports are not available." }] };
  }
  const options: ts.CompilerOptions = { strict: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, lib: ["lib.es2022.d.ts", "lib.dom.d.ts"], types: [], skipLibCheck: true };
  const host = ts.createCompilerHost(options);
  const originalGet = host.getSourceFile.bind(host);
  host.getSourceFile = (name, languageVersion, onError, shouldCreate) => {
    const normalized = name.replaceAll("\\", "/");
    if (normalized === filename) return source;
    const standardLibrary = normalized.includes("/typescript/lib/") && normalized.endsWith(".d.ts");
    if (standardLibrary && librarySources.has(normalized)) return librarySources.get(normalized);
    const result = originalGet(name, languageVersion, onError, shouldCreate);
    if (standardLibrary && result) librarySources.set(normalized, result);
    return result;
  };
  let emitted = "";
  host.writeFile = (name, data) => { if (name.endsWith(".js")) emitted = data; };
  const program = ts.createProgram([filename], options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program).filter(d => d.category === ts.DiagnosticCategory.Error).map(d => {
    const position = d.file?.getLineAndCharacterOfPosition(d.start ?? 0);
    return { id: `TS${d.code}`, message: ts.flattenDiagnosticMessageText(d.messageText, "\n"), line: (position?.line ?? 0) + 1, column: (position?.character ?? 0) + 1 };
  });
  if (!diagnostics.length) program.emit();
  return { code: emitted.replace(/^export\s+\{\s*\};?\s*$/gm, "").replace(/^export\s+(default\s+)?/gm, ""), diagnostics };
}
