import { prisma } from "@/lib/prisma";
import { conceptStrength } from "@/lib/srs/scheduler";
import { parseTags, type Goal } from "@/lib/enums";
import { getCurrentUser } from "@/server/user";

/**
 * Which languages the learner sees first, by stated goal. The C# / SQL track is
 * the point of this build, so it leads for everything except a deliberate
 * fundamentals detour.
 */
const languagePriority: Record<Goal, string[]> = {
  "crud-dev": ["csharp", "sql", "typescript", "javascript", "python"],
  interview: ["csharp", "sql", "typescript", "javascript", "python"],
  fundamentals: ["javascript", "typescript", "csharp", "sql", "python"],
};

function rankLanguage(goal: Goal, language: string) {
  const index = languagePriority[goal].indexOf(language);
  return index === -1 ? languagePriority[goal].length : index;
}

export interface NextUpItem {
  kind: "review" | "lesson" | "problem" | "onboarding";
  title: string;
  subtitle: string;
  href: string;
  cta: string;
  /** Higher sorts first. */
  weight: number;
  badge?: string;
}

/** The weakest concepts by SRS strength — what the learner is actually shaky on. */
export async function getWeakConcepts(userId: string, limit = 6, now = new Date()) {
  const states = await prisma.reviewState.findMany({
    where: { userId, reps: { gte: 1 } },
    include: { knowledgeItem: { include: { lesson: { include: { module: { include: { course: true } } } } } } },
  });

  const byTag = new Map<string, { tag: string; total: number; count: number; course: string }>();
  for (const state of states) {
    const tags = parseTags(state.knowledgeItem.conceptTags);
    const strength = conceptStrength(state, now);
    const course = state.knowledgeItem.lesson.module.course.title;
    for (const tag of tags.length > 0 ? tags : ["general"]) {
      const entry = byTag.get(tag) ?? { tag, total: 0, count: 0, course };
      entry.total += strength;
      entry.count += 1;
      byTag.set(tag, entry);
    }
  }

  return Array.from(byTag.values())
    .map((entry) => ({ tag: entry.tag, course: entry.course, strength: Math.round(entry.total / entry.count), samples: entry.count }))
    .sort((a, b) => a.strength - b.strength)
    .slice(0, limit);
}

/** The next lesson the learner has not completed, respecting course/module/lesson order. */
export async function getNextLesson(userId: string, goal: Goal) {
  const courses = await prisma.course.findMany({
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: { completions: { where: { userId } } },
          },
        },
      },
    },
    orderBy: { order: "asc" },
  });

  const ordered = [...courses].sort(
    (a, b) => rankLanguage(goal, a.language) - rankLanguage(goal, b.language) || a.order - b.order,
  );

  for (const course of ordered) {
    for (const courseModule of course.modules) {
      for (const lesson of courseModule.lessons) {
        if (lesson.completions.length === 0) {
          return {
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            moduleTitle: courseModule.title,
            courseSlug: course.slug,
            courseTitle: course.title,
            language: course.language,
          };
        }
      }
    }
  }

  return null;
}

/** An unsolved problem, biased toward the learner's weakest concept tags. */
export async function getRecommendedProblem(userId: string, weakTags: string[], goal: Goal) {
  const [problems, solved] = await Promise.all([
    prisma.problem.findMany({ orderBy: [{ difficulty: "asc" }, { order: "asc" }] }),
    prisma.problemSubmission.findMany({
      where: { userId, passed: true },
      select: { problemId: true },
      distinct: ["problemId"],
    }),
  ]);

  const solvedIds = new Set(solved.map((entry) => entry.problemId));
  const unsolved = problems.filter((problem) => !solvedIds.has(problem.id));
  if (unsolved.length === 0) return null;

  const scored = unsolved.map((problem) => {
    const tags = parseTags(problem.conceptTags);
    const tagHits = tags.filter((tag) => weakTags.includes(tag)).length;
    return { problem, tags, score: tagHits * 10 - rankLanguage(goal, problem.language) };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  return {
    slug: best.problem.slug,
    title: best.problem.title,
    difficulty: best.problem.difficulty,
    language: best.problem.language,
    tags: best.tags,
    targetsWeakness: best.score >= 10,
  };
}

/** The dashboard's ranked "what should I do right now" list. */
export async function getNextUp(now = new Date()): Promise<NextUpItem[]> {
  const user = await getCurrentUser();
  const items: NextUpItem[] = [];

  if (!user.onboarded) {
    items.push({
      kind: "onboarding",
      title: "Set up your path",
      subtitle: "Two questions. They decide your track, your daily quests, and how hard the reviews push.",
      href: "/onboarding",
      cta: "Start",
      weight: 1000,
      badge: "1 min",
    });
  }

  const dueCount = await prisma.reviewState.count({ where: { userId: user.id, dueAt: { lte: now } } });
  if (dueCount > 0) {
    items.push({
      kind: "review",
      title: `${dueCount} review ${dueCount === 1 ? "card" : "cards"} due`,
      subtitle: "Clear these first — they are the concepts closest to slipping.",
      href: "/reviews",
      cta: "Review",
      weight: 900 + Math.min(dueCount, 50),
      badge: `${dueCount} due`,
    });
  }

  const nextLesson = await getNextLesson(user.id, user.goal);
  if (nextLesson) {
    items.push({
      kind: "lesson",
      title: nextLesson.lessonTitle,
      subtitle: `${nextLesson.courseTitle} · ${nextLesson.moduleTitle}`,
      href: `/courses/${nextLesson.courseSlug}/lessons/${nextLesson.lessonId}`,
      cta: "Continue",
      weight: 800,
      badge: nextLesson.language,
    });
  }

  const weak = await getWeakConcepts(user.id, 6, now);
  const problem = await getRecommendedProblem(
    user.id,
    weak.map((entry) => entry.tag),
    user.goal,
  );
  if (problem) {
    items.push({
      kind: "problem",
      title: problem.title,
      subtitle: problem.targetsWeakness
        ? `Picked because ${problem.tags.slice(0, 2).join(" and ")} is one of your weaker areas.`
        : `${problem.language} · warm up with a ${problem.difficulty.toLowerCase()} problem.`,
      href: `/problems/${problem.slug}`,
      cta: "Solve",
      weight: problem.targetsWeakness ? 850 : 700,
      badge: problem.difficulty,
    });
  }

  return items.sort((a, b) => b.weight - a.weight);
}

export interface TrackProgress {
  slug: string;
  title: string;
  language: string;
  difficulty: string;
  total: number;
  completed: number;
  pct: number;
  started: boolean;
}

/** Per-course completion, ordered by the learner's goal then by how far along they are. */
export async function getTrackProgress(userId: string, goal: Goal): Promise<TrackProgress[]> {
  const courses = await prisma.course.findMany({
    include: {
      modules: {
        include: { lessons: { include: { completions: { where: { userId } } } } },
      },
    },
  });

  return courses
    .map((course) => {
      const lessons = course.modules.flatMap((courseModule) => courseModule.lessons);
      const completed = lessons.filter((lesson) => lesson.completions.length > 0).length;
      return {
        slug: course.slug,
        title: course.title,
        language: course.language,
        difficulty: course.difficulty,
        total: lessons.length,
        completed,
        pct: lessons.length === 0 ? 0 : Math.round((completed / lessons.length) * 100),
        started: completed > 0,
      };
    })
    .sort(
      (a, b) =>
        Number(b.started) - Number(a.started) ||
        rankLanguage(goal, a.language) - rankLanguage(goal, b.language) ||
        a.title.localeCompare(b.title),
    );
}
