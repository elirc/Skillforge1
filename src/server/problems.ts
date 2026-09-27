"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/server/user";
import type { AwardSummary } from "@/server/gamification";
import { saveProblemAttempt } from "@/server/submissions";
import { durationMsSchema } from "@/lib/activity-duration";
import { prisma } from "@/lib/prisma";
import { gradeCode } from "@/server/grade-code";
import { codeTestSchema } from "@/lib/content-schema";

const submitProblemSchema = z.object({
  problemId: z.string(),
  code: z.string().max(50_000),
  passed: z.boolean(),
  assisted: z.boolean().optional(),
  durationMs: durationMsSchema,
});

export async function recordProblemSubmissionAction(
  input: z.infer<typeof submitProblemSchema>,
): Promise<AwardSummary | null> {
  const parsed = submitProblemSchema.parse(input);
  const user = await getCurrentUser();

  const problem = await prisma.problem.findFirst({ where: { id: parsed.problemId, archived: false } });
  if (!problem) throw new Error("Problem is no longer available.");
  const verdict = await gradeCode({ code: parsed.code, functionName: problem.functionName, tests: codeTestSchema.array().parse(problem.tests) }, problem.runtime);
  const summary = await saveProblemAttempt(user.id, { ...parsed, passed: verdict.passed });

  revalidatePath("/");
  revalidatePath("/problems");
  revalidatePath("/profile");
  revalidatePath("/mastery");
  return summary;
}
