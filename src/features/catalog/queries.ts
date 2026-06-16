import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/user";

export async function getCatalogData() {
  const user = await getCurrentUser();
  const [courses, completions] = await Promise.all([
    prisma.course.findMany({
      include: {
        modules: { include: { lessons: true }, orderBy: { order: "asc" } },
      },
      orderBy: { order: "asc" },
    }),
    prisma.lessonCompletion.findMany({ where: { userId: user.id }, select: { lessonId: true } }),
  ]);

  return {
    courses,
    completedLessonIds: new Set(completions.map((completion) => completion.lessonId)),
  };
}

export async function getCourseBySlug(slug: string) {
  const user = await getCurrentUser();
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        include: {
          lessons: {
            include: { knowledgeItems: true, completions: { where: { userId: user.id } } },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  return course;
}
