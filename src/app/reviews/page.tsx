import Link from "next/link";
import { X } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ReviewSession } from "@/features/review/review-session";
import { getConceptInsights, getReviewQueue } from "@/features/review/queries";
import { normalizeTagParam, type TagSearchParam } from "@/lib/review-filter";

export const dynamic = "force-dynamic";

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<Record<string, TagSearchParam>> }) {
  const params = await searchParams;
  const tag = normalizeTagParam(params.tag);
  const limit = Math.min(20, Math.max(1, Number(params.limit) || 20));
  const [fullQueue, insights] = await Promise.all([getReviewQueue(tag), getConceptInsights()]);
  const queue = fullQueue.slice(0, limit);

  return (
    <SiteShell>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Reviews due</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Grade honestly. The scheduler rewards durable recall, not clicks.</p>
        {tag ? (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
            <span>
              Filtered to <strong className="font-semibold">#{tag}</strong>
            </span>
            <span aria-hidden>·</span>
            <Link href="/reviews" className="inline-flex items-center gap-1 font-medium hover:underline">
              <X className="h-3.5 w-3.5" aria-hidden />
              Clear
            </Link>
          </p>
        ) : null}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {tag && queue.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-2xl font-semibold">Nothing due for #{tag}</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Every #{tag} card is scheduled for later. Practice anyway?
            </p>
            <Link href="/reviews" className={buttonVariants({ className: "mt-4" })}>
              Open the full queue
            </Link>
          </div>
        ) : (
          // Remount per filter so the session snapshots the new queue from card 1.
          <ReviewSession key={`${tag ?? ""}:${limit}`} items={queue} />
        )}
        <aside className="space-y-3">
          <h2 className="font-semibold">Concept strength</h2>
          {insights.length === 0 ? <p className="text-sm text-slate-500">No concept history yet.</p> : null}
          {insights.map((insight) => (
            <div key={`${insight.tag}-${insight.prompt}`} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex justify-between gap-3 text-sm">
                <span>#{insight.tag}</span>
                <span>{insight.strength}%</span>
              </div>
              <Progress className="mt-2" value={insight.strength} />
              <p className="mt-2 line-clamp-2 text-xs text-slate-500">{insight.prompt}</p>
            </div>
          ))}
        </aside>
      </div>
    </SiteShell>
  );
}
