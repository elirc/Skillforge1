import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { ActivityHeatmap } from "@/features/dashboard/activity-heatmap";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { goalLabels } from "@/lib/enums";
import { getXpHistory } from "@/server/gamification";
import { getNextUp, getTrackProgress, getWeakConcepts } from "@/server/feed";
import { ensureTodaysQuests } from "@/server/quests";
import { getCurrentUser } from "@/server/user";
import { reviewTagHref } from "@/lib/review-filter";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const user = await getCurrentUser();
  const [nextUp, quests, weak, tracks, history] = await Promise.all([
    getNextUp(),
    ensureTodaysQuests(user.id),
    getWeakConcepts(user.id, 5),
    getTrackProgress(user.id, user.goal),
    getXpHistory(user.id, 84),
  ]);

  const questsDone = quests.filter((quest) => quest.completed).length;

  return (
    <SiteShell>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">
          {greeting()}, {user.name}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">{goalLabels[user.goal]}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-emerald-300 bg-emerald-50 p-5 dark:bg-emerald-950"><h2 className="text-xl font-semibold">A plan for your next {user.dailyMinutes} minutes</h2><p className="mt-2 text-sm">Recall a few ideas, continue your next lesson, and put one concept into practice.</p><Link className={buttonVariants({ className: "mt-4" })} href="/session">Start guided session</Link><Link className="ml-4 text-sm underline" href="/placement">Check your starting point</Link></section>
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
              <Sparkles className="h-5 w-5 text-emerald-500" />
              Next up
            </h2>
            <div className="space-y-3">
              {nextUp.length === 0 ? (
                <p className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                  Nothing queued. Pick a track to start something new.
                </p>
              ) : null}
              {nextUp.map((item) => (
                <Link
                  key={`${item.kind}-${item.href}`}
                  href={item.href}
                  className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 transition hover:border-emerald-400 hover:bg-emerald-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700 dark:hover:bg-emerald-950"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{item.title}</span>
                      {item.badge ? <Badge>{item.badge}</Badge> : null}
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.subtitle}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    {item.cta}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">Your tracks</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {tracks.map((track) => (
                <Link
                  key={track.slug}
                  href={`/courses/${track.slug}`}
                  className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-emerald-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{track.title}</span>
                    <Badge>{track.language}</Badge>
                  </div>
                  <Progress className="mt-3" value={track.pct} />
                  <p className="mt-2 text-xs text-slate-500">
                    {track.completed}/{track.total} lessons · {track.pct}%
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">Activity</h2>
            <ActivityHeatmap history={history.map(({ day, xp }) => ({ day, xp }))} />
          </section>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Daily quests</CardTitle>
              <span className="text-sm text-slate-500">
                {questsDone}/{quests.length}
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              {quests.map((quest) => (
                <div key={quest.id}>
                  <div className="flex items-start justify-between gap-2 text-sm">
                    <span className={quest.completed ? "text-slate-400 line-through" : ""}>{quest.title}</span>
                    {quest.completed ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    ) : (
                      <span className="shrink-0 text-xs text-slate-500">+{quest.xpReward} XP</span>
                    )}
                  </div>
                  <Progress className="mt-2" value={(quest.progress / quest.target) * 100} />
                  <p className="mt-1 text-xs text-slate-500">
                    {quest.progress} / {quest.target}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shakiest concepts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {weak.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Finish a lesson and answer a few reviews — this fills in from your own recall data.
                </p>
              ) : null}
              {weak.map((concept) => (
                <Link
                  key={concept.tag}
                  href={reviewTagHref(concept.tag)}
                  title={`Drill due #${concept.tag} cards`}
                  className="-mx-2 block rounded-md px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <div className="flex justify-between gap-2 text-sm">
                    <span>#{concept.tag}</span>
                    <span className="text-slate-500">{concept.strength}%</span>
                  </div>
                  <Progress className="mt-1.5" value={concept.strength} />
                </Link>
              ))}
              {weak.length > 0 ? (
                <Link href="/reviews" className={buttonVariants({ variant: "secondary", className: "w-full" })}>
                  Drill these
                </Link>
              ) : null}
            </CardContent>
          </Card>
        </aside>
      </div>
    </SiteShell>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
