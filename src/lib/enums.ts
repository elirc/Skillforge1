import { z } from "zod";

/**
 * SQLite has no enum type, so these columns are plain strings. Parse them here
 * rather than sprinkling `as` casts over the query layer.
 */

export const difficultySchema = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]);
export type Difficulty = z.infer<typeof difficultySchema>;

export const knowledgeItemTypeSchema = z.enum(["MCQ", "CODE", "CLOZE"]);
export type KnowledgeItemType = z.infer<typeof knowledgeItemTypeSchema>;

export const recallScoreEnumSchema = z.enum(["AGAIN", "HARD", "GOOD", "EASY"]);
export type RecallScoreEnum = z.infer<typeof recallScoreEnumSchema>;

export const reviewLifecycleSchema = z.enum(["NEW", "LEARNING", "REVIEW", "RELEARNING"]);
export type ReviewLifecycle = z.infer<typeof reviewLifecycleSchema>;

export const problemDifficultySchema = z.enum(["EASY", "MEDIUM", "HARD"]);
export type ProblemDifficulty = z.infer<typeof problemDifficultySchema>;

export const goalSchema = z.enum(["crud-dev", "interview", "fundamentals"]);
export type Goal = z.infer<typeof goalSchema>;

export const experienceSchema = z.enum(["beginner", "junior", "mid"]);
export type Experience = z.infer<typeof experienceSchema>;

export const goalLabels: Record<Goal, string> = {
  "crud-dev": "Ship CRUD web apps in C# / .NET",
  interview: "Pass a .NET backend interview",
  fundamentals: "Shore up programming fundamentals",
};

export const experienceLabels: Record<Experience, string> = {
  beginner: "New to the stack",
  junior: "Junior — I've shipped some code",
  mid: "Mid — I work in it daily",
};

/** SQLite columns that hold `string[]` are stored as a JSON string. */
export function parseTags(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function serializeTags(tags: readonly string[]): string {
  return JSON.stringify(tags);
}
