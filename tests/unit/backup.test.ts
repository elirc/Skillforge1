import { describe, expect, it } from "vitest";
import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  buildContentIndex,
  parseBackup,
  planImport,
  serializeProgress,
  type ContentRows,
  type LearnerRows,
} from "@/lib/backup";
import { levelForXp } from "@/lib/gamification";

const at = new Date("2026-09-20T10:00:00.000Z");

function contentRows(prefix: string): ContentRows {
  return {
    lessons: [
      { id: `${prefix}-lesson-a`, order: 1, module: { order: 1, course: { slug: "js" } } },
      { id: `${prefix}-lesson-b`, order: 2, module: { order: 1, course: { slug: "js" } } },
    ],
    items: [
      { id: `${prefix}-item-a1`, order: 1, lessonId: `${prefix}-lesson-a` },
      { id: `${prefix}-item-a2`, order: 2, lessonId: `${prefix}-lesson-a` },
      { id: `${prefix}-item-b1`, order: 1, lessonId: `${prefix}-lesson-b` },
    ],
    problems: [{ id: `${prefix}-problem`, slug: "pair-sum" }],
    achievements: [{ id: `${prefix}-ach`, key: "first-forge" }],
  };
}

const learner: LearnerRows = {
  user: { name: "Eli", email: null, goal: "interview", experience: "junior", focusTags: ["sql"], onboardedAt: at },
  progress: { xp: 300, level: 3, streakCurrent: 4, streakLongest: 6, lastActiveDate: at, streakFreezes: 1, dailyXpGoal: 80 },
  lessonCompletions: [
    { lessonId: "old-lesson-a", createdAt: at },
    { lessonId: "old-lesson-b", createdAt: at },
  ],
  reviewStates: [
    {
      knowledgeItemId: "old-item-a2",
      dueAt: at,
      stability: 3.5,
      difficulty: 4.2,
      interval: 3,
      lapses: 1,
      reps: 2,
      lastReviewedAt: at,
      state: "REVIEW",
      createdAt: at,
    },
    {
      knowledgeItemId: "old-item-b1",
      dueAt: at,
      stability: 0,
      difficulty: 5,
      interval: 0,
      lapses: 0,
      reps: 0,
      lastReviewedAt: null,
      state: "NEW",
      createdAt: at,
    },
  ],
  attempts: [
    { knowledgeItemId: "old-item-a2", response: { choice: "b" }, correct: true, recallScore: "GOOD", durationMs: 1200, createdAt: at },
  ],
  problemSubmissions: [{ problemId: "old-problem", code: "return 1", passed: true, durationMs: 40, createdAt: at }],
  achievements: [{ achievementId: "old-ach", earnedAt: at }],
  xpEvents: [{ kind: "lesson", amount: 35, day: "2026-09-20", detail: null, createdAt: at }],
  quests: [
    { day: "2026-09-20", key: "daily-xp", title: "Earn 80 XP today", target: 80, progress: 35, xpReward: 20, completedAt: null, createdAt: at },
  ],
};

describe("serializeProgress", () => {
  const backup = serializeProgress(learner, buildContentIndex(contentRows("old")), at);

  it("keys content by stable identity, not by cuid", () => {
    expect(backup.format).toBe(BACKUP_FORMAT);
    expect(backup.version).toBe(BACKUP_VERSION);
    expect(backup.lessonCompletions.map((row) => row.lesson)).toEqual([
      { course: "js", module: 1, lesson: 1 },
      { course: "js", module: 1, lesson: 2 },
    ]);
    expect(backup.reviewStates[0].item).toEqual({ course: "js", module: 1, lesson: 1, item: 2 });
    expect(backup.problemSubmissions[0].problem).toBe("pair-sum");
    expect(backup.achievements[0].key).toBe("first-forge");
    expect(JSON.stringify(backup)).not.toContain("old-");
  });

  it("round-trips through JSON and the schema", () => {
    const parsed = parseBackup(JSON.parse(JSON.stringify(backup)));
    expect(parsed.ok).toBe(true);
  });

  it("drops rows whose content the index does not know", () => {
    const orphaned = serializeProgress(
      { ...learner, lessonCompletions: [{ lessonId: "ghost", createdAt: at }] },
      buildContentIndex(contentRows("old")),
      at,
    );
    expect(orphaned.lessonCompletions).toEqual([]);
  });
});

describe("planImport", () => {
  const backup = serializeProgress(learner, buildContentIndex(contentRows("old")), at);
  it("restores authored identities after lessons and items change position", () => {
    const original = contentRows("old");
    const changed = contentRows("new");
    original.lessons.forEach((row, index) => { row.contentKey = `lesson-key-${index}`; });
    original.items.forEach((row, index) => { row.contentKey = `item-key-${index}`; });
    changed.lessons.forEach((row, index) => { row.contentKey = `lesson-key-${index}`; row.order += 10; row.module.order += 20; });
    changed.items.forEach((row, index) => { row.contentKey = `item-key-${index}`; row.order += 20; });
    const exportFile = serializeProgress({ ...learner, user: { ...learner.user, dailyMinutes: 30 }, lessonCompletions: learner.lessonCompletions.map(row => ({ ...row, assisted: true })) }, buildContentIndex(original), at);
    const plan = planImport(exportFile, buildContentIndex(changed));
    expect(plan.skippedTotal).toBe(0);
    expect(plan.lessonCompletions[0]).toMatchObject({ lessonId: "new-lesson-a", assisted: true });
    expect(plan.reviewStates[0].knowledgeItemId).toBe("new-item-a2");
    expect(plan.profile.dailyMinutes).toBe(30);
  });

  it("maps stable keys onto the current database's ids", () => {
    const plan = planImport(backup, buildContentIndex(contentRows("new")));
    expect(plan.skippedTotal).toBe(0);
    expect(plan.lessonCompletions.map((row) => row.lessonId)).toEqual(["new-lesson-a", "new-lesson-b"]);
    expect(plan.reviewStates.map((row) => row.knowledgeItemId)).toEqual(["new-item-a2", "new-item-b1"]);
    expect(plan.attempts[0]).toMatchObject({ knowledgeItemId: "new-item-a2", response: { choice: "b" } });
    expect(plan.problemSubmissions[0].problemId).toBe("new-problem");
    expect(plan.achievements[0].achievementId).toBe("new-ach");
    expect(plan.reviewStates[0].dueAt).toEqual(at);
    expect(plan.profile.onboardedAt).toEqual(at);
    expect(plan.progress).toMatchObject({ xp: 300, level: levelForXp(300), streakCurrent: 4, lastActiveDate: at });
  });

  it("skips and counts entries whose content no longer exists", () => {
    const shrunk = contentRows("new");
    shrunk.lessons = shrunk.lessons.filter((lesson) => lesson.order === 1);
    shrunk.items = shrunk.items.filter((item) => item.lessonId === "new-lesson-a");
    shrunk.problems = [];

    const plan = planImport(backup, buildContentIndex(shrunk));
    expect(plan.skipped).toEqual({ lessonCompletions: 1, reviewStates: 1, attempts: 0, problemSubmissions: 1, achievements: 0 });
    expect(plan.skippedTotal).toBe(3);
    expect(plan.lessonCompletions).toHaveLength(1);
    // XP history is not content-bound, so it is always restored.
    expect(plan.xpEvents).toHaveLength(1);
    expect(plan.quests).toHaveLength(1);
  });

  it("recomputes level from XP and de-duplicates rows the tables keep unique", () => {
    const edited = {
      ...backup,
      progress: { ...backup.progress, xp: 5000, level: 1 },
      lessonCompletions: [...backup.lessonCompletions, backup.lessonCompletions[0]],
      achievements: [...backup.achievements, backup.achievements[0]],
    };
    const plan = planImport(edited, buildContentIndex(contentRows("new")));
    expect(plan.progress.level).toBe(levelForXp(5000));
    expect(plan.lessonCompletions).toHaveLength(2);
    expect(plan.achievements).toHaveLength(1);
  });
});

describe("parseBackup", () => {
  const backup = serializeProgress(learner, buildContentIndex(contentRows("old")), at);

  it("rejects other JSON with a readable error", () => {
    const result = parseBackup({ hello: "world" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/Not a valid Skillforge backup/);
  });

  it("rejects a future format version explicitly", () => {
    const result = parseBackup({ ...backup, version: 2 });
    expect(result).toEqual({ ok: false, error: expect.stringMatching(/Unsupported backup version 2/) });
  });

  it("rejects bad dates and negative XP", () => {
    expect(parseBackup({ ...backup, exportedAt: "yesterday" }).ok).toBe(false);
    expect(parseBackup({ ...backup, progress: { ...backup.progress, xp: -5 } }).ok).toBe(false);
  });
});
