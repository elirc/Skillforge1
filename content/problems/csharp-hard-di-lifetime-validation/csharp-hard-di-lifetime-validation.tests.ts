import type { TestCase } from "@content/_authoring/types";

export const functionName = "Validate";

const reg = (Service: string, Lifetime: "Singleton" | "Scoped" | "Transient", Dependencies: string[] = []) => ({
  Service,
  Lifetime,
  Dependencies,
});

export const tests: TestCase[] = [
  {
    name: "a valid container has no errors",
    args: [
      [
        reg("OrdersController", "Transient", ["OrderService"]),
        reg("OrderService", "Scoped", ["OrderRepository", "Clock"]),
        reg("OrderRepository", "Scoped", ["AppDbContext"]),
        reg("AppDbContext", "Scoped"),
        reg("Clock", "Singleton"),
      ],
    ],
    expected: [],
  },
  {
    name: "reports a missing dependency",
    args: [[reg("OrderService", "Scoped", ["OrderRepository"])]],
    expected: ["OrderService depends on missing OrderRepository"],
  },
  {
    name: "a singleton cannot hold a scoped service",
    args: [[reg("PriceCache", "Singleton", ["AppDbContext"]), reg("AppDbContext", "Scoped")]],
    expected: ["PriceCache (Singleton) captures AppDbContext (Scoped)"],
  },
  {
    name: "captures through a transient",
    args: [
      [
        reg("EmailWorker", "Singleton", ["Mapper"]),
        reg("Mapper", "Transient", ["AppDbContext"]),
        reg("AppDbContext", "Scoped"),
      ],
    ],
    expected: ["EmailWorker (Singleton) captures AppDbContext (Scoped)"],
  },
  {
    name: "only the singleton closest to the scoped service is blamed",
    args: [[reg("A", "Singleton", ["B"]), reg("B", "Singleton", ["C"]), reg("C", "Scoped")]],
    expected: ["B (Singleton) captures C (Scoped)"],
  },
  {
    name: "reports services on a cycle but not those pointing into it",
    args: [[reg("A", "Transient", ["B"]), reg("B", "Transient", ["A"]), reg("C", "Transient", ["A"])]],
    expected: ["A is part of a cycle", "B is part of a cycle"],
  },
  {
    name: "a service that depends on itself is a cycle",
    args: [[reg("A", "Scoped", ["A"])]],
    expected: ["A is part of a cycle"],
    hidden: true,
  },
  {
    name: "the last registration wins",
    args: [
      [reg("Cache", "Singleton", ["Db"]), reg("Db", "Scoped"), reg("Cache", "Scoped", ["Db"])],
    ],
    expected: [],
    hidden: true,
  },
  {
    name: "reports several problems sorted and deduplicated",
    args: [[reg("X", "Singleton", ["Y", "Missing", "Missing"]), reg("Y", "Scoped")]],
    expected: ["X (Singleton) captures Y (Scoped)", "X depends on missing Missing"],
    hidden: true,
  },
];
