"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export interface SessionStep { title: string; href: string; minutes: number; description: string; }
export function GuidedSession({ steps, minutes }: { steps: SessionStep[]; minutes: number }) {
  const [plan, setPlan] = useState(steps);
  const [done, setDone] = useState<number[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const previous = JSON.parse(localStorage.getItem("skillforge:session") ?? "null");
        if (previous?.date === new Date().toLocaleDateString() && Array.isArray(previous.steps) && Array.isArray(previous.done)) { setPlan(previous.steps); setDone(previous.done); }
      } catch {}
      setReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  function save(nextDone: number[], nextPlan = plan) {
    setDone(nextDone); setPlan(nextPlan);
    try { localStorage.setItem("skillforge:session", JSON.stringify({ date: new Date().toLocaleDateString(), steps: nextPlan, done: nextDone })); } catch {}
  }
  const next = plan.findIndex((_, index) => !done.includes(index));
  return <div className="space-y-5"><p className="text-slate-500">A suggested {minutes}-minute session. Times are estimates; stop whenever you need to. The checklist saves in this browser.</p>
    {plan.length === 0 ? <p>Nothing is queued. <Link className="underline" href="/tracks">Choose a track</Link>.</p> : null}
    <ol className="space-y-3">{plan.map((step, index) => <li key={step.href} className={`rounded-lg border p-5 ${index === next ? "border-emerald-400" : "border-slate-200 dark:border-slate-800"}`}><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold">{index + 1}. {step.title} · ~{step.minutes} min</h2><p className="mt-1 text-sm text-slate-500">{step.description}</p></div><span>{done.includes(index) ? "✓ Done" : ""}</span></div><div className="mt-3 flex items-center gap-4"><Link href={step.href} className="font-medium text-emerald-600">{done.includes(index) ? "Revisit" : "Open activity"} →</Link><Button variant="ghost" disabled={!ready} onClick={() => save(done.includes(index) ? done.filter(value => value !== index) : [...done, index])}>{done.includes(index) ? "Uncheck" : "Mark step done"}</Button></div></li>)}</ol>
    {plan.length > 0 && next === -1 ? <p role="status" className="rounded bg-emerald-50 p-4 text-emerald-900">Session checklist complete. Actual course progress and rewards come from completing the activities.</p> : null}
    <Button variant="outline" disabled={!ready} onClick={() => save([], steps)}>Start a fresh plan</Button><p className="text-xs text-slate-500">Return here from the Today page after each activity.</p>
  </div>;
}
