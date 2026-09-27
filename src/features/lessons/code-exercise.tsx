"use client";
import type { CodePayload } from "@/lib/content-schema";
import { ExerciseWorkspace, type ExerciseRun } from "./exercise-workspace";

export function CodeExercise({ id, payload, onPassed, onAssisted, onResult, onInvalidated }: { id: string; payload: CodePayload; onPassed: (assisted: boolean) => void; onAssisted?: () => void; onInvalidated?: () => void; onResult?: (run: ExerciseRun) => void }) {
  return <ExerciseWorkspace id={id} {...payload} onInvalidated={onInvalidated} onAssisted={onAssisted} onResult={run => { if (run.response.passed) onPassed(run.assisted); onResult?.(run); }} />;
}
