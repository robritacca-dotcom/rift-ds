/**
 * The search tie-break: when two sections score the same, a page written for
 * people building with the package (docs, components, foundations, releases)
 * comes before a spec at /blueprints. The real index cannot force a tie, so
 * this file swaps it for two sections that differ only in where they live.
 * It has its own file because a module mock applies to every test beside it.
 */
import { describe, expect, it, vi } from "vitest";

vi.mock("@/data/site-search.generated", () => {
  const section = (url: string) => ({
    url,
    title: "Spacing",
    heading: "Spacing",
    body: "The spacing scale sets the gap between two controls.",
  });
  // The spec comes first, so a sort that ignored the tie-break would keep it there.
  return {
    siteSearchSections: [
      section("https://example.test/blueprints/design"),
      section("https://example.test/docs/spacing"),
      section("https://example.test/blueprints/content-design"),
    ],
  };
});

import { searchSite } from "./site-tools";

const sources = (results: string[]) => results.map((result) => result.split("\n")[1]);

describe("searchSite on a tied score", () => {
  it("puts a docs page before a /blueprints section", () => {
    const found = sources(searchSite("spacing scale"));
    expect(found).toHaveLength(3);
    expect(found[0]).toBe("Source: https://example.test/docs/spacing");
    expect(found.slice(1).every((source) => source.includes("/blueprints/"))).toBe(true);
  });
});
