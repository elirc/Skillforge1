import type { TestCase } from "@content/_authoring/types";

export const functionName = "ChooseIndex";

// Record arguments are JSON objects keyed by the C# property names.
const reviewIndexes = [
  { Name: "IX_User_Item", Columns: ["UserId", "KnowledgeItemId"] },
  { Name: "IX_User_Due", Columns: ["UserId", "DueAt"] },
  { Name: "IX_Due", Columns: ["DueAt"] },
];

export const tests: TestCase[] = [
  {
    name: "the due queue uses (UserId, DueAt)",
    args: [reviewIndexes, { EqualityColumns: ["UserId"], RangeColumn: "DueAt", OrderByColumn: "DueAt" }],
    expected: "IX_User_Due",
  },
  {
    name: "a lookup by learner and item uses the unique pair",
    args: [reviewIndexes, { EqualityColumns: ["UserId", "KnowledgeItemId"], RangeColumn: null, OrderByColumn: null }],
    expected: "IX_User_Item",
  },
  {
    name: "a range on DueAt alone cannot use an index that starts with UserId",
    args: [reviewIndexes, { EqualityColumns: [], RangeColumn: "DueAt", OrderByColumn: null }],
    expected: "IX_Due",
  },
  {
    name: "no index helps a filter on an unindexed column",
    args: [reviewIndexes, { EqualityColumns: ["Prompt"], RangeColumn: null, OrderByColumn: null }],
    expected: "full-scan",
  },
  {
    name: "on a tie, prefer the index that already returns rows in ORDER BY order",
    args: [reviewIndexes, { EqualityColumns: ["UserId"], RangeColumn: null, OrderByColumn: "DueAt" }],
    expected: "IX_User_Due",
  },
  {
    name: "the order of equality predicates does not matter",
    args: [reviewIndexes, { EqualityColumns: ["KnowledgeItemId", "UserId"], RangeColumn: null, OrderByColumn: null }],
    expected: "IX_User_Item",
    hidden: true,
  },
  {
    name: "on a full tie, prefer the narrower index",
    args: [
      [
        { Name: "IX_Wide", Columns: ["UserId", "DueAt", "Grade"] },
        { Name: "IX_Narrow", Columns: ["UserId", "DueAt"] },
      ],
      { EqualityColumns: ["UserId"], RangeColumn: "DueAt", OrderByColumn: null },
    ],
    expected: "IX_Narrow",
    hidden: true,
  },
  {
    name: "a gap in the prefix stops the match",
    args: [
      [
        { Name: "IX_User_Course_Due", Columns: ["UserId", "CourseId", "DueAt"] },
        { Name: "IX_User", Columns: ["UserId"] },
      ],
      { EqualityColumns: ["UserId"], RangeColumn: "DueAt", OrderByColumn: null },
    ],
    expected: "IX_User",
    hidden: true,
  },
];
