import { prisma } from "@/lib/prisma";
import { parseTags } from "@/lib/enums";
import { conceptStrength } from "@/lib/srs/scheduler";
import { filterByConceptTag } from "@/lib/review-filter";
import { getCurrentUser } from "@/server/user";

const QUEUE_SIZE = 20;

/**
 * Due review cards, oldest first, capped at QUEUE_SIZE. With a `tag`, only
 * cards whose knowledge item carries that concept tag are returned; tags live
 * in a JSON string column, so the filter runs in JS over every due card before
 * the cap is applied (fine for a single local learner).
 */
export async function getReviewQueue(tag: string | null = null) {
  const user = await getCurrentUser();
  const now = new Date();
  const items = await prisma.reviewState.findMany({
    where: { userId: user.id, dueAt: { lte: now }, knowledgeItem: { archived: false } },
    include: {
      knowledgeItem: {
        include: {
          lesson: { include: { module: { include: { course: true } } } },
        },
      },
    },
    orderBy: { dueAt: "asc" },
    ...(tag === null ? { take: QUEUE_SIZE } : {}),
  });

  const parsed = items.map((item) => ({
    ...item,
    knowledgeItem: { ...item.knowledgeItem, conceptTags: parseTags(item.knowledgeItem.conceptTags) },
  }));

  return filterByConceptTag(parsed, tag)
    .slice(0, QUEUE_SIZE)
    .map((item) => ({ ...item, strength: conceptStrength(item, now) }));
}

export async function getConceptInsights() {
  const user = await getCurrentUser();
  const now = new Date();
  const states = await prisma.reviewState.findMany({
    where: { userId: user.id, knowledgeItem: { archived: false } },
    include: { knowledgeItem: true },
    orderBy: { dueAt: "asc" },
    take: 12,
  });

  return states.map((state) => ({
    tag: parseTags(state.knowledgeItem.conceptTags)[0] ?? "general",
    prompt: state.knowledgeItem.prompt,
    strength: conceptStrength(state, now),
    dueAt: state.dueAt,
  }));
}
