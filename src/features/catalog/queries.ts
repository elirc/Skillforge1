import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/user";

export async function getCatalogData() {
  const user = await getCurrentUser();
  try {
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
  } catch (error) {
    console.warn("Database unavailable; returning an empty catalog.", error);
    return { courses: [], completedLessonIds: new Set<string>() };
  }
}

export async function getCourseBySlug(slug: string) {
  const user = await getCurrentUser();
  try {
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
  } catch (error) {
    console.warn("Database unavailable; course lookup failed.", error);
    return null;
  }
}
