"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { defaultKeymap } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";
import { Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runCodeInWorker } from "@/lib/sandbox/client-runner";
import type { SandboxResponse, SandboxTest } from "@/lib/sandbox/shared";
import { recordProblemSubmissionAction } from "@/server/problems";
import { useRewardStore } from "@/store/reward-store";

export function ProblemRunner({
  problemId,
  starterCode,
  functionName,
  tests,
}: {
  problemId: string;
  starterCode: string;
  functionName: string;
  tests: SandboxTest[];
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const startedAtRef = useRef(0);
  const [result, setResult] = useState<SandboxResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const celebrate = useRewardStore((state) => state.celebrate);

  useEffect(() => {
    if (!containerRef.current || viewRef.current) return;
    const state = EditorState.create({
      doc: starterCode,
      extensions: [keymap.of(defaultKeymap), javascript({ typescript: true }), oneDark, EditorView.lineWrapping],
    });
    viewRef.current = new EditorView({ state, parent: containerRef.current });
    startedAtRef.current = Date.now();
    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, [starterCode]);

  function run() {
    const code = viewRef.current?.state.doc.toString() ?? starterCode;
    setError(null);
    startTransition(async () => {
      try {
        const response = await runCodeInWorker({ code, functionName, tests });
        setResult(response);
        const summary = await recordProblemSubmissionAction({
          problemId,
          code,
          passed: response.passed,
          durationMs: Date.now() - startedAtRef.current,
        });
        celebrate(summary);
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
              changes: { from: 0, to: viewRef.current.state.doc.length, insert: starterCode },
            });
            startedAtRef.current = Date.now();
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
