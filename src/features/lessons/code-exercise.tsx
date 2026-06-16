"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { javascript } from "@codemirror/lang-javascript";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { oneDark } from "@codemirror/theme-one-dark";
import { Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runCodeInWorker } from "@/lib/sandbox/client-runner";
import type { CodePayload } from "@/lib/content-schema";
import type { SandboxResponse } from "@/lib/sandbox/shared";
import { useLessonStore } from "@/store/lesson-store";

export function CodeExercise({ id, payload, onPassed }: { id: string; payload: CodePayload; onPassed: () => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const buffer = useLessonStore((state) => state.editorBuffers[id] ?? payload.starterCode);
  const setBuffer = useLessonStore((state) => state.setEditorBuffer);
  const [result, setResult] = useState<SandboxResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!containerRef.current || viewRef.current) return;
    const state = EditorState.create({
      doc: buffer,
      extensions: [
        keymap.of(defaultKeymap),
        javascript({ typescript: true }),
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
  }, [buffer, id, setBuffer]);

  function run() {
    setError(null);
    startTransition(async () => {
      try {
        const response = await runCodeInWorker({
          code: viewRef.current?.state.doc.toString() ?? buffer,
          functionName: payload.functionName,
          tests: payload.tests,
        });
        setResult(response);
        if (response.passed) onPassed();
      } catch (runError) {
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
          Run
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
          }}
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>
      {error ? <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-200">{error}</p> : null}
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
                    expected {JSON.stringify(test.expected)}, got {JSON.stringify(test.actual)}
                  </span>
                ) : null}
              </div>
            ))}
        </div>
      ) : null}
    </div>
  );
}
