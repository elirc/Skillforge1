import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlayCircle } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getCourseBySlug } from "@/features/catalog/queries";

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface CoursePageData {
  slug: string;
  title: string;
  description: string;
  language: string;
  difficulty: string;
  outcomes: string[];
  prerequisites: string[];
  modules: {
    id: string;
    title: string;
    lessons: {
      id: string;
      title: string;
      estimatedMinutes: number;
      completions: unknown[];
      knowledgeItems: unknown[];
    }[];
  }[];
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = (await getCourseBySlug(slug)) as Pick<CoursePageData, "title" | "description"> | null;
  if (!course) return {};
  return {
    title: `${course.title} | Skillforge`,
    description: course.description,
  };
}

export default async function CoursePage({ params }: PageProps) {
  const { slug } = await params;
  const course = (await getCourseBySlug(slug)) as CoursePageData | null;
  if (!course) notFound();

  const lessons = course.modules.flatMap((module) => module.lessons);
  const completed = lessons.filter((lesson) => lesson.completions.length > 0).length;
  const resume = lessons.find(lesson => lesson.completions.length === 0) ?? lessons[0];
  const progress = lessons.length === 0 ? 0 : Math.round((completed / lessons.length) * 100);

  return (
    <SiteShell>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section>
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge>{course.language}</Badge>
            <Badge>{course.difficulty.toLowerCase()}</Badge>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight">{course.title}</h1>
          <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-400">{course.description}</p>
          {course.prerequisites.length ? <p className="mt-3 text-sm">Recommended first: {course.prerequisites.map((prerequisite, index) => <span key={prerequisite}>{index > 0 ? ", " : ""}<Link className="text-emerald-600 underline" href={`/courses/${prerequisite}`}>{prerequisite.replaceAll("-", " ")}</Link></span>)}</p> : <p className="mt-3 text-sm text-slate-500">No course prerequisites.</p>}
          {slug === "web-http-fundamentals" ? <Link className="mt-3 block text-emerald-700 underline dark:text-emerald-300" href="/playground/http">Practice in the HTTP request playground</Link> : null}
          {slug === "csharp-foundations" ? <Link className="mt-3 block text-emerald-700 underline dark:text-emerald-300" href="/projects">Download the console inventory and CSV importer mini-projects</Link> : null}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {course.outcomes.map((outcome) => (
              <div key={outcome} className="rounded-lg border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
                {outcome}
              </div>
            ))}
          </div>
        </section>
        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-semibold">Course progress</h2>
          {resume ? <Link className="mt-4 block rounded bg-emerald-600 px-4 py-3 text-center font-medium text-white" href={`/courses/${course.slug}/lessons/${resume.id}`}>{completed === lessons.length ? "Revisit course" : completed > 0 ? "Resume learning" : "Start course"}</Link> : null}
          <Progress className="mt-4" value={progress} />
          <p className="mt-2 text-sm text-slate-500">
            {completed}/{lessons.length} lessons complete
          </p>
        </aside>
      </div>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold">Lessons</h2>
        {course.modules.map((module) => (
          <details key={module.id} open={!module.lessons.every(lesson => lesson.completions.length > 0)} className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <summary className="cursor-pointer p-5 text-lg font-semibold">{module.title}{module.lessons.every(lesson => lesson.completions.length > 0) ? " · Complete" : ""}</summary>
            <div className="space-y-2 px-5 pb-5">
              {module.lessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/courses/${course.slug}/lessons/${lesson.id}`}
                  className="flex items-center justify-between rounded-md border border-slate-200 p-3 hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-800 dark:hover:bg-emerald-950"
                >
                  <span className="flex items-center gap-2">
                    <PlayCircle className="h-4 w-4 text-emerald-600" />
                    {lesson.title}
                  </span>
                  <span className="text-sm text-slate-500">{lesson.knowledgeItems.length} review items</span>
                  <span className="text-sm text-slate-500">{lesson.completions.length ? "✓ Complete" : `${lesson.id === resume?.id ? "Next · " : ""}~${lesson.estimatedMinutes} min`}</span>
                </Link>
              ))}
            </div>
          </details>
        ))}
      </section>
    </SiteShell>
  );
}
