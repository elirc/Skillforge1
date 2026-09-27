import { prisma } from "@/lib/prisma";
import { parseTags, type ProblemDifficulty } from "@/lib/enums";
import { getCurrentUser } from "@/server/user";

export interface ProblemFilters {
  language?: string;
  difficulty?: ProblemDifficulty;
  tag?: string;
}

const difficultyOrder: Record<string, number> = { EASY: 0, MEDIUM: 1, HARD: 2 };

/** Browse the standalone problem bank with optional filters, marking which the learner has already solved. */
export async function getProblems(filters: ProblemFilters = {}) {
  const user = await getCurrentUser();

  const problems = await prisma.problem.findMany({
    where: { archived: false, language: filters.language, difficulty: filters.difficulty },
  });

  const solved = await prisma.problemSubmission.findMany({
    where: { userId: user.id, passed: true },
    select: { problemId: true },
    distinct: ["problemId"],
  });
  const solvedIds = new Set(solved.map((entry) => entry.problemId));

  return problems
    .map((problem) => ({
      id: problem.id,
      slug: problem.slug,
      title: problem.title,
      prompt: problem.prompt,
      explanation: problem.explanation,
      language: problem.language,
      runtime: problem.runtime,
      difficulty: problem.difficulty as ProblemDifficulty,
      conceptTags: parseTags(problem.conceptTags),
      order: problem.order,
      solved: solvedIds.has(problem.id),
    }))
    // conceptTags is JSON in SQLite, so tag filtering happens here rather than in SQL.
    .filter((problem) => !filters.tag || problem.conceptTags.includes(filters.tag))
    .sort(
      (a, b) => (difficultyOrder[a.difficulty] ?? 9) - (difficultyOrder[b.difficulty] ?? 9) || a.order - b.order,
    );
}

export async function getProblemBySlug(slug: string) {
  const problem = await prisma.problem.findUnique({ where: { slug, archived: false } });
  if (!problem) return null;
  return { ...problem, conceptTags: parseTags(problem.conceptTags) };
}
