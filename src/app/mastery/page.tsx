import { SiteShell } from "@/components/site-shell";
import { MasteryView } from "@/features/mastery/mastery-view";
import { getConceptMastery, getLearningEvidence } from "@/server/mastery";
import { getCurrentUser } from "@/server/user";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mastery | Skillforge",
};

export default async function MasteryPage() {
  const user = await getCurrentUser();
  const overview = await getConceptMastery(user.id);
  const evidence = await getLearningEvidence(user.id);

  return (
    <SiteShell>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Concept mastery</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
          Every concept you have met, scored from your own review history. Weakest first, so you know where to spend
          the next session.
        </p>
      </div>
      <MasteryView overview={overview} />
      <section className="mt-8 space-y-3"><h2 className="text-xl font-semibold">What the evidence shows</h2><p className="text-sm text-slate-500">Finishing a lesson records exposure. Independent practice counts distinct problems or verified code reviews passed without revealed help. Retention counts correct cards at least a day after lesson completion. Recall percentages above estimate scheduling strength; they do not prove job readiness.</p>{evidence.length ? <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Learning evidence by concept</caption><thead><tr className="border-b">{["Concept", "Lessons completed", "Assisted activities", "Independent practice", "Retained cards"].map(title => <th scope="col" key={title} className="p-3">{title}</th>)}</tr></thead><tbody>{evidence.map(row => <tr className="border-b" key={row.tag}><th scope="row" className="p-3 font-medium">{row.tag}</th><td className="p-3">{row.lessons}</td><td className="p-3">{row.assisted}</td><td className="p-3">{row.independent}</td><td className="p-3">{row.retained}</td></tr>)}</tbody></table></div> : <p className="text-sm text-slate-500">Complete an activity to build your evidence record.</p>}</section>
    </SiteShell>
  );
}
