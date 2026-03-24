import { describe, it, expect } from "vitest";
import { toSlug, preprocessContent } from "./main.ts";

describe("toSlug", () => {
  it("converts a simple title", () => {
    expect(toSlug("Hello World")).toBe("hello-world");
  });

  it("handles diacritics", () => {
    expect(toSlug("Café Résumé")).toBe("cafe-resume");
  });

  it("strips special characters", () => {
    expect(toSlug("What's the Deal?!")).toBe("what-s-the-deal");
  });

  it("trims leading and trailing hyphens", () => {
    expect(toSlug("  --Hello--  ")).toBe("hello");
  });

  it("collapses consecutive separators", () => {
    expect(toSlug("foo   bar   baz")).toBe("foo-bar-baz");
  });

  it("returns empty for empty input", () => {
    expect(toSlug("")).toBe("");
  });
});

describe("preprocessContent", () => {
  it("converts wiki-links to plain text", () => {
    expect(preprocessContent("See [[My Note]] for details")).toBe(
      "See My Note for details",
    );
  });

  it("converts aliased wiki-links to alias text", () => {
    expect(preprocessContent("Read [[Long Title|this]]")).toBe("Read this");
  });

  it("removes embed links", () => {
    expect(preprocessContent("Before\n![[image.png]]\nAfter")).toBe(
      "Before\n\nAfter",
    );
  });

  it("removes Obsidian comments", () => {
    expect(preprocessContent("Visible %%hidden%% text")).toBe("Visible  text");
  });

  it("removes multiline comments", () => {
    const input = "Start\n%%\nThis is hidden\nacross lines\n%%\nEnd";
    expect(preprocessContent(input)).toBe("Start\n\nEnd");
  });

  it("removes dataview blocks", () => {
    const input = "Before\n```dataview\nLIST FROM #tag\n```\nAfter";
    expect(preprocessContent(input)).toBe("Before\n\nAfter");
  });

  it("removes dataviewjs blocks", () => {
    const input = "Before\n```dataviewjs\ndv.list()\n```\nAfter";
    expect(preprocessContent(input)).toBe("Before\n\nAfter");
  });

  it("collapses excessive blank lines", () => {
    expect(preprocessContent("A\n\n\n\n\nB")).toBe("A\n\nB");
  });

  it("preserves standard markdown", () => {
    const md = "# Title\n\n- bullet\n- list\n\n**bold** and *italic*";
    expect(preprocessContent(md)).toBe(md);
  });
});
