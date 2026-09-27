import { conceptStrength, type SrsReviewState } from "@/lib/srs/scheduler";

/**
 * Pure concept-mastery aggregation. `src/server/mastery.ts` loads the rows;
 * this file only folds them, so it can be unit-tested without a database.
 */

export interface ConceptCourse {
  slug: string;
  title: string;
  order: number;
}

/** One review state (or one never-reviewed item), flattened with its content context. */
export interface ConceptSample {
  tags: string[];
  course: ConceptCourse;
  /** SRS state; null for an item from a completed lesson that has no review state. */
  state: (Pick<SrsReviewState, "dueAt" | "stability"> & { reps: number }) | null;
}

export interface ConceptSummary {
  tag: string;
  course: ConceptCourse;
  /** Mean `conceptStrength` over reviewed samples; null when never reviewed ("new"). */
  strength: number | null;
  /** Review states with at least one graded rep. */
  samples: number;
  /** Review states due now (including never-graded seeds from a completed lesson). */
  due: number;
}

export type MasteryBand = "new" | "weak" | "shaky" | "solid" | "strong";

export function masteryBand(strength: number | null): MasteryBand {
  if (strength === null) return "new";
  if (strength < 40) return "weak";
  if (strength < 65) return "shaky";
  if (strength < 85) return "solid";
  return "strong";
}

/**
 * Folds samples into one summary per concept tag. With `groupBy: "course"` the
 * same tag in two courses yields two summaries; with `"tag"` it yields one,
 * labelled with the first course it was seen in (what the dashboard shows).
 * Untagged items are counted under "general".
 */
export function aggregateConcepts(
  samples: readonly ConceptSample[],
  { now = new Date(), groupBy = "course" }: { now?: Date; groupBy?: "course" | "tag" } = {},
): ConceptSummary[] {
  const byKey = new Map<string, { tag: string; course: ConceptCourse; total: number; samples: number; due: number }>();

  for (const sample of samples) {
    const tags = sample.tags.length > 0 ? sample.tags : ["general"];
    const reviewed = sample.state !== null && sample.state.reps >= 1;
    const strength = reviewed && sample.state ? conceptStrength(sample.state, now) : 0;
    const due = sample.state !== null && sample.state.dueAt.getTime() <= now.getTime();

    for (const tag of new Set(tags)) {
      const key = groupBy === "course" ? `${sample.course.slug}\u0000${tag}` : tag;
      const entry = byKey.get(key) ?? { tag, course: sample.course, total: 0, samples: 0, due: 0 };
      if (reviewed) {
        entry.total += strength;
        entry.samples += 1;
      }
      if (due) entry.due += 1;
      byKey.set(key, entry);
    }
  }

  return Array.from(byKey.values()).map((entry) => ({
    tag: entry.tag,
    course: entry.course,
    strength: entry.samples === 0 ? null : Math.round(entry.total / entry.samples),
    samples: entry.samples,
    due: entry.due,
  }));
}

export interface CourseMastery {
  course: ConceptCourse;
  concepts: ConceptSummary[];
  /** Mean strength across reviewed concepts in this course; null if none reviewed. */
  averageStrength: number | null;
  /** Distinct review states due now in this course (a multi-tag card counts once). */
  dueCount: number;
}

/** Groups per-course summaries by course (in course order), weakest reviewed concept first, new ones last. */
export function groupMasteryByCourse(
  summaries: readonly ConceptSummary[],
  samples: readonly ConceptSample[] = [],
  now = new Date(),
): CourseMastery[] {
  const dueByCourse = new Map<string, number>();
  for (const sample of samples) {
    if (sample.state && sample.state.dueAt.getTime() <= now.getTime()) {
      dueByCourse.set(sample.course.slug, (dueByCourse.get(sample.course.slug) ?? 0) + 1);
    }
  }

  const byCourse = new Map<string, CourseMastery>();
  for (const summary of summaries) {
    const group = byCourse.get(summary.course.slug) ?? {
      course: summary.course,
      concepts: [],
      averageStrength: null,
      dueCount: 0,
    };
    group.concepts.push(summary);
    byCourse.set(summary.course.slug, group);
  }

  return Array.from(byCourse.values())
    .map((group) => {
      const reviewed = group.concepts.filter((concept) => concept.strength !== null);
      return {
        ...group,
        concepts: [...group.concepts].sort(
          (a, b) =>
            (a.strength ?? Number.POSITIVE_INFINITY) - (b.strength ?? Number.POSITIVE_INFINITY) ||
            a.tag.localeCompare(b.tag),
        ),
        averageStrength:
          reviewed.length === 0
            ? null
            : Math.round(reviewed.reduce((sum, concept) => sum + (concept.strength ?? 0), 0) / reviewed.length),
        dueCount: dueByCourse.get(group.course.slug) ?? 0,
      };
    })
    .sort((a, b) => a.course.order - b.course.order || a.course.title.localeCompare(b.course.title));
}
