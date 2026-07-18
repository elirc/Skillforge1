"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/user";
import { awardActivity } from "@/server/gamification";

const submitProblemSchema = z.object({
  problemId: z.string(),
  code: z.string().max(50_000),
  passed: z.boolean(),
  durationMs: z.number().int().min(0).max(600_000),
});

export async function recordProblemSubmissionAction(input: z.infer<typeof submitProblemSchema>) {
  const parsed = submitProblemSchema.parse(input);
  const user = await getCurrentUser();

  try {
    await prisma.problemSubmission.create({
      data: {
        userId: user.id,
        problemId: parsed.problemId,
        code: parsed.code,
        passed: parsed.passed,
        durationMs: parsed.durationMs,
      },
    });

    if (parsed.passed) {
      await awardActivity(user.id, "exercise");
    }
  } catch (error) {
    console.warn("Unable to record problem submission.", error);
  }

  revalidatePath("/problems");
  revalidatePath("/profile");
  return { ok: true };
}
