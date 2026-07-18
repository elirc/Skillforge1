import { SiteShell } from "@/components/site-shell";
import { ProblemsClient } from "@/features/problems/problems-client";
import { getProblems } from "@/features/problems/queries";

export const dynamic = "force-dynamic";

export default async function ProblemsPage() {
  const problems = await getProblems();

  return (
    <SiteShell>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Practice problems</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
          Work through focused JavaScript, TypeScript, React, and C# practice with runnable tests.
        </p>
      </div>
      <ProblemsClient problems={problems} />
    </SiteShell>
  );
}
