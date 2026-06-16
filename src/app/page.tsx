import { SiteShell } from "@/components/site-shell";
import { CatalogClient } from "@/features/catalog/catalog-client";
import { getCatalogData } from "@/features/catalog/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { courses, completedLessonIds } = await getCatalogData();

  return (
    <SiteShell>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Course catalog</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
          Short coding lessons that turn into scheduled review cards before the concepts fade.
        </p>
      </div>
      <CatalogClient courses={courses} completedLessonIds={Array.from(completedLessonIds)} />
    </SiteShell>
  );
}
