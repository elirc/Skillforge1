"use client";

import { useMemo, useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { gradeReviewAction } from "@/server/actions";
import { knowledgeItemSchema } from "@/lib/content-schema";
import { useReviewStore } from "@/store/review-store";

interface ReviewItem {
  id: string;
  dueAt: Date;
  strength: number;
  knowledgeItem: {
    prompt: string;
    type: string;
    payload: unknown;
    conceptTags: string[];
    lesson: { title: string; module: { course: { title: string } } };
  };
}

export function ReviewSession({ items }: { items: ReviewItem[] }) {
  const queryClient = useQueryClient();
  const index = useReviewStore((state) => state.index);
  const next = useReviewStore((state) => state.next);
  const reset = useReviewStore((state) => state.reset);
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [isPending, startTransition] = useTransition();
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
        <Button className="mt-4" onClick={reset}>
          Restart queue
        </Button>
      </div>
    );
  }

  const correctAnswer = parsed.type === "MCQ" ? parsed.payload.answer : parsed.type === "CLOZE" ? parsed.payload.blanks.join(", ") : "Run this again in the lesson editor.";
  const correct = parsed.type === "CODE" ? true : answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

  function grade(recallScore: "again" | "hard" | "good" | "easy") {
    startTransition(async () => {
      await gradeReviewAction({
        reviewStateId: item.id,
        response: { answer },
        correct: recallScore !== "again" && correct,
        recallScore,
        durationMs: Date.now() - startedAt,
      });
      await queryClient.invalidateQueries();
      setAnswer("");
      setRevealed(false);
      setStartedAt(Date.now());
      next();
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
            {parsed.payload.choices.map((choice) => (
              <button
                key={choice}
                type="button"
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
            onChange={(event) => setAnswer(event.target.value)}
            className="mt-5 h-11 w-full rounded-md border border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-950"
            placeholder={parsed.payload.text}
          />
        ) : (
          <p className="mt-5 rounded-md bg-slate-100 p-4 text-sm dark:bg-slate-950">Code concepts are reviewed as recall prompts here; revisit the lesson for the full editor runner.</p>
        )}
        <div className="mt-5 border-t border-slate-200 pt-5 dark:border-slate-800">
          {revealed ? (
            <div className="space-y-4">
              <p className="text-sm">
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
            <Button onClick={() => setRevealed(true)}>Reveal answer</Button>
          )}
        </div>
      </section>
      <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold">Session</h2>
        <p className="mt-2 text-sm text-slate-500">
          Card {index + 1} of {items.length}
        </p>
        <Progress className="mt-3" value={(index / items.length) * 100} />
        <p className="mt-5 text-sm">Concept strength</p>
        <Progress className="mt-2" value={item.strength} />
      </aside>
    </div>
  );
}
