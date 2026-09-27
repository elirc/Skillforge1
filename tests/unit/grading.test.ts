import { describe, expect, it } from "vitest";
import { knowledgeItemSchema, type KnowledgeSeed } from "@/lib/content-schema";
import { CODE_REVIEW_EXPECTED, expectedAnswer, gradeResponse } from "@/lib/grading";

const mcq: KnowledgeSeed = knowledgeItemSchema.parse({
  type: "MCQ",
  prompt: "Which keyword declares a block-scoped constant?",
  payload: { choices: ["var", "let", "const"], answer: "const", explanation: "const is block scoped." },
  conceptTags: ["variables"],
});

const cloze: KnowledgeSeed = knowledgeItemSchema.parse({
  type: "CLOZE",
  prompt: "Fill the blank",
  payload: { text: "Use ___ to await a promise", blanks: ["await"] },
  conceptTags: [],
});

const multiCloze: KnowledgeSeed = knowledgeItemSchema.parse({
  type: "CLOZE",
  prompt: "Fill both blanks",
  payload: { text: "___ JOIN keeps ___ rows", blanks: ["Left Outer", "unmatched"] },
  conceptTags: [],
});

const code: KnowledgeSeed = knowledgeItemSchema.parse({
  type: "CODE",
  prompt: "Write sum",
  payload: {
    starterCode: "export function sum() {}",
    functionName: "sum",
    tests: [{ name: "adds", args: [1, 2], expected: 3 }],
    referenceSolution: "export function sum(a, b) { return a + b; }",
  },
  conceptTags: [],
});

describe("gradeResponse", () => {
  describe("MCQ", () => {
    it("accepts the exact choice, trimmed", () => {
      expect(gradeResponse(mcq, "const", "good")).toEqual({ correct: true, expected: "const" });
      expect(gradeResponse(mcq, { answer: "  const " }, "good").correct).toBe(true);
    });

    it("rejects a wrong choice, a different case, and a missing answer", () => {
      expect(gradeResponse(mcq, "let", "good")).toEqual({ correct: false, expected: "const" });
      expect(gradeResponse(mcq, "CONST", "good").correct).toBe(false);
      expect(gradeResponse(mcq, undefined, "good").correct).toBe(false);
      expect(gradeResponse(mcq, { answer: 42 }, "easy").correct).toBe(false);
    });
  });

  describe("CLOZE", () => {
    it("ignores case, surrounding whitespace, and repeated inner whitespace", () => {
      expect(gradeResponse(cloze, "  AWAIT ", "good").correct).toBe(true);
      expect(gradeResponse(cloze, { answer: "Await" }, "hard").correct).toBe(true);
      expect(gradeResponse(cloze, "then", "good")).toEqual({ correct: false, expected: "await" });
      expect(gradeResponse(cloze, "", "good").correct).toBe(false);
    });

    it("grades multi-blank items from an array or a comma-separated string", () => {
      expect(gradeResponse(multiCloze, ["left   outer", " Unmatched"], "good").correct).toBe(true);
      expect(gradeResponse(multiCloze, "LEFT OUTER,unmatched", "good").correct).toBe(true);
      expect(gradeResponse(multiCloze, { answer: " left outer ,  unmatched " }, "good").correct).toBe(true);
      expect(gradeResponse(multiCloze, "left outer", "good").correct).toBe(false);
      expect(gradeResponse(multiCloze, ["unmatched", "left outer"], "good").correct).toBe(false);
      expect(gradeResponse(multiCloze, "left outer, unmatched, extra", "good").correct).toBe(false);
      expect(expectedAnswer(multiCloze)).toBe("Left Outer, unmatched");
    });
  });

  describe("CODE", () => {
    it("never treats a recall rating as proof of passing code", () => {
      expect(gradeResponse(code, { answer: "" }, "good")).toEqual({ correct: false, expected: CODE_REVIEW_EXPECTED });
      expect(gradeResponse(code, null, "hard").correct).toBe(false);
      expect(gradeResponse(code, null, "easy").correct).toBe(false);
      expect(gradeResponse(code, { answer: "anything" }, "again").correct).toBe(false);
    });
  });
});
