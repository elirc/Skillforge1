import { prisma } from "@/lib/prisma";
import { parseTags } from "@/lib/enums";
import {
  aggregateConcepts,
  groupMasteryByCourse,
  type ConceptSample,
  type CourseMastery,
} from "@/lib/mastery";

/**
 * Concept samples for one learner: every review state, plus the knowledge
 * items of completed lessons that have no review state (shown as "new").
 *
 * Derived on every render rather than cached: the learner is one person, the
 * query is two flat selects, and a cache would go stale after every review.
 */
export async function loadConceptSamples(
  userId: string,
  { reviewedOnly = false }: { reviewedOnly?: boolean } = {},
): Promise<ConceptSample[]> {
  const courseSelect = { select: { slug: true, title: true, order: true } } as const;
  const lessonSelect = { select: { module: { select: { course: courseSelect } } } } as const;

  const states = await prisma.reviewState.findMany({
    where: { userId, knowledgeItem: { archived: false }, ...(reviewedOnly ? { reps: { gte: 1 } } : {}) },
    select: {
      dueAt: true,
      stability: true,
      reps: true,
      knowledgeItem: { select: { id: true, conceptTags: true, lesson: lessonSelect } },
    },
  });

  const samples: ConceptSample[] = states.map((state) => ({
    tags: parseTags(state.knowledgeItem.conceptTags),
    course: state.knowledgeItem.lesson.module.course,
    state: { dueAt: state.dueAt, stability: state.stability, reps: state.reps },
  }));

  if (reviewedOnly) return samples;

  const seen = new Set(states.map((state) => state.knowledgeItem.id));
  // Filtered in memory rather than with `notIn`: the id list can outgrow
  // SQLite's bound-parameter limit for a learner with a long history.
  const completedItems = await prisma.knowledgeItem.findMany({
    where: { archived: false, lesson: { completions: { some: { userId } } } },
    select: { id: true, conceptTags: true, lesson: lessonSelect },
  });

  for (const item of completedItems) {
    if (seen.has(item.id)) continue;
    samples.push({ tags: parseTags(item.conceptTags), course: item.lesson.module.course, state: null });
  }

  return samples;
}

/** The weakest concepts by SRS strength — what the learner is actually shaky on. */
export async function getWeakConcepts(userId: string, limit = 6, now = new Date()) {
  const samples = await loadConceptSamples(userId, { reviewedOnly: true });
  return aggregateConcepts(samples, { now, groupBy: "tag" })
    .filter((entry) => entry.strength !== null)
    .map((entry) => ({
      tag: entry.tag,
      course: entry.course.title,
      strength: entry.strength ?? 0,
      samples: entry.samples,
    }))
    .sort((a, b) => a.strength - b.strength)
    .slice(0, limit);
}

export interface MasteryOverview {
  courses: CourseMastery[];
  totals: { concepts: number; reviewed: number; fresh: number; due: number; averageStrength: number | null };
}

/** Every concept the learner has touched, grouped by course, for `/mastery`. */
export async function getConceptMastery(userId: string, now = new Date()): Promise<MasteryOverview> {
  const samples = await loadConceptSamples(userId);
  const courses = groupMasteryByCourse(aggregateConcepts(samples, { now, groupBy: "course" }), samples, now);
  const concepts = courses.flatMap((course) => course.concepts);
  const reviewed = concepts.filter((concept) => concept.strength !== null);

  return {
    courses,
    totals: {
      concepts: concepts.length,
      reviewed: reviewed.length,
      fresh: concepts.length - reviewed.length,
      due: courses.reduce((sum, course) => sum + course.dueCount, 0),
      averageStrength:
        reviewed.length === 0
          ? null
          : Math.round(reviewed.reduce((sum, concept) => sum + (concept.strength ?? 0), 0) / reviewed.length),
    },
  };
}

export async function getLearningEvidence(userId: string) {
  const [completions, submissions, attempts] = await Promise.all([
    prisma.lessonCompletion.findMany({ where: { userId }, include: { lesson: { include: { knowledgeItems: true } } } }),
    prisma.problemSubmission.findMany({ where: { userId, passed: true }, include: { problem: { select: { conceptTags: true } } } }),
    prisma.attempt.findMany({ where: { userId, correct: true }, include: { knowledgeItem: { select: { type: true, conceptTags: true, lessonId: true } } } }),
  ]);
  const rows = new Map<string, { tag: string; lessons: Set<string>; assisted: Set<string>; independent: Set<string>; retained: Set<string> }>();
  const get = (tag: string) => { if (!rows.has(tag)) rows.set(tag, { tag, lessons: new Set(), assisted: new Set(), independent: new Set(), retained: new Set() }); return rows.get(tag)!; };
  const completedAt = new Map(completions.map(row => [row.lessonId, row.createdAt]));
  for (const completion of completions) for (const item of completion.lesson.knowledgeItems) for (const tag of parseTags(item.conceptTags)) {
    get(tag).lessons.add(completion.lessonId);
    if (completion.assisted) get(tag).assisted.add(`lesson:${completion.lessonId}`);
  }
  for (const submission of submissions) for (const tag of parseTags(submission.problem.conceptTags)) {
    const row = get(tag);
    (submission.assisted ? row.assisted : row.independent).add(`problem:${submission.problemId}`);
  }
  for (const attempt of attempts) {
    const firstSeen = completedAt.get(attempt.knowledgeItem.lessonId);
    const response = attempt.response as { code?: unknown; assisted?: unknown } | null;
    const verifiedCode = attempt.knowledgeItem.type === "CODE" && typeof response?.code === "string" && !response.assisted;
    for (const tag of parseTags(attempt.knowledgeItem.conceptTags)) {
      if (verifiedCode) get(tag).independent.add(`review:${attempt.knowledgeItemId}`);
      if (firstSeen && attempt.createdAt.getTime() - firstSeen.getTime() >= 86_400_000 && (attempt.knowledgeItem.type !== "CODE" || verifiedCode)) get(tag).retained.add(attempt.knowledgeItemId);
    }
  }
  return [...rows.values()].map(row => ({ tag: row.tag, lessons: row.lessons.size, assisted: row.assisted.size, independent: row.independent.size, retained: row.retained.size })).sort((a, b) => a.tag.localeCompare(b.tag));
}
