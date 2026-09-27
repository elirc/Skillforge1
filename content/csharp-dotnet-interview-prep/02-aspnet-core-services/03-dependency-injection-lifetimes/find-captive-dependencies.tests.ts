import type { TestCase } from "@content/_authoring/types";

export const functionName = "FindCaptiveDependencies";

type Lifetime = "Singleton" | "Scoped" | "Transient";

const reg = (Service: string, Lifetime: Lifetime, Dependencies: string[] = []) => ({ Service, Lifetime, Dependencies });

export const tests: TestCase[] = [
  {
    name: "a scoped service may depend on singletons and scoped services",
    args: [[reg("IClock", "Singleton"), reg("AppDbContext", "Scoped"), reg("ReviewService", "Scoped", ["AppDbContext", "IClock"])]],
    expected: [],
  },
  {
    name: "flags a singleton that injects a scoped DbContext",
    args: [[reg("AppDbContext", "Scoped"), reg("ReminderScheduler", "Singleton", ["AppDbContext"])]],
    expected: ["ReminderScheduler -> AppDbContext"],
  },
  {
    name: "finds a scoped service hidden behind a transient",
    args: [
      [
        reg("AppDbContext", "Scoped"),
        reg("TemplateRenderer", "Transient", ["AppDbContext"]),
        reg("CatalogCache", "Singleton", ["TemplateRenderer"]),
      ],
    ],
    expected: ["CatalogCache -> TemplateRenderer -> AppDbContext"],
  },
  {
    name: "shorter-lived consumers of longer-lived services are fine",
    args: [
      [
        reg("IClock", "Singleton"),
        reg("EmailRenderer", "Transient", ["IClock"]),
        reg("ReviewService", "Scoped", ["EmailRenderer", "IClock"]),
      ],
    ],
    expected: [],
  },
  {
    name: "reports every problem in registration order",
    args: [
      [
        reg("AppDbContext", "Scoped"),
        reg("CurrentUser", "Scoped"),
        reg("Metrics", "Singleton", ["CurrentUser"]),
        reg("Scheduler", "Singleton", ["AppDbContext", "CurrentUser"]),
      ],
    ],
    expected: ["Metrics -> CurrentUser", "Scheduler -> AppDbContext", "Scheduler -> CurrentUser"],
  },
  {
    name: "a singleton behind a singleton is reported once, at its own root",
    args: [[reg("AppDbContext", "Scoped"), reg("Inner", "Singleton", ["AppDbContext"]), reg("Outer", "Singleton", ["Inner"])]],
    expected: ["Inner -> AppDbContext"],
    hidden: true,
  },
  {
    name: "transient cycles and unregistered services do not break the walk",
    args: [
      [
        reg("A", "Transient", ["B", "Unregistered"]),
        reg("B", "Transient", ["A", "Session"]),
        reg("Session", "Scoped"),
        reg("Root", "Singleton", ["A"]),
      ],
    ],
    expected: ["Root -> A -> B -> Session"],
    hidden: true,
  },
];
