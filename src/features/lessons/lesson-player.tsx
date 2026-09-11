"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { completeLessonAction } from "@/server/actions";
import { useRewardStore } from "@/store/reward-store";
import { contentBlockSchema, knowledgeItemSchema, type ContentBlock, type KnowledgeSeed } from "@/lib/content-schema";
import { CodeExercise } from "@/features/lessons/code-exercise";

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
  const [isPending, startTransition] = useTransition();
  const celebrate = useRewardStore((state) => state.celebrate);

  const allPassed = items.every((item, index) => item.type !== "CODE" || passed[index]);

  function complete() {
    startTransition(async () => {
      const summary = await completeLessonAction({ lessonId });
      celebrate(summary);
      setIsComplete(true);
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
            <KnowledgeCheck key={index} index={index} item={item} onPassed={() => setPassed((state) => ({ ...state, [index]: true }))} />
          ))}
        </section>
      </article>
      <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold">Lesson progress</h2>
        <div className="mt-4 space-y-2 text-sm">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              {item.type !== "CODE" || passed[index] ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4 text-slate-400" />}
              <span>{item.type.toLowerCase()} check</span>
            </div>
          ))}
        </div>
        <Button className="mt-5 w-full" disabled={!allPassed || isPending || isComplete} onClick={complete}>
          {isComplete ? "Completed" : "Complete lesson"}
        </Button>
        <p className="mt-3 text-xs text-slate-500">Completion seeds these concepts into your review queue and awards XP.</p>
      </aside>
    </div>
  );
}

function ContentBlockView({ block }: { block: ContentBlock }) {
  if (block.type === "code-example") {
    return (
      <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-100">
        <code>{block.code}</code>
      </pre>
    );
  }
  if (block.type === "callout") {
    return <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">{block.body}</div>;
  }
  return <p className="text-lg leading-8 text-slate-700 dark:text-slate-300">{block.body}</p>;
}

function KnowledgeCheck({ item, index, onPassed }: { item: KnowledgeSeed; index: number; onPassed: () => void }) {
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<"idle" | "right" | "wrong">("idle");

  if (item.type === "CODE") {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="font-semibold">{item.prompt}</h3>
          <Badge>code</Badge>
        </div>
        <CodeExercise id={`${index}-${item.prompt}`} payload={item.payload} onPassed={onPassed} />
      </div>
    );
  }

  function check() {
    const expected = item.type === "MCQ" ? item.payload.answer : item.type === "CLOZE" ? item.payload.blanks[0] : "";
    const ok = answer.trim().toLowerCase() === expected.trim().toLowerCase();
    setStatus(ok ? "right" : "wrong");
    if (ok) onPassed();
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="font-semibold">{item.prompt}</h3>
        <Badge>{item.type.toLowerCase()}</Badge>
      </div>
      {item.type === "MCQ" ? (
        <div className="grid gap-2">
          {item.payload.choices.map((choice) => (
            <button
              key={choice}
              type="button"
              onClick={() => setAnswer(choice)}
              className={`rounded-md border px-3 py-2 text-left text-sm ${answer === choice ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950" : "border-slate-200 dark:border-slate-800"}`}
            >
              {choice}
            </button>
          ))}
        </div>
      ) : (
        <input
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
          placeholder={item.payload.text}
        />
      )}
      <div className="mt-3 flex items-center gap-3">
        <Button type="button" variant="secondary" onClick={check}>
          Check
        </Button>
        {status === "right" ? <span className="text-sm text-emerald-600">Correct</span> : null}
        {status === "wrong" ? <span className="text-sm text-rose-600">Try again</span> : null}
      </div>
    </div>
  );
}
