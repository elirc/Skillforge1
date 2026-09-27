import ts from "typescript";
export function compileReact(code: string) {
  const source = ts.createSourceFile("exercise.tsx", code, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX);
  if (source.statements.some(node => ts.isImportDeclaration(node))) throw new Error("React and its hooks are already provided. Omit module imports in this lab.");
  const result = ts.transpileModule(code, { fileName: "exercise.tsx", reportDiagnostics: true, compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } });
  const errors = result.diagnostics?.filter(diagnostic => diagnostic.category === ts.DiagnosticCategory.Error) ?? [];
  if (errors.length) throw new Error(errors.map(error => ts.flattenDiagnosticMessageText(error.messageText, "\n")).join("\n"));
  return result.outputText.replace(/^export\s+\{\s*\};?\s*$/gm, "").replace(/^export\s+(default\s+)?/gm, "");
}
