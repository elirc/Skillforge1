"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { defaultKeymap } from "@codemirror/commands";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";
import { Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { editorLanguage } from "@/lib/sandbox/editor-language";
import { runCode } from "@/lib/sandbox/run-code";
import {
  SandboxCompileError,
  runtimeForLanguage,
  type CompileDiagnostic,
  type SandboxResponse,
  type SandboxTest,
} from "@/lib/sandbox/shared";
import { recordProblemSubmissionAction } from "@/server/problems";
import { useRewardStore } from "@/store/reward-store";

export function ProblemRunner({
  problemId,
  starterCode,
  functionName,
  tests,
  language,
}: {
  problemId: string;
  starterCode: string;
  functionName: string;
  tests: SandboxTest[];
  language?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const startedAtRef = useRef(0);
  const [result, setResult] = useState<SandboxResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [compileErrors, setCompileErrors] = useState<CompileDiagnostic[] | null>(null);
  const [stdout, setStdout] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const celebrate = useRewardStore((state) => state.celebrate);
  const isCsharp = runtimeForLanguage(language) === "csharp";

  useEffect(() => {
    if (!containerRef.current || viewRef.current) return;
    const state = EditorState.create({
      doc: starterCode,
      extensions: [keymap.of(defaultKeymap), editorLanguage(language), oneDark, EditorView.lineWrapping],
    });
    viewRef.current = new EditorView({ state, parent: containerRef.current });
    startedAtRef.current = Date.now();
    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, [language, starterCode]);

  function run() {
    const code = viewRef.current?.state.doc.toString() ?? starterCode;
    setError(null);
    setCompileErrors(null);
    setStdout(null);
    startTransition(async () => {
      try {
        const outcome = await runCode({ code, functionName, tests }, language);
        const response = outcome.response;
        setResult(response);
        setStdout(outcome.stdout);
        const summary = await recordProblemSubmissionAction({
          problemId,
          code,
          passed: response.passed,
          durationMs: Date.now() - startedAtRef.current,
        });
        celebrate(summary);
      } catch (runError) {
        // A submission that never compiled is not a failing test.
        if (runError instanceof SandboxCompileError) {
          setResult(null);
          setCompileErrors(runError.diagnostics);
          return;
        }
        setError(runError instanceof Error ? runError.message : String(runError));
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950 text-sm" ref={containerRef} />
      <div className="flex gap-2">
        <Button type="button" onClick={run} disabled={isPending}>
          <Play className="h-4 w-4" />
          {isPending && isCsharp ? "Compiling..." : "Run"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            viewRef.current?.dispatch({
              changes: { from: 0, to: viewRef.current.state.doc.length, insert: starterCode },
            });
            startedAtRef.current = Date.now();
            setResult(null);
            setCompileErrors(null);
            setStdout(null);
            setError(null);
          }}
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>
      {error ? <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-200">{error}</p> : null}
      {compileErrors?.length ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950">
          <strong className="text-amber-900 dark:text-amber-200">Build failed</strong>
          <ul className="mt-2 space-y-1">
            {compileErrors.map((diagnostic, index) => (
              <li key={`${diagnostic.id}-${index}`} className="font-mono text-xs text-amber-900 dark:text-amber-200">
                {diagnostic.id} &middot; line {diagnostic.line}:{diagnostic.column} &middot; {diagnostic.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {stdout ? (
        <details className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
          <summary className="cursor-pointer text-slate-600 dark:text-slate-300">Console output</summary>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs text-slate-700 dark:text-slate-300">{stdout}</pre>
        </details>
      ) : null}
      {result ? (
        <div className="space-y-2">
          {result.results
            .filter((test) => !test.hidden || result.passed)
            .map((test) => (
              <div
                key={test.name}
                className={`rounded-md border p-3 text-sm ${
                  test.passed
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                    : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
                }`}
              >
                <strong>{test.passed ? "Pass" : "Fail"}:</strong> {test.name}
                {!test.passed ? (
                  <span className="block text-xs">
                    {/* The harness explains itself when the code never returned
                        a value -- an exception, a timeout, a bad signature. */}
                    {test.error ?? `expected ${JSON.stringify(test.expected)}, got ${JSON.stringify(test.actual)}`}
                  </span>
                ) : null}
              </div>
            ))}
        </div>
      ) : null}
    </div>
  );
}
