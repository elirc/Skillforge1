import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { masteryBand, type ConceptSummary, type MasteryBand } from "@/lib/mastery";
import { reviewTagHref } from "@/lib/review-filter";
import type { MasteryOverview } from "@/server/mastery";

const bandStyles: Record<MasteryBand, { label: string; bar: string; chip: string }> = {
  new: {
    label: "new",
    bar: "bg-slate-300 dark:bg-slate-700",
    chip: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200",
  },
  weak: {
    label: "weak",
    bar: "bg-rose-500",
    chip: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200",
  },
  shaky: {
    label: "shaky",
    bar: "bg-amber-500",
    chip: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
  },
  solid: {
    label: "solid",
    bar: "bg-emerald-400",
    chip: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  },
  strong: {
    label: "strong",
    bar: "bg-emerald-600",
    chip: "border-emerald-300 bg-emerald-100 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900 dark:text-emerald-100",
  },
};

export function MasteryView({ overview }: { overview: MasteryOverview }) {
  const { courses, totals } = overview;

  if (courses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-start gap-3 p-6">
          <p className="font-semibold">No concept history yet.</p>
          <p className="text-sm text-slate-500">
            Finish a lesson and its concepts land here as <em>new</em>. Grade them in reviews and each one gets a strength
            score from your own recall.
          </p>
          <Link href="/tracks" className={buttonVariants({ size: "sm" })}>
            Pick a track <ArrowRight className="h-4 w-4" />
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat title="Concepts touched" value={totals.concepts} />
        <Stat title="Average strength" value={totals.averageStrength === null ? "—" : `${totals.averageStrength}%`} />
        <Stat title="Not yet reviewed" value={totals.fresh} />
        <Stat
          title="Cards due now"
          value={totals.due}
          action={
            totals.due > 0 ? (
              <Link href="/reviews" className={buttonVariants({ size: "sm" })}>
                Review
              </Link>
            ) : null
          }
        />
      </div>

      {courses.map((group) => (
        <Card key={group.course.slug}>
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
            <div className="space-y-1.5">
              <CardTitle>
                <Link href={`/courses/${group.course.slug}`} className="hover:underline">
                  {group.course.title}
                </Link>
              </CardTitle>
              <CardDescription>
                {group.concepts.length} concept{group.concepts.length === 1 ? "" : "s"}
                {group.averageStrength === null ? "" : ` · average ${group.averageStrength}%`}
                {group.dueCount > 0 ? ` · ${group.dueCount} due` : ""}
              </CardDescription>
            </div>
            {group.dueCount > 0 ? (
              <Link href="/reviews" className={buttonVariants({ size: "sm", variant: "outline" })}>
                Review {group.dueCount} <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 md:grid-cols-2">
              {group.concepts.map((concept) => (
                <ConceptRow key={concept.tag} concept={concept} />
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}

      <p className="flex items-center gap-2 text-xs text-slate-500">
        <Sparkles className="h-4 w-4 shrink-0 text-emerald-500" />
        Strength compares how long until each card is due with how stable your recall has been. It drops as cards come
        due and rises with every honest good or easy grade.
      </p>
    </div>
  );
}

function ConceptRow({ concept }: { concept: ConceptSummary }) {
  const band = masteryBand(concept.strength);
  const style = bandStyles[band];

  return (
    <li className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate font-medium">#{concept.tag}</span>
        <Badge className={style.chip}>{style.label}</Badge>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className={cn("h-full rounded-full transition-all", style.bar)}
            style={{ width: `${concept.strength ?? 0}%` }}
          />
        </div>
        <span className="w-10 text-right text-sm tabular-nums">
          {concept.strength === null ? "—" : `${concept.strength}%`}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>
          {concept.samples === 0
            ? "From a finished lesson; not reviewed yet"
            : `${concept.samples} reviewed card${concept.samples === 1 ? "" : "s"}`}
          {concept.due > 0 ? ` · ${concept.due} due` : ""}
        </span>
        {concept.due > 0 ? (
          <Link
            href={reviewTagHref(concept.tag)}
            aria-label={`Drill due #${concept.tag} cards`}
            className="font-medium text-emerald-700 hover:underline dark:text-emerald-400"
          >
            Drill due
          </Link>
        ) : null}
      </div>
    </li>
  );
}

function Stat({ title, value, action }: { title: string; value: React.ReactNode; action?: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-5">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
