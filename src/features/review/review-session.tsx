"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { gradeReviewAction } from "@/server/actions";
import { knowledgeItemSchema } from "@/lib/content-schema";
import { expectedAnswer, type GradeResult } from "@/lib/grading";
import { selectReviewIndex, useReviewStore } from "@/store/review-store";
import { useRewardStore } from "@/store/reward-store";
import { shuffledChoices } from "@/lib/shuffle";
import { CodeExercise } from "@/features/lessons/code-exercise";

interface ReviewItem {
  id: string;
  dueAt: Date;
  strength: number;
  knowledgeItem: {
    prompt: string;
    type: string;
    payload: unknown;
    conceptTags: string[];
    lesson: { id: string; title: string; module: { course: { title: string; slug: string } } };
  };
}

function queueKeyFor(items: ReviewItem[]) {
  return items.map((entry) => entry.id).join("|");
}

export function ReviewSession({ items: initialItems }: { items: ReviewItem[] }) {
  const queryClient = useQueryClient();
  // Grading revalidates /reviews, which re-renders this page with a shorter due
  // list. Walking that shrinking list with a growing index would skip cards, so
  // the session keeps the queue it started with. The page remounts this
  // component (via `key`) when the tag filter changes, which takes a new snapshot.
  // "Restart queue" picks up the latest due list from the server.
  const [items, setItems] = useState(initialItems);
  const queueKey = useMemo(() => queueKeyFor(items), [items]);
  const index = useReviewStore(selectReviewIndex(queueKey));
  const advance = useReviewStore((state) => state.next);
  const restart = useReviewStore((state) => state.reset);
  const next = () => advance(queueKey);
  const reset = () => {
    setItems(initialItems);
    restart(queueKeyFor(initialItems));
  };
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [isPending, startTransition] = useTransition();
  // The server's verdict on the card just graded; the client never decides correctness.
  const [lastVerdict, setLastVerdict] = useState<GradeResult | null>(null);
  const [history, setHistory] = useState<{ prompt: string; correct: boolean; expected: string; href: string; lesson: string }[]>([]);
  const [codeResponse, setCodeResponse] = useState<{ code: string; assisted: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const celebrate = useRewardStore((state) => state.celebrate);
  const item = items[index];
  const parsed = useMemo(() => (item ? knowledgeItemSchema.parse(item.knowledgeItem) : null), [item]);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-semibold">No reviews due</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Complete a lesson to seed concepts into your queue.</p>
      </div>
    );
  }

  if (!item || !parsed) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-semibold">Review session complete</h2>
        <p className="mt-3">{history.filter(result => result.correct).length} correct of {history.length} graded. Missed cards return on the retry schedule.</p>
        {history.length ? <ul className="mt-4 space-y-3 text-left text-sm">{history.map((result, i) => <li key={i}><strong>{result.correct ? "Correct" : "Needs practice"}</strong>: {result.prompt}{!result.correct ? <><p className="text-slate-500">{result.expected}</p><Link className="text-emerald-700 underline dark:text-emerald-300" href={result.href}>Revisit {result.lesson}</Link></> : null}</li>)}</ul> : null}
        <Button className="mt-4" onClick={() => { setHistory([]); setLastVerdict(null); reset(); }}>
          Restart queue
        </Button>
      </div>
    );
  }

  const correctAnswer = expectedAnswer(parsed);

  function grade(recallScore: "again" | "hard" | "good" | "easy") {
    startTransition(async () => {
      try {
      setError(null);
      const result = await gradeReviewAction({
        reviewStateId: item.id,
        response: parsed?.type === "CODE" ? codeResponse : { answer },
        recallScore,
        durationMs: Date.now() - startedAt,
      });
      celebrate(result);
      setLastVerdict({ correct: result.correct, expected: result.expected });
      setHistory(current => [...current, { prompt: item.knowledgeItem.prompt, correct: result.correct, expected: result.expected, href: `/courses/${item.knowledgeItem.lesson.module.course.slug}/lessons/${item.knowledgeItem.lesson.id}`, lesson: item.knowledgeItem.lesson.title }]);
      await queryClient.invalidateQueries();
      setAnswer("");
      setRevealed(false);
      setCodeResponse(null);
      setStartedAt(Date.now());
      next();
      } catch { setError("Could not save this review. Your response is still here; try grading again."); }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <section className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge>{parsed.type.toLowerCase()}</Badge>
          {parsed.conceptTags.map((tag) => (
            <Badge key={tag}>#{tag}</Badge>
          ))}
        </div>
        <p className="text-sm text-slate-500">{item.knowledgeItem.lesson.module.course.title} / {item.knowledgeItem.lesson.title}</p>
        <h2 className="mt-2 text-2xl font-semibold">{parsed.prompt}</h2>
        {parsed.type === "MCQ" ? (
          <div className="mt-5 grid gap-2">
            {shuffledChoices(parsed.payload.choices, item.id + new Date(item.dueAt).toISOString()).map((choice) => (
              <button
                key={choice}
                type="button"
                disabled={revealed}
                aria-pressed={answer === choice}
                onClick={() => setAnswer(choice)}
                className={`rounded-md border px-3 py-2 text-left ${answer === choice ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950" : "border-slate-200 dark:border-slate-800"}`}
              >
                {choice}
              </button>
            ))}
          </div>
        ) : parsed.type === "CLOZE" ? (
          <input
            value={answer}
            readOnly={revealed}
            aria-label="Recall answer"
            onChange={(event) => setAnswer(event.target.value)}
            className="mt-5 h-11 w-full rounded-md border border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-950"
            placeholder={parsed.payload.text}
          />
        ) : (
          <div className="mt-5"><p className="mb-3 text-sm text-slate-500">Rebuild this from memory. A passing run without hints provides evidence of retention.</p><CodeExercise key={item.id} id={`review-${item.id}-${new Date(item.dueAt).toISOString()}`} payload={parsed.payload} onInvalidated={() => { setCodeResponse(null); setRevealed(false); }} onPassed={() => {}} onAssisted={() => setCodeResponse(previous => previous ? { ...previous, assisted: true } : null)} onResult={run => { setCodeResponse({ code: run.code, assisted: run.assisted }); setRevealed(true); }} /></div>
        )}
        <div className="mt-5 border-t border-slate-200 pt-5 dark:border-slate-800">
          {revealed ? (
            <div className="space-y-4">
              <p className="whitespace-pre-wrap text-sm">
                Answer: <strong>{correctAnswer}</strong>
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Button variant="destructive" disabled={isPending} onClick={() => grade("again")}>
                  Again
                </Button>
                <Button variant="secondary" disabled={isPending} onClick={() => grade("hard")}>
                  Hard
                </Button>
                <Button disabled={isPending} onClick={() => grade("good")}>
                  Good
                </Button>
                <Button variant="outline" disabled={isPending} onClick={() => grade("easy")}>
                  Easy
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setRevealed(true)}>{parsed.type === "CODE" ? "I need to review this again" : "Reveal answer"}</Button>
          )}
        </div>
        {error ? <p role="alert" className="mt-3 text-sm text-rose-600">{error}</p> : null}
      </section>
      <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold">Session</h2>
        <p className="mt-2 text-sm text-slate-500">
          Card {index + 1} of {items.length}
        </p>
        <Progress className="mt-3" value={(index / items.length) * 100} />
        <p className="mt-5 text-sm">Concept strength</p>
        <Progress className="mt-2" value={item.strength} />
        {lastVerdict ? (
          <p className="mt-5 text-sm" aria-live="polite">
            Last card:{" "}
            {lastVerdict.correct ? (
              <strong className="text-emerald-600 dark:text-emerald-400">correct</strong>
            ) : (
              <>
                <strong className="text-rose-600 dark:text-rose-400">missed</strong>
                <span className="block text-slate-500">Answer: {lastVerdict.expected}</span>
              </>
            )}
          </p>
        ) : null}
      </aside>
    </div>
  );
}
