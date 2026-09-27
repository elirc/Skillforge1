"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import { AlertTriangle, CheckCircle2, Circle, Eye, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { completeLessonAction } from "@/server/actions";
import { useRewardStore } from "@/store/reward-store";
import { contentBlockSchema, knowledgeItemSchema, type ContentBlock, type KnowledgeSeed } from "@/lib/content-schema";
import { CodeExercise } from "@/features/lessons/code-exercise";
import { parseInline, parseMarkdownLite, type InlineNode } from "@/lib/markdown-lite";
import { shuffledChoices } from "@/lib/shuffle";
import { gradeResponse } from "@/lib/grading";

export function LessonPlayer({
  lessonId,
  contentBlocks,
  knowledgeItems,
  completed,
}: {
  lessonId: string;
  contentBlocks: unknown;
  knowledgeItems: unknown[];
  completed: boolean;
}) {
  const blocks = useMemo(() => contentBlockSchema.array().parse(contentBlocks), [contentBlocks]);
  const items = useMemo(() => knowledgeItems.map((item) => knowledgeItemSchema.parse(item)), [knowledgeItems]);
  const [passed, setPassed] = useState<Record<number, boolean>>({});
  const [isComplete, setIsComplete] = useState(completed);
  const [assisted, setAssisted] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const celebrate = useRewardStore((state) => state.celebrate);

  const allPassed = items.every((_, index) => passed[index]);

  function complete() {
    startTransition(async () => {
      try {
        setSaveError(null);
        const summary = await completeLessonAction({ lessonId, assisted });
        celebrate(summary);
        setIsComplete(true);
      } catch { setSaveError("Could not save completion. Your answers and drafts are still here. Try again."); }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <article className="space-y-6">
        {blocks.map((block, index) => (
          <ContentBlockView key={index} block={block} />
        ))}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Checks</h2>
          {items.map((item, index) => (
            <KnowledgeCheck key={item.id ?? index} id={`${lessonId}:${item.id ?? index}`} item={item} onInvalidated={() => setPassed(state => ({ ...state, [index]: false }))} onAssisted={() => setAssisted(true)} onPassed={(helped) => { if (helped) setAssisted(true); setPassed(state => ({ ...state, [index]: true })); }} />
          ))}
        </section>
      </article>
      <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold">Lesson progress</h2>
        <div className="mt-4 space-y-2 text-sm">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              {isComplete || passed[index] ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4 text-slate-400" />}
              <span>{item.type.toLowerCase()} check</span>
            </div>
          ))}
        </div>
        <Button className="mt-5 w-full" disabled={!allPassed || isPending || isComplete} onClick={complete}>
          {isComplete ? "Completed" : "Complete lesson"}
        </Button>
        <p className="mt-3 text-xs text-slate-500">Completion seeds these concepts into your review queue and awards XP.</p>
        {assisted ? <p className="mt-3 text-xs text-slate-500">Assisted completion: revisit these ideas later without hints to check retention.</p> : null}
        {saveError ? <p role="alert" className="mt-3 text-sm text-rose-600">{saveError}</p> : null}
      </aside>
    </div>
  );
}

const calloutTones: Record<"info" | "warning" | "success", { box: string; label: string; icon: typeof Info }> = {
  info: {
    box: "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100",
    label: "Note",
    icon: Info,
  },
  warning: {
    box: "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100",
    label: "Watch out",
    icon: AlertTriangle,
  },
  success: {
    box: "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
    label: "Key idea",
    icon: CheckCircle2,
  },
};

function ContentBlockView({ block }: { block: ContentBlock }) {
  if (block.type === "code-example") {
    return (
      <figure className="overflow-hidden rounded-lg bg-slate-950">
        <figcaption className="border-b border-slate-800 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-400">
          {languageLabel(block.language)}
        </figcaption>
        <pre className="overflow-x-auto p-4 text-sm text-slate-100">
          <code>{block.code}</code>
        </pre>
      </figure>
    );
  }
  if (block.type === "callout") {
    const tone = calloutTones[block.tone];
    return (
      <aside className={`flex gap-3 rounded-lg border p-4 text-sm ${tone.box}`}>
        <tone.icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{tone.label}</p>
          <MarkdownLite source={block.body} className="leading-6" />
        </div>
      </aside>
    );
  }
  return <MarkdownLite source={block.body} className="text-lg leading-8 text-slate-700 dark:text-slate-300" />;
}

const languageNames: Record<string, string> = {
  ts: "TypeScript",
  typescript: "TypeScript",
  tsx: "TSX",
  js: "JavaScript",
  javascript: "JavaScript",
  jsx: "JSX",
  cs: "C#",
  csharp: "C#",
  "c#": "C#",
  sql: "SQL",
  py: "Python",
  python: "Python",
  json: "JSON",
  sh: "Shell",
  bash: "Shell",
  html: "HTML",
  css: "CSS",
  text: "Text",
};

function languageLabel(language: string) {
  return languageNames[language.trim().toLowerCase()] ?? language;
}

function InlineView({ nodes }: { nodes: InlineNode[] }) {
  return (
    <>
      {nodes.map((node, index) => {
        if (node.type === "code") {
          return (
            <code
              key={index}
              className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-900 dark:bg-slate-800 dark:text-slate-100"
            >
              {node.text}
            </code>
          );
        }
        if (node.type === "bold") {
          return (
            <strong key={index} className="font-semibold">
              <InlineView nodes={node.children} />
            </strong>
          );
        }
        return <Fragment key={index}>{node.text}</Fragment>;
      })}
    </>
  );
}

/** Renders the markdown-lite subset as React elements (never as an HTML string). */
function MarkdownLite({ source, className }: { source: string; className?: string }) {
  const blocks = useMemo(() => parseMarkdownLite(source), [source]);
  return (
    <div className={`space-y-4 ${className ?? ""}`}>
      {blocks.map((block, index) =>
        block.type === "list" ? (
          <ul key={index} className="list-disc space-y-1 pl-6">
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>
                <InlineView nodes={item} />
              </li>
            ))}
          </ul>
        ) : (
          <p key={index}>
            <InlineView nodes={block.children} />
          </p>
        ),
      )}
    </div>
  );
}

const REVEAL_AFTER_MISSES = 2;

function KnowledgeCheck({ item, id, onPassed, onAssisted, onInvalidated }: { item: KnowledgeSeed; id: string; onPassed: (assisted: boolean) => void; onAssisted: () => void; onInvalidated: () => void }) {
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<"idle" | "right" | "wrong" | "revealed">("idle");
  const [misses, setMisses] = useState(0);

  if (item.type === "CODE") {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="font-semibold">{item.prompt}</h3>
          <Badge>code</Badge>
        </div>
        <CodeExercise id={id} payload={item.payload} onInvalidated={onInvalidated} onPassed={onPassed} onAssisted={onAssisted} />
      </div>
    );
  }

  const expected = item.type === "MCQ" ? item.payload.answer : item.payload.blanks.join(", ");
  const explanation = item.type === "MCQ" ? item.payload.explanation : null;
  const settled = status === "right" || status === "revealed";

  function check() {
    if (settled || answer.trim() === "") return;
    const ok = gradeResponse(item, { answer }, "good").correct;
    setStatus(ok ? "right" : "wrong");
    if (ok) onPassed(false);
    else setMisses((count) => count + 1);
  }

  function reveal() {
    setAnswer(expected);
    setStatus("revealed");
    onPassed(true);
  }

  function edit(next: string) {
    setAnswer(next);
    if (status === "wrong") setStatus("idle");
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="font-semibold">
          <InlineView nodes={parseInline(item.prompt)} />
        </h3>
        <Badge>{item.type.toLowerCase()}</Badge>
      </div>
      {item.type === "MCQ" ? (
        <div className="grid gap-2">
          {shuffledChoices(item.payload.choices, item.prompt).map((choice) => {
            const highlighted = answer === choice || (settled && choice === expected);
            return (
              <button
                key={choice}
                type="button"
                aria-pressed={answer === choice}
                disabled={settled}
                onClick={() => edit(choice)}
                className={`rounded-md border px-3 py-2 text-left text-sm disabled:cursor-default ${highlighted ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950" : "border-slate-200 dark:border-slate-800"}`}
              >
                <InlineView nodes={parseInline(choice)} />
              </button>
            );
          })}
        </div>
      ) : (
        <input
          value={answer}
          readOnly={settled}
          onChange={(event) => edit(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") check();
          }}
          className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
          placeholder={item.payload.text}
          aria-label={item.payload.text}
        />
      )}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button type="button" variant="secondary" onClick={check} disabled={settled || answer.trim() === ""}>
          Check
        </Button>
        {status === "right" ? <span className="text-sm text-emerald-600">Correct</span> : null}
        {status === "wrong" ? <span className="text-sm text-rose-600">Not quite. Try again.</span> : null}
        {status === "revealed" ? <span className="text-sm text-slate-500">Answer revealed</span> : null}
        {!settled && misses >= REVEAL_AFTER_MISSES ? (
          <Button type="button" variant="ghost" size="sm" onClick={reveal}>
            <Eye className="h-4 w-4" />
            Reveal answer
          </Button>
        ) : null}
      </div>
      {settled && (explanation || status === "revealed") ? (
        <div className="mt-3 space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
          {status === "revealed" ? (
            <p>
              Answer: <strong className="font-semibold">{expected}</strong>
            </p>
          ) : null}
          {explanation ? <MarkdownLite source={explanation} /> : null}
        </div>
      ) : null}
    </div>
  );
}
