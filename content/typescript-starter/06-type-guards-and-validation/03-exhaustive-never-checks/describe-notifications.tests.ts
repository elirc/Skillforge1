import type { TestCase } from "@content/_authoring/types";

export const functionName = "describeNotifications";

export const tests: TestCase[] = [
  {
    name: "describes a comment",
    args: [[{ kind: "comment", author: "Ada", postTitle: "Hello" }]],
    expected: ['Ada commented on "Hello"'],
  },
  {
    name: "describes mentions and follows",
    args: [
      [
        { kind: "mention", author: "Linus" },
        { kind: "follow", follower: "Grace" },
      ],
    ],
    expected: ["Linus mentioned you", "Grace started following you"],
  },
  {
    name: "pluralizes digests",
    args: [
      [
        { kind: "digest", count: 0 },
        { kind: "digest", count: 1 },
        { kind: "digest", count: 5 },
      ],
    ],
    expected: ["No new activity", "1 new update", "5 new updates"],
  },
  { name: "empty inbox", args: [[]], expected: [] },
  {
    name: "falls back for a kind the client does not know",
    args: [[{ kind: "badge", name: "streak-7" }]],
    expected: ["Unsupported notification: badge"],
    hidden: true,
  },
  {
    name: "keeps input order across kinds",
    args: [
      [
        { kind: "digest", count: 2 },
        { kind: "comment", author: "Alan", postTitle: "Types" },
      ],
    ],
    expected: ["2 new updates", 'Alan commented on "Types"'],
    hidden: true,
  },
];
