/**
 * Authoring types shared by code-exercise files (`*.tests.ts`).
 *
 * Content lives in the repo as the source of truth and is compiled into the
 * seed payload by `scripts/lib/content.ts`. These types only exist to give
 * exercise authors editor help and `tsc` validation; they are erased at build
 * time (imported with `import type`).
 */

export interface TestCase {
  /** Human-readable label shown in the lesson runner. */
  name: string;
  /** Positional arguments passed to the exercise function. */
  args: unknown[];
  /** Value the function is expected to return (compared by deep JSON equality). */
  expected: unknown;
  /** Hidden tests still run but their name/expectation are not revealed until the learner passes. */
  hidden?: boolean;
}
