"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/user";
import { awardActivity, type AwardSummary } from "@/server/gamification";

const submitProblemSchema = z.object({
  problemId: z.string(),
  code: z.string().max(50_000),
  passed: z.boolean(),
  durationMs: z.number().int().min(0).max(600_000),
});

export async function recordProblemSubmissionAction(
  input: z.infer<typeof submitProblemSchema>,
): Promise<AwardSummary | null> {
  const parsed = submitProblemSchema.parse(input);
  const user = await getCurrentUser();

  const alreadySolved = await prisma.problemSubmission.findFirst({
    where: { userId: user.id, problemId: parsed.problemId, passed: true },
    select: { id: true },
  });

  await prisma.problemSubmission.create({
    data: {
      userId: user.id,
      problemId: parsed.problemId,
      code: parsed.code,
      passed: parsed.passed,
      durationMs: parsed.durationMs,
    },
  });

  // XP lands on the first green run only; re-solving is practice, not progress.
  const summary = parsed.passed && !alreadySolved ? await awardActivity(user.id, "exercise") : null;

  revalidatePath("/");
  revalidatePath("/problems");
  revalidatePath("/profile");
  return summary;
}
