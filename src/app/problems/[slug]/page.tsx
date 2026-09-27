import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { Badge } from "@/components/ui/badge";
import { codeTestSchema } from "@/lib/content-schema";
import { ProblemRunner } from "@/features/problems/problem-runner";
import { getProblemBySlug } from "@/features/problems/queries";

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface ProblemExplanation {
  beginner: string;
  junior: string;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const problem = await getProblemBySlug(slug);
  if (!problem) return {};
  return {
    title: `${problem.title} | Skillforge`,
    description: problem.prompt,
  };
}

export default async function ProblemPage({ params }: PageProps) {
  const { slug } = await params;
  const problem = await getProblemBySlug(slug);
  if (!problem) notFound();

  const explanation = problem.explanation as unknown as ProblemExplanation;
  const tests = codeTestSchema.array().parse(problem.tests);

  return (
    <SiteShell>
      <div className="mb-4">
        <Link href="/problems" className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-900">
          <ArrowLeft className="h-4 w-4" />
          Problem bank
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-6">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge>Topic: {problem.language}</Badge>
              <Badge>You will write: {problem.runtime === "sql" ? "SQLite" : problem.runtime}</Badge>
              <Badge>{problem.difficulty.toLowerCase()}</Badge>
              {problem.conceptTags.slice(0, 4).map((tag) => (
                <Badge key={tag}>#{tag}</Badge>
              ))}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">{problem.title}</h1>
            <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-700 dark:text-slate-300">{problem.prompt}</p>
          </div>

          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-semibold">Solve</h2>
            <ProblemRunner
              problemId={problem.id}
              starterCode={problem.starterCode}
              functionName={problem.functionName}
              tests={tests}
              language={problem.runtime}
              referenceSolution={problem.referenceSolution}
              walkthrough={explanation.junior}
            />
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-semibold">Beginner explanation</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-400">{explanation.beginner}</p>
          </section>
          <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-semibold">Build independent understanding</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">Predict an output, implement the rule, then try an additional boundary case. Use Show solution for the implementation and its walkthrough; that run will be recorded as assisted practice.</p>
          </section>
        </aside>
      </div>
    </SiteShell>
  );
}
