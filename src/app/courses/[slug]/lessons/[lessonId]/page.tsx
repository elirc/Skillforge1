import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { LessonPlayer } from "@/features/lessons/lesson-player";
import { parseTags } from "@/lib/enums";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/user";

interface PageProps {
  params: Promise<{ slug: string; lessonId: string }>;
}

export const dynamic = "force-dynamic";

export default async function LessonPage({ params }: PageProps) {
  const { slug, lessonId } = await params;
  const user = await getCurrentUser();
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId, archived: false },
    include: {
      knowledgeItems: { where: { archived: false }, orderBy: { order: "asc" } },
      completions: { where: { userId: user.id } },
      module: { include: { course: true } },
    },
  });

  if (!lesson || lesson.module.course.slug !== slug) notFound();
  const outline = await prisma.lesson.findMany({ where: { archived: false, module: { courseId: lesson.module.courseId, archived: false } }, orderBy: [{ module: { order: "asc" } }, { order: "asc" }], select: { id: true, title: true, completions: { where: { userId: user.id }, select: { id: true } } } });
  const currentIndex = outline.findIndex(row => row.id === lessonId);
  const previous = outline[currentIndex - 1];
  const next = outline[currentIndex + 1];

  return (
    <SiteShell>
      <div className="mb-4">
        <Link href={`/courses/${slug}`} className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-900">
          <ArrowLeft className="h-4 w-4" />
          Course outline
        </Link>
      </div>
      <div className="mb-6">
        <p className="text-sm text-slate-500">{lesson.module.course.title} / {lesson.module.title}</p>
        <h1 className="mt-1 text-3xl font-semibold">{lesson.title}</h1>
        <p className="mt-2 text-sm text-slate-500">About {lesson.estimatedMinutes} minutes · Lesson {currentIndex + 1} of {outline.length}</p>
        <details className="mt-4 rounded border p-3"><summary className="cursor-pointer">Course outline</summary><ol className="mt-3 space-y-2">{outline.map(row => <li key={row.id}><Link href={`/courses/${slug}/lessons/${row.id}`} aria-current={row.id === lessonId ? "step" : undefined} className={row.id === lessonId ? "font-semibold text-emerald-600" : "text-sm"}>{row.completions.length ? "✓ " : "○ "}{row.title}{row.id === lessonId ? " · Current" : ""}</Link></li>)}</ol></details>
      </div>
      <LessonPlayer
        lessonId={lesson.id}
        contentBlocks={lesson.contentBlocks}
        knowledgeItems={lesson.knowledgeItems.map((item) => ({
          id: item.contentKey ?? item.id,
          type: item.type,
          prompt: item.prompt,
          payload: item.payload,
          conceptTags: parseTags(item.conceptTags),
        }))}
        completed={lesson.completions.length > 0}
      />
      <nav aria-label="Lesson navigation" className="mt-8 flex justify-between gap-4 border-t pt-5">{previous ? <Link className="text-emerald-600" href={`/courses/${slug}/lessons/${previous.id}`}>← {previous.title}</Link> : <span />}{next ? <Link className="text-emerald-600" href={`/courses/${slug}/lessons/${next.id}`}>{next.title} →</Link> : <Link href={`/courses/${slug}`}>Course complete →</Link>}</nav>
    </SiteShell>
  );
}
