import type { $Enums } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/user";
import { loadRuntimeProblemBySlug, loadRuntimeProblemSummaries } from "@/lib/problem-content";

export interface ProblemFilters {
  language?: string;
  difficulty?: $Enums.ProblemDifficulty;
  tag?: string;
}

const difficultyOrder = { EASY: 0, MEDIUM: 1, HARD: 2 };

/** Browse the standalone problem bank with optional filters, marking which the learner has already solved. */
export async function getProblems(filters: ProblemFilters = {}) {
  const user = await getCurrentUser();
  try {
    const problems = await prisma.problem.findMany({
      where: {
        language: filters.language,
        difficulty: filters.difficulty,
        conceptTags: filters.tag ? { has: filters.tag } : undefined,
      },
      // Enum order is EASY, MEDIUM, HARD, so ascending sorts easiest first.
      orderBy: [{ difficulty: "asc" }, { order: "asc" }],
    });

    if (problems.length > 0) {
      const solved = await prisma.problemSubmission.findMany({
        where: { userId: user.id, passed: true, problemId: { in: problems.map((problem) => problem.id) } },
        select: { problemId: true },
        distinct: ["problemId"],
      });
      const solvedIds = new Set(solved.map((entry) => entry.problemId));

      return problems.map((problem) => ({
        id: problem.id,
        slug: problem.slug,
        title: problem.title,
        prompt: problem.prompt,
        explanation: problem.explanation,
        language: problem.language,
        difficulty: problem.difficulty,
        conceptTags: problem.conceptTags,
        solved: solvedIds.has(problem.id),
      }));
    }
  } catch (error) {
    console.warn("Database unavailable; loading problems from content files.", error);
  }

  const problems = await loadRuntimeProblemSummaries();
  return problems
    .filter((problem) => !filters.language || problem.language === filters.language)
    .filter((problem) => !filters.difficulty || problem.difficulty === filters.difficulty)
    .filter((problem) => !filters.tag || problem.conceptTags.includes(filters.tag))
    .sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty] || a.order - b.order)
    .map((problem) => ({
      id: problem.slug,
      slug: problem.slug,
      title: problem.title,
      prompt: problem.prompt,
      explanation: problem.explanation,
      language: problem.language,
      difficulty: problem.difficulty,
      conceptTags: problem.conceptTags,
      solved: false,
    }));
}

export async function getProblemBySlug(slug: string) {
  try {
    const problem = await prisma.problem.findUnique({ where: { slug } });
    if (problem) return problem;
  } catch (error) {
    console.warn("Database unavailable; loading problem from content files.", error);
  }

  const problem = await loadRuntimeProblemBySlug(slug);
  if (!problem) return null;
  return {
    id: problem.slug,
    slug: problem.slug,
    title: problem.title,
    prompt: problem.prompt,
    explanation: problem.explanation,
    language: problem.language,
    difficulty: problem.difficulty,
    conceptTags: problem.conceptTags,
    starterCode: problem.starterCode,
    functionName: problem.functionName,
    tests: problem.tests,
    referenceSolution: problem.referenceSolution,
    order: problem.order,
  };
}
