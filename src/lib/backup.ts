import { z } from "zod";
import { experienceSchema, goalSchema } from "@/lib/enums";
import { levelForXp } from "@/lib/gamification";

/**
 * Progress backup: the pure half. Serializes learner rows into a JSON document
 * keyed by immutable lesson/item IDs (legacy backups use positions),
 * problem slug and achievement key instead of cuids, and maps such a document
 * back onto whatever ids the current database uses. `src/server/backup.ts`
 * does the reading and writing.
 *
 * Import REPLACES progress; it never merges. Merging would double-count XP,
 * because the XP ledger and the totals on Progress would both be summed.
 */

export const BACKUP_FORMAT = "skillforge-progress";
export const BACKUP_VERSION = 1;

const isoDate = z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Expected an ISO date string");
const count = z.number().int().min(0);

export const lessonKeySchema = z.object({
  stableId: z.string().optional(),
  course: z.string().min(1),
  module: z.number().int(),
  lesson: z.number().int(),
});
export const itemKeySchema = lessonKeySchema.extend({ item: z.number().int(), itemStableId: z.string().optional() });

export type LessonKey = z.infer<typeof lessonKeySchema>;
export type ItemKey = z.infer<typeof itemKeySchema>;

export const progressBackupSchema = z.object({
  format: z.literal(BACKUP_FORMAT),
  version: z.literal(BACKUP_VERSION),
  exportedAt: isoDate,
  contentVersion: z.string().optional(),
  profile: z.object({
    name: z.string().trim().min(1).max(40),
    email: z.string().nullable().default(null),
    goal: goalSchema,
    experience: experienceSchema,
    focusTags: z.array(z.string()).max(50),
    dailyMinutes: z.number().int().min(5).max(120).optional(),
    onboardedAt: isoDate.nullable(),
  }),
  progress: z.object({
    xp: count,
    level: z.number().int().min(1),
    streakCurrent: count,
    streakLongest: count,
    lastActiveDate: isoDate.nullable(),
    streakFreezes: count,
    dailyXpGoal: z.number().int().min(1).max(10_000),
  }),
  lessonCompletions: z.array(z.object({ lesson: lessonKeySchema, createdAt: isoDate, assisted: z.boolean().optional() })),
  reviewStates: z.array(
    z.object({
      item: itemKeySchema,
      dueAt: isoDate,
      stability: z.number().finite(),
      difficulty: z.number().finite(),
      interval: z.number().int(),
      lapses: count,
      reps: count,
      lastReviewedAt: isoDate.nullable(),
      state: z.enum(["NEW", "LEARNING", "REVIEW", "RELEARNING"]),
      createdAt: isoDate,
    }),
  ),
  attempts: z.array(
    z.object({
      item: itemKeySchema,
      response: z.unknown(),
      correct: z.boolean(),
      recallScore: z.enum(["AGAIN", "HARD", "GOOD", "EASY"]),
      durationMs: count,
      createdAt: isoDate,
    }),
  ),
  problemSubmissions: z.array(
    z.object({
      problem: z.string().min(1),
      code: z.string(),
      passed: z.boolean(),
      assisted: z.boolean().optional(),
      durationMs: count,
      createdAt: isoDate,
    }),
  ),
  achievements: z.array(z.object({ key: z.string().min(1), earnedAt: isoDate })),
  xpEvents: z.array(
    z.object({
      kind: z.string().min(1),
      amount: z.number().int(),
      day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      detail: z.string().nullable(),
      createdAt: isoDate,
    }),
  ),
  quests: z.array(
    z.object({
      day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      key: z.string().min(1),
      title: z.string(),
      target: z.number().int().min(1),
      progress: count,
      xpReward: count,
      completedAt: isoDate.nullable(),
      createdAt: isoDate,
    }),
  ),
});

export type ProgressBackup = z.infer<typeof progressBackupSchema>;

export function parseBackup(input: unknown): { ok: true; backup: ProgressBackup } | { ok: false; error: string } {
  if (typeof input === "object" && input !== null && "format" in input && "version" in input) {
    const header = input as { format: unknown; version: unknown };
    if (header.format === BACKUP_FORMAT && header.version !== BACKUP_VERSION) {
      return { ok: false, error: `Unsupported backup version ${String(header.version)}; this build reads version ${BACKUP_VERSION}.` };
    }
  }
  const result = progressBackupSchema.safeParse(input);
  if (result.success) return { ok: true, backup: result.data };
  const issue = result.error.issues[0];
  const where = issue?.path.length ? ` at ${issue.path.join(".")}` : "";
  return { ok: false, error: `Not a valid Skillforge backup${where}: ${issue?.message ?? "unknown error"}` };
}

// -------------------------------------------------------------------------
// Content identity
// -------------------------------------------------------------------------

export function lessonKeyString(key: LessonKey) {
  if (key.stableId) return `stable:${key.stableId}`;
  return `${key.course}/${key.module}/${key.lesson}`;
}

export function itemKeyString(key: ItemKey) {
  if (key.itemStableId) return `stable:${key.itemStableId}`;
  return `${lessonKeyString(key)}/${key.item}`;
}

/** Shape of the content rows needed to translate between ids and stable keys. */
export interface ContentRows {
  lessons: { id: string; contentKey?: string | null; order: number; module: { order: number; course: { slug: string } } }[];
  items: { id: string; contentKey?: string | null; order: number; lessonId: string }[];
  problems: { id: string; slug: string }[];
  achievements: { id: string; key: string }[];
}

export interface ContentIndex {
  lessonKeyById: Map<string, LessonKey>;
  lessonIdByKey: Map<string, string>;
  itemKeyById: Map<string, ItemKey>;
  itemIdByKey: Map<string, string>;
  problemSlugById: Map<string, string>;
  problemIdBySlug: Map<string, string>;
  achievementKeyById: Map<string, string>;
  achievementIdByKey: Map<string, string>;
}

export function buildContentIndex(rows: ContentRows): ContentIndex {
  const lessonKeyById = new Map<string, LessonKey>();
  const lessonIdByKey = new Map<string, string>();
  for (const lesson of rows.lessons) {
    const legacy = { course: lesson.module.course.slug, module: lesson.module.order, lesson: lesson.order };
    const key = { ...legacy, ...(lesson.contentKey ? { stableId: lesson.contentKey } : {}) };
    lessonKeyById.set(lesson.id, key);
    lessonIdByKey.set(lessonKeyString(key), lesson.id);
    lessonIdByKey.set(lessonKeyString(legacy), lesson.id);
  }

  const itemKeyById = new Map<string, ItemKey>();
  const itemIdByKey = new Map<string, string>();
  for (const item of rows.items) {
    const lessonKey = lessonKeyById.get(item.lessonId);
    if (!lessonKey) continue;
    const key = { ...lessonKey, item: item.order, ...(item.contentKey ? { itemStableId: item.contentKey } : {}) };
    itemKeyById.set(item.id, key);
    itemIdByKey.set(itemKeyString(key), item.id);
    itemIdByKey.set(itemKeyString({ course: lessonKey.course, module: lessonKey.module, lesson: lessonKey.lesson, item: item.order }), item.id);
  }

  return {
    lessonKeyById,
    lessonIdByKey,
    itemKeyById,
    itemIdByKey,
    problemSlugById: new Map(rows.problems.map((problem) => [problem.id, problem.slug])),
    problemIdBySlug: new Map(rows.problems.map((problem) => [problem.slug, problem.id])),
    achievementKeyById: new Map(rows.achievements.map((achievement) => [achievement.id, achievement.key])),
    achievementIdByKey: new Map(rows.achievements.map((achievement) => [achievement.key, achievement.id])),
  };
}

// -------------------------------------------------------------------------
// Export
// -------------------------------------------------------------------------

/** Learner rows as Prisma returns them (only the columns the backup keeps). */
export interface LearnerRows {
  user: { name: string; email: string | null; goal: string; experience: string; focusTags: string[]; dailyMinutes?: number; onboardedAt: Date | null };
  progress: {
    xp: number;
    level: number;
    streakCurrent: number;
    streakLongest: number;
    lastActiveDate: Date | null;
    streakFreezes: number;
    dailyXpGoal: number;
  } | null;
  lessonCompletions: { lessonId: string; createdAt: Date; assisted?: boolean }[];
  reviewStates: {
    knowledgeItemId: string;
    dueAt: Date;
    stability: number;
    difficulty: number;
    interval: number;
    lapses: number;
    reps: number;
    lastReviewedAt: Date | null;
    state: string;
    createdAt: Date;
  }[];
  attempts: {
    knowledgeItemId: string;
    response: unknown;
    correct: boolean;
    recallScore: string;
    durationMs: number;
    createdAt: Date;
  }[];
  problemSubmissions: { problemId: string; code: string; passed: boolean; assisted?: boolean; durationMs: number; createdAt: Date }[];
  achievements: { achievementId: string; earnedAt: Date }[];
  xpEvents: { kind: string; amount: number; day: string; detail: string | null; createdAt: Date }[];
  quests: {
    day: string;
    key: string;
    title: string;
    target: number;
    progress: number;
    xpReward: number;
    completedAt: Date | null;
    createdAt: Date;
  }[];
}

function iso(date: Date | null) {
  return date ? date.toISOString() : null;
}

function present<T>(value: T | undefined): value is T {
  return value !== undefined;
}

/**
 * Builds the backup document. Rows pointing at content the index does not know
 * (which a consistent database never has) are dropped rather than exported
 * under an id that means nothing elsewhere. The result is validated against
 * the schema so an export can always be imported again.
 */
export function serializeProgress(rows: LearnerRows, index: ContentIndex, exportedAt = new Date()): ProgressBackup {
  const progress = rows.progress ?? {
    xp: 0,
    level: 1,
    streakCurrent: 0,
    streakLongest: 0,
    lastActiveDate: null,
    streakFreezes: 2,
    dailyXpGoal: 60,
  };

  const document = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: exportedAt.toISOString(),
    profile: {
      name: rows.user.name,
      email: rows.user.email,
      goal: rows.user.goal,
      experience: rows.user.experience,
      focusTags: rows.user.focusTags,
      dailyMinutes: rows.user.dailyMinutes,
      onboardedAt: iso(rows.user.onboardedAt),
    },
    progress: { ...progress, lastActiveDate: iso(progress.lastActiveDate) },
    lessonCompletions: rows.lessonCompletions
      .map((row) => {
        const lesson = index.lessonKeyById.get(row.lessonId);
        return lesson ? { lesson, createdAt: row.createdAt.toISOString(), assisted: row.assisted } : undefined;
      })
      .filter(present),
    reviewStates: rows.reviewStates
      .map(({ knowledgeItemId, ...row }) => {
        const item = index.itemKeyById.get(knowledgeItemId);
        return item
          ? {
              item,
              ...row,
              dueAt: row.dueAt.toISOString(),
              lastReviewedAt: iso(row.lastReviewedAt),
              createdAt: row.createdAt.toISOString(),
            }
          : undefined;
      })
      .filter(present),
    attempts: rows.attempts
      .map(({ knowledgeItemId, ...row }) => {
        const item = index.itemKeyById.get(knowledgeItemId);
        return item ? { item, ...row, createdAt: row.createdAt.toISOString() } : undefined;
      })
      .filter(present),
    problemSubmissions: rows.problemSubmissions
      .map(({ problemId, ...row }) => {
        const problem = index.problemSlugById.get(problemId);
        return problem ? { problem, ...row, createdAt: row.createdAt.toISOString() } : undefined;
      })
      .filter(present),
    achievements: rows.achievements
      .map((row) => {
        const key = index.achievementKeyById.get(row.achievementId);
        return key ? { key, earnedAt: row.earnedAt.toISOString() } : undefined;
      })
      .filter(present),
    xpEvents: rows.xpEvents.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() })),
    quests: rows.quests.map((row) => ({ ...row, completedAt: iso(row.completedAt), createdAt: row.createdAt.toISOString() })),
  };

  return progressBackupSchema.parse(document);
}

// -------------------------------------------------------------------------
// Import
// -------------------------------------------------------------------------

export interface ImportSkipped {
  lessonCompletions: number;
  reviewStates: number;
  attempts: number;
  problemSubmissions: number;
  achievements: number;
}

/** Rows ready to insert for one user, with current content ids resolved. */
export interface ImportPlan {
  profile: { name: string; email: string | null; goal: string; experience: string; focusTags: string[]; dailyMinutes?: number; onboardedAt: Date | null };
  progress: {
    xp: number;
    level: number;
    streakCurrent: number;
    streakLongest: number;
    lastActiveDate: Date | null;
    streakFreezes: number;
    dailyXpGoal: number;
  };
  lessonCompletions: { lessonId: string; createdAt: Date; assisted?: boolean }[];
  reviewStates: {
    knowledgeItemId: string;
    dueAt: Date;
    stability: number;
    difficulty: number;
    interval: number;
    lapses: number;
    reps: number;
    lastReviewedAt: Date | null;
    state: string;
    createdAt: Date;
  }[];
  attempts: {
    knowledgeItemId: string;
    response: unknown;
    correct: boolean;
    recallScore: string;
    durationMs: number;
    createdAt: Date;
  }[];
  problemSubmissions: { problemId: string; code: string; passed: boolean; assisted?: boolean; durationMs: number; createdAt: Date }[];
  achievements: { achievementId: string; earnedAt: Date }[];
  xpEvents: { kind: string; amount: number; day: string; detail: string | null; createdAt: Date }[];
  quests: {
    day: string;
    key: string;
    title: string;
    target: number;
    progress: number;
    xpReward: number;
    completedAt: Date | null;
    createdAt: Date;
  }[];
  skipped: ImportSkipped;
  skippedTotal: number;
}

function dateOrNull(value: string | null) {
  return value === null ? null : new Date(value);
}

/** Keeps the last row per key, matching the unique constraints the tables enforce. */
function uniqueBy<T>(rows: T[], key: (row: T) => string) {
  return Array.from(new Map(rows.map((row) => [key(row), row])).values());
}

/**
 * Resolves every stable key to a current id. Entries whose content no longer
 * exists (a lesson that was deleted or renumbered, a retired problem or
 * achievement) are skipped and counted, never guessed at.
 */
export function planImport(backup: ProgressBackup, index: ContentIndex): ImportPlan {
  const skipped: ImportSkipped = { lessonCompletions: 0, reviewStates: 0, attempts: 0, problemSubmissions: 0, achievements: 0 };

  function resolve<T, R>(rows: T[], bucket: keyof ImportSkipped, map: (row: T) => R | undefined): R[] {
    const out: R[] = [];
    for (const row of rows) {
      const mapped = map(row);
      if (mapped === undefined) skipped[bucket] += 1;
      else out.push(mapped);
    }
    return out;
  }

  const lessonCompletions = uniqueBy(
    resolve(backup.lessonCompletions, "lessonCompletions", (row) => {
      const lessonId = index.lessonIdByKey.get(lessonKeyString(row.lesson));
      return lessonId ? { lessonId, createdAt: new Date(row.createdAt), assisted: row.assisted } : undefined;
    }),
    (row) => row.lessonId,
  );

  const reviewStates = uniqueBy(
    resolve(backup.reviewStates, "reviewStates", ({ item, ...row }) => {
      const knowledgeItemId = index.itemIdByKey.get(itemKeyString(item));
      return knowledgeItemId
        ? {
            knowledgeItemId,
            ...row,
            dueAt: new Date(row.dueAt),
            lastReviewedAt: dateOrNull(row.lastReviewedAt),
            createdAt: new Date(row.createdAt),
          }
        : undefined;
    }),
    (row) => row.knowledgeItemId,
  );

  const attempts = resolve(backup.attempts, "attempts", ({ item, ...row }) => {
    const knowledgeItemId = index.itemIdByKey.get(itemKeyString(item));
    return knowledgeItemId ? { knowledgeItemId, ...row, createdAt: new Date(row.createdAt) } : undefined;
  });

  const problemSubmissions = resolve(backup.problemSubmissions, "problemSubmissions", ({ problem, ...row }) => {
    const problemId = index.problemIdBySlug.get(problem);
    return problemId ? { problemId, ...row, createdAt: new Date(row.createdAt) } : undefined;
  });

  const achievements = uniqueBy(
    resolve(backup.achievements, "achievements", (row) => {
      const achievementId = index.achievementIdByKey.get(row.key);
      return achievementId ? { achievementId, earnedAt: new Date(row.earnedAt) } : undefined;
    }),
    (row) => row.achievementId,
  );

  const { progress } = backup;
  const skippedTotal = Object.values(skipped).reduce((sum, value) => sum + value, 0);

  return {
    profile: { ...backup.profile, onboardedAt: dateOrNull(backup.profile.onboardedAt) },
    progress: {
      ...progress,
      // Recomputed so a hand-edited file cannot leave level and XP disagreeing.
      level: levelForXp(progress.xp),
      streakLongest: Math.max(progress.streakLongest, progress.streakCurrent),
      lastActiveDate: dateOrNull(progress.lastActiveDate),
    },
    lessonCompletions,
    reviewStates,
    attempts,
    problemSubmissions,
    achievements,
    xpEvents: backup.xpEvents.map((row) => ({ ...row, createdAt: new Date(row.createdAt) })),
    quests: uniqueBy(
      backup.quests.map((row) => ({ ...row, completedAt: dateOrNull(row.completedAt), createdAt: new Date(row.createdAt) })),
      (row) => `${row.day}\u0000${row.key}`,
    ),
    skipped,
    skippedTotal,
  };
}
