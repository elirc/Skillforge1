import { describe, expect, it } from "vitest";
import { filterByConceptTag, hasConceptTag, normalizeTagParam, reviewTagHref } from "@/lib/review-filter";

const card = (id: string, conceptTags: string[]) => ({ id, knowledgeItem: { conceptTags } });

describe("normalizeTagParam", () => {
  it("returns null when absent or blank", () => {
    expect(normalizeTagParam(undefined)).toBeNull();
    expect(normalizeTagParam("")).toBeNull();
    expect(normalizeTagParam("   ")).toBeNull();
    expect(normalizeTagParam("#")).toBeNull();
    expect(normalizeTagParam([])).toBeNull();
  });

  it("trims, lowercases, strips a leading # and takes the first array value", () => {
    expect(normalizeTagParam(" Closures ")).toBe("closures");
    expect(normalizeTagParam("#async")).toBe("async");
    expect(normalizeTagParam(["sql", "joins"])).toBe("sql");
  });
});

describe("hasConceptTag", () => {
  it("matches case-insensitively and exactly (no substring matches)", () => {
    expect(hasConceptTag(["Variables", "const"], "variables")).toBe(true);
    expect(hasConceptTag(["variables"], "var")).toBe(false);
    expect(hasConceptTag([], "variables")).toBe(false);
  });
});

describe("filterByConceptTag", () => {
  const items = [card("a", ["variables", "const"]), card("b", ["loops"]), card("c", ["const"]), card("d", [])];

  it("returns every item (as a copy) when no tag is given", () => {
    const result = filterByConceptTag(items, null);
    expect(result).toEqual(items);
    expect(result).not.toBe(items);
  });

  it("keeps only tagged items, preserving order", () => {
    expect(filterByConceptTag(items, "const").map((item) => item.id)).toEqual(["a", "c"]);
    expect(filterByConceptTag(items, "LOOPS").map((item) => item.id)).toEqual(["b"]);
  });

  it("returns an empty list when nothing carries the tag", () => {
    expect(filterByConceptTag(items, "generators")).toEqual([]);
  });
});

describe("reviewTagHref", () => {
  it("URL-encodes the tag", () => {
    expect(reviewTagHref("async")).toBe("/reviews?tag=async");
    expect(reviewTagHref("c# records")).toBe("/reviews?tag=c%23%20records");
    expect(reviewTagHref("a&b")).toBe("/reviews?tag=a%26b");
  });
});
