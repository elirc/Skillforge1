"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { experienceLabels, goalLabels, type Experience, type Goal } from "@/lib/enums";
import { saveOnboardingAction } from "@/server/actions";

const goals = Object.keys(goalLabels) as Goal[];
const experiences = Object.keys(experienceLabels) as Experience[];

/** Focus areas are the concept tags the CRUD track leans on most. */
const focusOptions = [
  "csharp",
  "dotnet",
  "aspnet-core",
  "ef-core",
  "sql",
  "async",
  "testing",
  "performance",
  "observability",
  "deployment",
];

const goalPitch: Record<Goal, string> = {
  "crud-dev": "Lessons and quests aim at building and shipping data-backed web apps.",
  interview: "Heavier drilling, more exercises per day, interview-shaped scenarios first.",
  fundamentals: "Slower ramp through language basics before the framework material.",
};

export function OnboardingForm({
  defaults,
}: {
  defaults: { name: string; goal: Goal; experience: Experience; dailyXpGoal: number; dailyMinutes?: number; focusTags: string[] };
}) {
  const [name, setName] = useState(defaults.name);
  const [goal, setGoal] = useState<Goal>(defaults.goal);
  const [experience, setExperience] = useState<Experience>(defaults.experience);
  const [dailyXpGoal, setDailyXpGoal] = useState(defaults.dailyXpGoal);
  const [dailyMinutes, setDailyMinutes] = useState(defaults.dailyMinutes ?? 15);
  const [focusTags, setFocusTags] = useState<string[]>(defaults.focusTags);
  const [isPending, startTransition] = useTransition();

  function toggleTag(tag: string) {
    setFocusTags((tags) => (tags.includes(tag) ? tags.filter((item) => item !== tag) : [...tags, tag]));
  }

  function submit() {
    startTransition(async () => {
      await saveOnboardingAction({ name: name.trim() || "Learner", goal, experience, dailyXpGoal, dailyMinutes, focusTags });
    });
  }

  return (
    <div className="space-y-8">
      <Section title="How much time do you want to spend each day?" hint="Your guided session fits reviews, a lesson, and practice into this budget."><div className="flex gap-2">{[5,15,30,60].map(minutes => <Choice key={minutes} selected={dailyMinutes === minutes} onClick={() => setDailyMinutes(minutes)} compact>{minutes} min</Choice>)}</div></Section>
      <Section title="What should we call you?">
        <Input aria-label="Display name" value={name} maxLength={40} onChange={(event) => setName(event.target.value)} placeholder="Learner" />
      </Section>

      <Section title="What are you here for?">
        <div className="grid gap-2">
          {goals.map((option) => (
            <Choice key={option} selected={goal === option} onClick={() => setGoal(option)}>
              <strong>{goalLabels[option]}</strong>
              <span className="block text-sm text-slate-600 dark:text-slate-400">{goalPitch[option]}</span>
            </Choice>
          ))}
        </div>
      </Section>

      <Section title="Where are you starting from?">
        <div className="grid gap-2 sm:grid-cols-3">
          {experiences.map((option) => (
            <Choice key={option} selected={experience === option} onClick={() => setExperience(option)}>
              {experienceLabels[option]}
            </Choice>
          ))}
        </div>
      </Section>

      <Section title="Daily XP goal" hint="Roughly: 30 XP is one lesson, 60 is a lesson plus a review round.">
        <div className="flex flex-wrap gap-2">
          {[30, 60, 120, 200].map((option) => (
            <Choice key={option} selected={dailyXpGoal === option} onClick={() => setDailyXpGoal(option)} compact>
              {option} XP
            </Choice>
          ))}
        </div>
      </Section>

      <Section title="Anything you want to hit hardest?" hint="Optional. These bias which problems get recommended.">
        <div className="flex flex-wrap gap-2">
          {focusOptions.map((tag) => (
            <Choice key={tag} selected={focusTags.includes(tag)} onClick={() => toggleTag(tag)} compact>
              #{tag}
            </Choice>
          ))}
        </div>
      </Section>

      <Button onClick={submit} disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Saving…" : "Start forging"}
      </Button>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold">{title}</h2>
      {hint ? <p className="mt-1 text-sm text-slate-500">{hint}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Choice({
  selected,
  onClick,
  compact,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`rounded-md border text-left transition ${compact ? "px-3 py-2 text-sm" : "px-4 py-3"} ${
        selected
          ? "border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950"
          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
      }`}
    >
      {children}
    </button>
  );
}
