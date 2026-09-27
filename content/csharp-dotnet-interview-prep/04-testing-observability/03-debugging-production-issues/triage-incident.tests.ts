import type { TestCase } from "@content/_authoring/types";

export const functionName = "Triage";

const at = (hhmm: string) => `2026-06-16T${hhmm}:00Z`;
const deploys = [
  { Version: "1.4.0", At: at("09:00") },
  { Version: "1.5.0", At: at("13:00") },
];
const sample = (hhmm: string, ErrorRate: number) => ({ At: at(hhmm), ErrorRate });

export const tests: TestCase[] = [
  {
    name: "a spike shortly after a deploy means roll back to the previous version",
    args: [deploys, [sample("12:55", 0.01), sample("13:10", 0.02), sample("13:20", 0.3)], 0.05],
    expected: { Action: "rollback", Suspect: "1.5.0", RollbackTo: "1.4.0" },
  },
  {
    name: "no sample above the threshold means no incident",
    args: [deploys, [sample("13:10", 0.02), sample("13:20", 0.05)], 0.05],
    expected: { Action: "none", Suspect: null, RollbackTo: null },
  },
  {
    name: "a spike long after the last deploy points somewhere else",
    args: [deploys, [sample("15:30", 0.4)], 0.05],
    expected: { Action: "investigate", Suspect: null, RollbackTo: null },
  },
  {
    name: "the first deploy has nothing to roll back to",
    args: [deploys, [sample("09:15", 0.2)], 0.05],
    expected: { Action: "disable-feature", Suspect: "1.4.0", RollbackTo: null },
  },
  {
    name: "uses the earliest spike even when samples arrive out of order",
    args: [deploys, [sample("13:40", 0.5), sample("09:30", 0.3), sample("13:05", 0.01)], 0.05],
    expected: { Action: "disable-feature", Suspect: "1.4.0", RollbackTo: null },
  },
  {
    name: "deploys may be listed newest first",
    args: [
      [
        { Version: "2.1.0", At: at("11:00") },
        { Version: "2.0.0", At: at("10:00") },
        { Version: "1.9.0", At: at("08:00") },
      ],
      [sample("10:30", 0.9)],
      0.1,
    ],
    expected: { Action: "rollback", Suspect: "2.0.0", RollbackTo: "1.9.0" },
    hidden: true,
  },
  {
    name: "a spike before any deploy is not caused by a deploy",
    args: [deploys, [sample("08:00", 0.9)], 0.05],
    expected: { Action: "investigate", Suspect: null, RollbackTo: null },
    hidden: true,
  },
  {
    name: "exactly 60 minutes after a deploy is still inside the window",
    args: [deploys, [sample("14:00", 0.9)], 0.05],
    expected: { Action: "rollback", Suspect: "1.5.0", RollbackTo: "1.4.0" },
    hidden: true,
  },
];
