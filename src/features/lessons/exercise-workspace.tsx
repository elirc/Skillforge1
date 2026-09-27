"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { oneDark } from "@codemirror/theme-one-dark";
import { Button } from "@/components/ui/button";
import { editorLanguage } from "@/lib/sandbox/editor-language";
import { runCode } from "@/lib/sandbox/run-code";
import {
  SandboxCompileError,
  type CompileDiagnostic,
  type SandboxResponse,
  type SandboxTest,
} from "@/lib/sandbox/shared";
import {
  downloadDraft,
  draftVersion,
  readDraft,
  saveDraft,
  type EditorDraft,
} from "@/lib/drafts";

export interface ExerciseRun {
  code: string;
  response: SandboxResponse;
  assisted: boolean;
  durationMs: number;
}
interface Props {
  id: string;
  starterCode: string;
  functionName: string;
  tests: SandboxTest[];
  language?: string;
  referenceSolution?: string;
  hints?: string[];
  walkthrough?: string;
  regression?: {
    factoryName: string;
    referenceCode: string;
    mutants: string[];
  };
  typeChecks?: string;
  onResult?: (run: ExerciseRun) => void | Promise<void>;
  onAssisted?: () => void;
  onInvalidated?: () => void;
}

export function ExerciseWorkspace({
  id,
  starterCode,
  functionName,
  tests,
  language = "javascript",
  referenceSolution,
  hints = [],
  walkthrough,
  regression,
  typeChecks,
  onResult,
  onAssisted,
  onInvalidated,
}: Props) {
  const invalidate = useRef(onInvalidated);
  useEffect(() => {
    invalidate.current = onInvalidated;
  }, [onInvalidated]);
  const revision = useRef(0);
  const container = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const assisted = useRef(false);
  const started = useRef(0);
  const version = draftVersion(
    `${language}\n${starterCode}\n${typeChecks ?? ""}\n${JSON.stringify(regression ?? null)}`,
    tests,
  );
  const [result, setResult] = useState<SandboxResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<CompileDiagnostic[]>([]);
  const [stdout, setStdout] = useState<string | null>(null);
  const [oldDraft, setOldDraft] = useState<EditorDraft | null>(null);
  const [storageMessage, setStorageMessage] = useState(
    "Drafts save in this browser.",
  );
  const [fontSize, setFontSize] = useState(14);
  const [hintCount, setHintCount] = useState(0);
  const [solutionVisible, setSolutionVisible] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!container.current) return;
    const draft = readDraft(id);
    const current = draft?.version === version ? draft : null;
    assisted.current = current?.assisted ?? false;
    started.current = Date.now();
    // Version mismatch is surfaced without overwriting the recoverable draft.
    const notify = setTimeout(() => {
      setOldDraft(draft && !current ? draft : null);
      if (current)
        setStorageMessage(
          `Draft restored (${new Date(current.savedAt).toLocaleString()}).`,
        );
    }, 0);
    const editor = new EditorView({
      parent: container.current,
      state: EditorState.create({
        doc: current?.code ?? starterCode,
        extensions: [
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          lineNumbers(),
          editorLanguage(language),
          oneDark,
          EditorView.lineWrapping,
          EditorView.contentAttributes.of({
            "aria-label": `${language} exercise editor`,
            spellcheck: "false",
          }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              revision.current++;
              invalidate.current?.();
              setResult(null);
              const saved = saveDraft(id, {
                code: update.state.doc.toString(),
                version,
                assisted: assisted.current,
                savedAt: new Date().toISOString(),
              });
              setStorageMessage(
                saved
                  ? "Draft saved in this browser."
                  : "Browser storage is unavailable. Export your draft before leaving.",
              );
            }
          }),
        ],
      }),
    });
    view.current = editor;
    return () => {
      clearTimeout(notify);
      editor.destroy();
      view.current = null;
    };
  }, [id, language, starterCode, version]);

  function markAssisted() {
    assisted.current = true;
    onAssisted?.();
    saveDraft(id, {
      code: view.current?.state.doc.toString() ?? starterCode,
      version,
      assisted: true,
      savedAt: new Date().toISOString(),
    });
  }
  function replace(code: string) {
    view.current?.dispatch({
      changes: { from: 0, to: view.current.state.doc.length, insert: code },
    });
  }
  function run() {
    const code = view.current?.state.doc.toString() ?? starterCode;
    const runRevision = revision.current;
    invalidate.current?.();
    setError(null);
    setDiagnostics([]);
    setStdout(null);
    setResult(null);
    startTransition(async () => {
      try {
        const outcome = await runCode(
          { code, functionName, tests, regression, typeChecks },
          language,
          preview.current,
        );
        if (runRevision !== revision.current) {
          setError(
            "The draft changed while tests ran. Run the current draft again.",
          );
          return;
        }
        setResult(outcome.response);
        setStdout(outcome.stdout);
        try {
          await onResult?.({
            code,
            response: outcome.response,
            assisted: assisted.current,
            durationMs: Date.now() - started.current,
          });
        } catch {
          setError(
            "Tests finished, but progress could not be saved. Your draft is safe. Run again to retry saving.",
          );
        }
      } catch (failure) {
        if (failure instanceof SandboxCompileError)
          setDiagnostics(failure.diagnostics);
        else
          setError(
            failure instanceof Error ? failure.message : String(failure),
          );
      }
    });
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <span>
          Runtime:{" "}
          {language === "sql"
            ? "SQLite"
            : language === "typescript"
              ? "TypeScript (strict compiler)"
              : language === "csharp"
                ? "C# / .NET"
                : language === "react"
                  ? "React / mounted TSX component"
                  : "JavaScript"}
        </span>
        <label>
          Editor size{" "}
          <select
            aria-label="Editor font size"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="rounded border bg-transparent p-1"
          >
            {[12, 14, 16, 18, 20].map((size) => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>
        </label>
      </div>
      {oldDraft ? (
        <div className="rounded border border-amber-300 p-3 text-sm">
          <p>
            The exercise changed since your last draft. Recover it or export it
            before starting again.
          </p>
          <div className="mt-2 flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                assisted.current = oldDraft.assisted;
                replace(oldDraft.code);
                setOldDraft(null);
              }}
            >
              Recover draft
            </Button>
            <Button
              variant="outline"
              onClick={() => downloadDraft(`${id}-previous.txt`, oldDraft.code)}
            >
              Export previous draft
            </Button>
          </div>
        </div>
      ) : null}
      <div
        ref={container}
        className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950 [&_.cm-editor]:text-[length:var(--editor-size)]"
        style={{ "--editor-size": `${fontSize}px` } as React.CSSProperties}
      />
      <p className="text-xs text-slate-500" role="status">
        {storageMessage}
      </p>
      {typeChecks ? (
        <details className="rounded border p-3 text-sm" open>
          <summary>Compile-only exercise: required type contract</summary>
          <p>
            These checks are appended to your source. No JavaScript is executed.
            Fix the types until every assertion compiles.
          </p>
          <pre className="mt-2 overflow-auto">
            <code>{typeChecks}</code>
          </pre>
        </details>
      ) : null}
      {language === "react" ? (
        <section className="space-y-2">
          <h3 className="text-sm font-medium">Live component preview</h3>
          <div ref={preview} />
        </section>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button onClick={run} disabled={pending}>
          {pending ? "Running…" : "Run"}
        </Button>
        <Button
          variant="secondary"
          disabled={pending}
          onClick={() => {
            if (
              !window.confirm(
                "Replace this draft with the starter? Export it first if you want to keep it.",
              )
            )
              return;
            replace(starterCode);
            setResult(null);
            setDiagnostics([]);
            setError(null);
            setStdout(null);
          }}
        >
          Reset
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            downloadDraft(
              `${id}.${language === "csharp" ? "cs" : language === "sql" ? "sql" : language === "typescript" ? "ts" : language === "react" ? "tsx" : "js"}`,
              view.current?.state.doc.toString() ?? starterCode,
            )
          }
        >
          Export draft
        </Button>
        {hintCount < hints.length ? (
          <Button
            variant="ghost"
            onClick={() => {
              markAssisted();
              setHintCount((n) => n + 1);
            }}
          >
            Hint {hintCount + 1}
          </Button>
        ) : null}
        {referenceSolution && !solutionVisible ? (
          <Button
            variant="ghost"
            onClick={() => {
              markAssisted();
              setSolutionVisible(true);
            }}
          >
            Show solution
          </Button>
        ) : null}
      </div>
      {hints.slice(0, hintCount).map((hint, i) => (
        <p
          key={i}
          className="rounded bg-sky-50 p-3 text-sm text-sky-950 dark:bg-sky-950 dark:text-sky-100"
        >
          Hint {i + 1}: {hint}
        </p>
      ))}
      {solutionVisible ? (
        <div className="space-y-2 rounded border p-3 text-sm">
          <p>
            Assisted practice. Try a fresh exercise later to check independent
            understanding.
          </p>
          {walkthrough ? (
            <p className="whitespace-pre-wrap">{walkthrough}</p>
          ) : null}
          <pre className="overflow-x-auto">
            <code>{referenceSolution}</code>
          </pre>
        </div>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="rounded bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-950 dark:text-rose-100"
        >
          {error}
        </p>
      ) : null}
      {diagnostics.length > 0 ? (
        <div
          role="alert"
          className="rounded border border-amber-400 p-3 text-sm"
        >
          <strong>Build failed</strong>
          <ul>
            {diagnostics.map((d, i) => (
              <li key={i}>
                {d.id} · line {d.line}:{d.column} · {d.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {stdout ? (
        <details className="rounded border p-3 text-sm" open>
          <summary>Console output</summary>
          <pre className="overflow-x-auto whitespace-pre-wrap">{stdout}</pre>
        </details>
      ) : null}
      {result ? (
        <div className="space-y-2" aria-live="polite">
          <p className="font-semibold">
            {result.results.filter((t) => t.passed).length} /{" "}
            {result.results.length} tests passed
          </p>
          {result.results.map((test, i) => (
            <div
              key={i}
              className={`rounded border p-3 text-sm ${test.passed ? "border-emerald-400" : "border-rose-400"}`}
            >
              <strong>{test.passed ? "Pass" : "Fail"}:</strong> {test.name}
              {test.hidden ? " (additional case)" : ""}
              {!test.passed ? (
                test.error ? (
                  <p>{test.error}</p>
                ) : (
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <div>
                      <p>Expected</p>
                      <pre className="overflow-auto whitespace-pre-wrap">
                        {JSON.stringify(test.expected, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <p>Received</p>
                      <pre className="overflow-auto whitespace-pre-wrap">
                        {JSON.stringify(test.actual, null, 2) ?? "undefined"}
                      </pre>
                    </div>
                  </div>
                )
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
