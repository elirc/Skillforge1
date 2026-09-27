import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { awardActivity } from "@/server/gamification";
import { withSqliteBusyRetry } from "@/server/db-retry";

export interface ProblemAttempt {
  problemId: string;
  code: string;
  passed: boolean;
  assisted?: boolean;
  durationMs: number;
}

export async function saveProblemAttempt(
  userId: string,
  input: ProblemAttempt,
  { client = prisma, now = new Date(), beforeCommit }: { client?: PrismaClient; now?: Date; beforeCommit?: () => void | Promise<void> } = {},
) {
  return withSqliteBusyRetry(() => client.$transaction(async (tx) => {
    const solved = await tx.problemSubmission.findFirst({ where: { userId, problemId: input.problemId, passed: true }, select: { id: true } });
    await tx.problemSubmission.create({ data: { userId, ...input, createdAt: now } });
    const summary = input.passed && !solved ? await awardActivity(userId, "exercise", true, now, tx) : null;
    await beforeCommit?.();
    return summary;
  }, { maxWait: 10_000, timeout: 30_000 }));
}
