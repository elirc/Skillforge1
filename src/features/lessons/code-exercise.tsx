"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { oneDark } from "@codemirror/theme-one-dark";
import { Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { editorLanguage } from "@/lib/sandbox/editor-language";
import { runCode } from "@/lib/sandbox/run-code";
import type { CodePayload } from "@/lib/content-schema";
import { SandboxCompileError, runtimeForLanguage, type CompileDiagnostic, type SandboxResponse } from "@/lib/sandbox/shared";
import { useLessonStore } from "@/store/lesson-store";

export function CodeExercise({ id, payload, onPassed }: { id: string; payload: CodePayload; onPassed: () => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const setBuffer = useLessonStore((state) => state.setEditorBuffer);
  const [result, setResult] = useState<SandboxResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [compileErrors, setCompileErrors] = useState<CompileDiagnostic[] | null>(null);
  const [stdout, setStdout] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isCsharp = runtimeForLanguage(payload.language) === "csharp";

  // Create the editor once per exercise. The buffer must NOT be a reactive
  // dependency: the updateListener writes each keystroke back to the store, so
  // depending on it tore the EditorView down and rebuilt it on every character
  // -- the doc was replaced after the first keypress and focus was lost, which
  // made the editor impossible to type in. Read the stored draft imperatively
  // instead, so switching exercises still picks up the right document.
  useEffect(() => {
    if (!containerRef.current || viewRef.current) return;
    const state = EditorState.create({
      doc: useLessonStore.getState().editorBuffers[id] ?? payload.starterCode,
      extensions: [
        keymap.of(defaultKeymap),
        editorLanguage(payload.language),
        oneDark,
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            setBuffer(id, update.state.doc.toString());
          }
        }),
      ],
    });
    viewRef.current = new EditorView({ state, parent: containerRef.current });
    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, [id, payload.language, payload.starterCode, setBuffer]);

  function run() {
    setError(null);
    setCompileErrors(null);
    setStdout(null);
    startTransition(async () => {
      try {
        const outcome = await runCode(
          {
            code: viewRef.current?.state.doc.toString() ?? payload.starterCode,
            functionName: payload.functionName,
            tests: payload.tests,
          },
          payload.language,
        );
        setResult(outcome.response);
        setStdout(outcome.stdout);
        if (outcome.response.passed) onPassed();
      } catch (runError) {
        // A submission that never compiled is not a failing test, so it gets
        // its own panel rather than the generic error banner.
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
              changes: { from: 0, to: viewRef.current.state.doc.length, insert: payload.starterCode },
            });
            setResult(null);
            setError(null);
            setCompileErrors(null);
            setStdout(null);
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
