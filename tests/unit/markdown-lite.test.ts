import { describe, expect, it } from "vitest";
import { parseInline, parseMarkdownLite } from "@/lib/markdown-lite";

describe("markdown-lite inline", () => {
  it("parses code spans and bold", () => {
    expect(parseInline("Use `const` for **fixed** bindings.")).toEqual([
      { type: "text", text: "Use " },
      { type: "code", text: "const" },
      { type: "text", text: " for " },
      { type: "bold", children: [{ type: "text", text: "fixed" }] },
      { type: "text", text: " bindings." },
    ]);
  });

  it("keeps bold markers literal inside code", () => {
    expect(parseInline("`a ** b`")).toEqual([{ type: "code", text: "a ** b" }]);
  });

  it("leaves unmatched markers as text", () => {
    expect(parseInline("2 ** 3 and a ` tick")).toEqual([{ type: "text", text: "2 ** 3 and a ` tick" }]);
  });

  it("never turns markup into anything but text", () => {
    expect(parseInline("<script>alert(1)</script>")).toEqual([{ type: "text", text: "<script>alert(1)</script>" }]);
  });
});

describe("markdown-lite blocks", () => {
  it("splits paragraphs on blank lines and joins soft line breaks", () => {
    const blocks = parseMarkdownLite("First line\nstill first.\n\nSecond.");
    expect(blocks).toEqual([
      { type: "paragraph", children: [{ type: "text", text: "First line still first." }] },
      { type: "paragraph", children: [{ type: "text", text: "Second." }] },
    ]);
  });

  it("builds bullet lists from lines starting with a dash", () => {
    const blocks = parseMarkdownLite("Three rules:\n- one `x`\n- two\n  continued\n\nAfter.");
    expect(blocks).toEqual([
      { type: "paragraph", children: [{ type: "text", text: "Three rules:" }] },
      {
        type: "list",
        items: [
          [{ type: "text", text: "one " }, { type: "code", text: "x" }],
          [{ type: "text", text: "two continued" }],
        ],
      },
      { type: "paragraph", children: [{ type: "text", text: "After." }] },
    ]);
  });

  it("does not treat a bold line start as a bullet", () => {
    expect(parseMarkdownLite("**Note** this")[0]).toMatchObject({ type: "paragraph" });
  });

  it("returns nothing for blank input", () => {
    expect(parseMarkdownLite("  \n\n ")).toEqual([]);
  });
});
