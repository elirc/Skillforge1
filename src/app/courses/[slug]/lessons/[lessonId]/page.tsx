import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { LessonPlayer } from "@/features/lessons/lesson-player";
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
    where: { id: lessonId },
    include: {
      knowledgeItems: { orderBy: { createdAt: "asc" } },
      completions: { where: { userId: user.id } },
      module: { include: { course: true } },
    },
  });

  if (!lesson || lesson.module.course.slug !== slug) notFound();

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
      </div>
      <LessonPlayer
        lessonId={lesson.id}
        contentBlocks={lesson.contentBlocks}
        knowledgeItems={lesson.knowledgeItems.map((item) => ({
          type: item.type,
          prompt: item.prompt,
          payload: item.payload,
          conceptTags: item.conceptTags,
        }))}
        completed={lesson.completions.length > 0}
      />
    </SiteShell>
  );
}
