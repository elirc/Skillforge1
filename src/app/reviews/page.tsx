import { SiteShell } from "@/components/site-shell";
import { Progress } from "@/components/ui/progress";
import { ReviewSession } from "@/features/review/review-session";
import { getConceptInsights, getReviewQueue } from "@/features/review/queries";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const [queue, insights] = await Promise.all([getReviewQueue(), getConceptInsights()]);

  return (
    <SiteShell>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Reviews due</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Grade honestly. The scheduler rewards durable recall, not clicks.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <ReviewSession items={queue} />
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
