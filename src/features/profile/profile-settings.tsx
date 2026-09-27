"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { experienceLabels, goalLabels, type Experience, type Goal } from "@/lib/enums";
import { resetProgressAction, saveSettingsAction } from "@/server/actions";

const goals = Object.keys(goalLabels) as Goal[];
const experiences = Object.keys(experienceLabels) as Experience[];

export function ProfileSettings({
  defaults,
}: {
  defaults: { name: string; goal: Goal; experience: Experience; dailyXpGoal: number; dailyMinutes?: number; focusTags: string[] };
}) {
  const router = useRouter();
  const [name, setName] = useState(defaults.name);
  const [goal, setGoal] = useState<Goal>(defaults.goal);
  const [experience, setExperience] = useState<Experience>(defaults.experience);
  const [dailyXpGoal, setDailyXpGoal] = useState(defaults.dailyXpGoal);
  const [dailyMinutes, setDailyMinutes] = useState(defaults.dailyMinutes ?? 15);
  const [focusTags, setFocusTags] = useState(defaults.focusTags.join(", "));
  const [status, setStatus] = useState<string | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      try {
      await saveSettingsAction({ name: name.trim() || "Learner", goal, experience, dailyXpGoal, dailyMinutes, focusTags: focusTags.split(",").map(tag => tag.trim()).filter(Boolean) });
      setStatus("Saved.");
      router.refresh();
      } catch { setStatus("Could not save settings. Check the values and try again."); }
    });
  }

  function reset() {
    startTransition(async () => {
      await resetProgressAction();
      setConfirmingReset(false);
      setStatus("Progress cleared. Course content is untouched.");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <label className="block text-sm font-medium">Daily minutes<Input className="mt-1.5" type="number" min={5} max={120} step={5} value={dailyMinutes} onChange={e => setDailyMinutes(Number(e.target.value))} /></label>
        <label className="block text-sm font-medium">Focus concepts (comma separated)<Input className="mt-1.5" value={focusTags} onChange={e => setFocusTags(e.target.value)} /></label>
        <label className="block">
          <span className="text-sm font-medium">Display name</span>
          <Input className="mt-1.5" value={name} maxLength={40} onChange={(event) => setName(event.target.value)} />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Goal</span>
          <select
            value={goal}
            onChange={(event) => setGoal(event.target.value as Goal)}
            className="mt-1.5 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
          >
            {goals.map((option) => (
              <option key={option} value={option}>
                {goalLabels[option]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium">Experience</span>
          <select
            value={experience}
            onChange={(event) => setExperience(event.target.value as Experience)}
            className="mt-1.5 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
          >
            {experiences.map((option) => (
              <option key={option} value={option}>
                {experienceLabels[option]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium">Daily XP goal</span>
          <Input
            className="mt-1.5"
            type="number"
            min={20}
            max={500}
            step={10}
            value={dailyXpGoal}
            onChange={(event) => setDailyXpGoal(Number(event.target.value))}
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={save} disabled={isPending}>
            {isPending ? "Saving…" : "Save"}
          </Button>
          {status ? <span className="text-sm text-slate-500">{status}</span> : null}
        </div>

        <div className="rounded-md border border-rose-200 p-4 dark:border-rose-900">
          <p className="text-sm font-medium">Reset progress</p>
          <p className="mt-1 text-sm text-slate-500">
            Clears XP, streaks, reviews, completions and achievements. Courses and problems stay.
          </p>
          {confirmingReset ? (
            <div className="mt-3 flex gap-2">
              <Button variant="destructive" onClick={reset} disabled={isPending}>
                Yes, erase my progress
              </Button>
              <Button variant="secondary" onClick={() => setConfirmingReset(false)} disabled={isPending}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button className="mt-3" variant="outline" onClick={() => setConfirmingReset(true)}>
              Reset…
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
