import { prisma } from "@/lib/prisma";
import { parseTags } from "@/lib/enums";
import { conceptStrength } from "@/lib/srs/scheduler";
import { getCurrentUser } from "@/server/user";

export async function getReviewQueue() {
  const user = await getCurrentUser();
  const now = new Date();
  const items = await prisma.reviewState.findMany({
    where: { userId: user.id, dueAt: { lte: now } },
    include: {
      knowledgeItem: {
        include: {
          lesson: { include: { module: { include: { course: true } } } },
        },
      },
    },
    orderBy: { dueAt: "asc" },
    take: 20,
  });

  return items.map((item) => ({
    ...item,
    knowledgeItem: { ...item.knowledgeItem, conceptTags: parseTags(item.knowledgeItem.conceptTags) },
    strength: conceptStrength(item, now),
  }));
}

export async function getConceptInsights() {
  const user = await getCurrentUser();
  const now = new Date();
  const states = await prisma.reviewState.findMany({
    where: { userId: user.id },
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
