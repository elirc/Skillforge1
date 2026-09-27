import type { KnowledgeSeed } from "@/lib/content-schema";
import type { RecallScore } from "@/lib/srs/scheduler";

export interface GradeResult {
  correct: boolean;
  /** Human-readable correct answer, shown after the learner reveals or grades. */
  expected: string;
}

/** CODE correctness is established by the server's executable grader. */
export const CODE_REVIEW_EXPECTED = "Pass the executable tests without revealing hints or the solution.";

function normalizeBlank(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Accepts the shapes the UI has sent over time: a bare string, a string[], or
 * `{ answer: string | string[] }`. Anything else is treated as no answer.
 */
function extractAnswer(response: unknown): string | string[] | null {
  if (typeof response === "string") return response;
  if (Array.isArray(response)) {
    return response.every((part) => typeof part === "string") ? (response as string[]) : null;
  }
  if (response && typeof response === "object" && "answer" in response) {
    return extractAnswer((response as { answer: unknown }).answer);
  }
  return null;
}

function blanksMatch(expected: string[], given: string[]) {
  return (
    expected.length === given.length &&
    expected.every((blank, index) => normalizeBlank(blank) === normalizeBlank(given[index]))
  );
}

export function expectedAnswer(item: KnowledgeSeed): string {
  switch (item.type) {
    case "MCQ":
      return item.payload.answer;
    case "CLOZE":
      return item.payload.blanks.join(", ");
    case "CODE":
      return CODE_REVIEW_EXPECTED;
  }
}

/**
 * Pure, server-authoritative grading of a review response.
 *
 * - MCQ: the trimmed response must equal the trimmed answer exactly.
 * - CLOZE: each blank compares case-insensitively after trimming and collapsing
 *   whitespace. A single string is accepted for one blank, or comma-separated
 *   for several; a string[] is compared blank by blank.
 * - CODE: this pure helper cannot run code. The server must supply its verified verdict.
 */
export function gradeResponse(
  item: KnowledgeSeed,
  response: unknown,
  _recallScore: RecallScore,
): GradeResult {
  // Kept for callers using the original API; scheduling owns the recall rating.
  void _recallScore;
  const expected = expectedAnswer(item);
  const answer = extractAnswer(response);

  switch (item.type) {
    case "MCQ":
      return {
        correct: typeof answer === "string" && answer.trim() === item.payload.answer.trim(),
        expected,
      };
    case "CLOZE": {
      const { blanks } = item.payload;
      if (answer === null) return { correct: false, expected };
      if (Array.isArray(answer)) return { correct: blanksMatch(blanks, answer), expected };
      if (blanks.length === 1) {
        return { correct: normalizeBlank(answer) === normalizeBlank(blanks[0]), expected };
      }
      return { correct: blanksMatch(blanks, answer.split(",")), expected };
    }
    case "CODE":
      // Only the server's executable grader can verify a code submission.
      return { correct: false, expected };
  }
}
