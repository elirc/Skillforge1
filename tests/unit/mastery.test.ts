import { describe, expect, it } from "vitest";
import { aggregateConcepts, groupMasteryByCourse, masteryBand, type ConceptSample } from "@/lib/mastery";

const now = new Date("2026-09-24T12:00:00Z");
const js = { slug: "javascript-foundations", title: "JavaScript Foundations", order: 1 };
const cs = { slug: "csharp", title: "C#", order: 2 };

function daysFromNow(days: number) {
  return new Date(now.getTime() + days * 86_400_000);
}

const samples: ConceptSample[] = [
  // Strong: due in 10 days, stability 10 -> (10 + 10) / 20 = 100.
  { tags: ["arrays"], course: js, state: { dueAt: daysFromNow(10), stability: 10, reps: 3 } },
  // Weak and due: overdue by 2 days, stability 2 -> (-2 + 2) / 4 = 0.
  { tags: ["arrays", "loops"], course: js, state: { dueAt: daysFromNow(-2), stability: 2, reps: 1 } },
  // Seeded by a lesson completion, never graded: due, but no strength.
  { tags: ["closures"], course: js, state: { dueAt: daysFromNow(-1), stability: 0, reps: 0 } },
  // Completed lesson item with no review state at all.
  { tags: ["records"], course: cs, state: null },
  { tags: ["arrays"], course: cs, state: { dueAt: daysFromNow(5), stability: 10, reps: 2 } },
  { tags: [], course: cs, state: null },
];

describe("aggregateConcepts", () => {
  it("averages strength per course and tag, counting samples and due cards", () => {
    const summaries = aggregateConcepts(samples, { now });
    const find = (slug: string, tag: string) => summaries.find((entry) => entry.course.slug === slug && entry.tag === tag);

    expect(find("javascript-foundations", "arrays")).toMatchObject({ strength: 50, samples: 2, due: 1 });
    expect(find("javascript-foundations", "loops")).toMatchObject({ strength: 0, samples: 1, due: 1 });
    expect(find("javascript-foundations", "closures")).toMatchObject({ strength: null, samples: 0, due: 1 });
    expect(find("csharp", "records")).toMatchObject({ strength: null, samples: 0, due: 0 });
    expect(find("csharp", "arrays")).toMatchObject({ strength: 75, samples: 1 });
    expect(find("csharp", "general")).toMatchObject({ strength: null });
  });

  it("merges a tag across courses when grouping by tag", () => {
    const reviewed = samples.filter((sample) => sample.state && sample.state.reps >= 1);
    const byTag = aggregateConcepts(reviewed, { now, groupBy: "tag" });
    const arrays = byTag.find((entry) => entry.tag === "arrays")!;
    expect(arrays.samples).toBe(3);
    expect(arrays.strength).toBe(Math.round((100 + 0 + 75) / 3));
    expect(arrays.course.slug).toBe("javascript-foundations");
  });
});

describe("groupMasteryByCourse", () => {
  it("orders courses, puts the weakest concept first and new ones last, and counts due cards once", () => {
    const groups = groupMasteryByCourse(aggregateConcepts(samples, { now }), samples, now);
    expect(groups.map((group) => group.course.slug)).toEqual(["javascript-foundations", "csharp"]);

    const [jsGroup, csGroup] = groups;
    expect(jsGroup.concepts.map((concept) => concept.tag)).toEqual(["loops", "arrays", "closures"]);
    // The overdue card carries two tags but is one card.
    expect(jsGroup.dueCount).toBe(2);
    expect(jsGroup.averageStrength).toBe(25);
    expect(csGroup.averageStrength).toBe(75);
    expect(csGroup.dueCount).toBe(0);
  });
});

describe("masteryBand", () => {
  it("labels strength ranges", () => {
    expect(masteryBand(null)).toBe("new");
    expect(masteryBand(10)).toBe("weak");
    expect(masteryBand(50)).toBe("shaky");
    expect(masteryBand(70)).toBe("solid");
    expect(masteryBand(95)).toBe("strong");
  });
});
