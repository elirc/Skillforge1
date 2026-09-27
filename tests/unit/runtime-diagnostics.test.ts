import { describe, expect, it } from "vitest";
import { compileTypeScript } from "@/lib/sandbox/typescript-compiler";
import { runSqlInNode } from "../../scripts/lib/sql-runner";
import { isLocalRequest } from "@/lib/local-request";

describe("real language runtimes", () => {
  it("reports semantic TypeScript errors rather than erasing them", () => {
    expect(compileTypeScript('function length(value: string | null) { return value.length; }').diagnostics.some(d => d.id === "TS18047")).toBe(true);
    const compiled = compileTypeScript('function length(value: string | null): number { return value === null ? 0 : value.length; }');
    expect(compiled.diagnostics).toEqual([]);
    expect(compiled.code).not.toContain(": number");
  }, 60_000);
  it("executes SQL against separate relational fixtures", async () => {
    const response = await runSqlInNode({ code: "UPDATE stock SET quantity=quantity-2 WHERE quantity>=2; SELECT quantity FROM stock;", functionName: "query", tests: [
      { name: "available", args: [{ setup: "CREATE TABLE stock(quantity INTEGER); INSERT INTO stock VALUES(3);" }], expected: [{ quantity: 1 }], hidden: false },
      { name: "insufficient", args: [{ setup: "CREATE TABLE stock(quantity INTEGER); INSERT INTO stock VALUES(1);" }], expected: [{ quantity: 1 }], hidden: false },
    ] });
    expect(response.passed).toBe(true);
  }, 30_000);
  it("requires exact same-origin loopback requests", () => {
    const request = (host: string, origin?: string) => new Request(`http://${host}/api/sandbox/csharp`, { headers: { host, ...(origin ? { origin } : {}) } });
    expect(isLocalRequest(request("127.0.0.1:3000", "http://127.0.0.1:3000"))).toBe(true);
    expect(isLocalRequest(request("127.0.0.1:3000"))).toBe(false);
    expect(isLocalRequest(request("127.0.0.1:3000", "http://127.0.0.1:4000"))).toBe(false);
    expect(isLocalRequest(request("evil.example", "http://evil.example"))).toBe(false);
  });
});
