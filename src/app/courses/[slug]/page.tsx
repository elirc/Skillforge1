import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlayCircle } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  modules: {
    id: string;
    title: string;
    lessons: {
      id: string;
      title: string;
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
          <Progress className="mt-4" value={progress} />
          <p className="mt-2 text-sm text-slate-500">
            {completed}/{lessons.length} lessons complete
          </p>
        </aside>
      </div>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold">Lessons</h2>
        {course.modules.map((module) => (
          <Card key={module.id}>
            <CardHeader>
              <CardTitle>{module.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
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
                </Link>
              ))}
            </CardContent>
          </Card>
        ))}
      </section>
    </SiteShell>
  );
}
