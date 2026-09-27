"use client";
import type { SandboxTest } from "@/lib/sandbox/shared";
import { recordProblemSubmissionAction } from "@/server/problems";
import { useRewardStore } from "@/store/reward-store";
import { ExerciseWorkspace } from "@/features/lessons/exercise-workspace";

export function ProblemRunner({ problemId, ...exercise }: { problemId: string; starterCode: string; functionName: string; tests: SandboxTest[]; language?: string; referenceSolution?: string; hints?: string[]; walkthrough?: string }) {
  const celebrate = useRewardStore(state => state.celebrate);
  return <ExerciseWorkspace id={`problem-${problemId}`} {...exercise} onResult={async run => {
    const summary = await recordProblemSubmissionAction({ problemId, code: run.code, passed: run.response.passed, assisted: run.assisted, durationMs: run.durationMs });
    celebrate(summary);
  }} />;
}
