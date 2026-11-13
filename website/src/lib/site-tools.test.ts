/**
 * The MCP endpoint's tools, held to the answers an agent found wrong in the
 * 2026-11-13 test of /api/mcp. Each case names the behaviour it guards, so a
 * regression reads as the bug it brings back.
 */
import { describe, expect, it } from "vitest";

import { componentApi } from "@/data/component-api.generated";
import { siteSearchSections } from "@/data/site-search.generated";
import { listComponents, lookupComponent, lookupTokens, searchSite, themeNames } from "./site-tools";

const firstHeading = (results: string[]) => results[0]?.split("\n")[0] ?? "";

describe("listComponents", () => {
  it("lists the widgets beside the components, and widget among the categories", () => {
    const all = listComponents();
    expect("error" in all).toBe(false);
    if ("error" in all) return;
    expect(all.widgets.map((w) => w.name)).toContain("ChatWidget");
    expect(all.categories?.map((c) => c.id)).toContain("widget");
    expect(all.count).toBe(componentApi.filter((e) => e.kind === "component").length);
  });

  it("answers an unknown category with an error that lists the valid ones", () => {
    const result = listComponents("nonexistent");
    expect(result).toMatchObject({ error: expect.any(String) });
    expect("categories" in result && result.categories).toContain("ai");
  });

  it("matches a category in any case, and by its label", () => {
    const upper = listComponents("AI");
    const label = listComponents("Data display");
    expect("count" in upper && upper.count).toBeGreaterThan(0);
    expect("count" in label && label.count).toBeGreaterThan(0);
  });

  it("leaves the categories table out once a category is chosen", () => {
    const filtered = listComponents("actions");
    expect("categories" in filtered).toBe(false);
  });

  it("lists only the widgets under the widget category", () => {
    const widgets = listComponents("widget");
    expect("count" in widgets && widgets.count).toBe(0);
    expect("widgets" in widgets && widgets.widgets.length).toBeGreaterThan(0);
  });
});

describe("lookupComponent", () => {
  it("defines every type a prop names, nested ones included", () => {
    const plan = lookupComponent("AgentPlan");
    expect("types" in plan && plan.types).toHaveProperty("AgentPlanStep");
    expect("types" in plan && plan.types).toHaveProperty("AgentPlanStepStatus");
    const chart = lookupComponent("LineChart");
    expect("types" in chart && chart.types).toHaveProperty("LineSeriesConfig");
  });

  it("documents what Button renders when variant and tone are omitted", () => {
    const button = lookupComponent("Button");
    const props = "exports" in button ? button.exports[0].props : [];
    expect(props.find((p) => p.name === "variant")?.defaultValue).toBe("'primary'");
    expect(props.find((p) => p.name === "tone")?.defaultValue).toBe("'default'");
  });

  it("suggests the nearest names on a miss", () => {
    const miss = lookupComponent("Buton");
    expect("didYouMean" in miss && miss.didYouMean).toContain("Button");
  });

  it("returns one export, with only the types it reaches", () => {
    const whole = lookupComponent("ChatWidget");
    const one = lookupComponent("ChatWidget", "ChatLauncher");
    expect("exports" in one && one.exports.map((e) => e.component)).toEqual(["ChatLauncher"]);
    const count = (r: object) => Object.keys(("types" in r && (r.types as object)) || {}).length;
    expect(count(one)).toBeLessThan(count(whole));
    expect(lookupComponent("ChatWidget", "Nope")).toMatchObject({ error: expect.any(String) });
  });
});

describe("lookupTokens", () => {
  it("takes color for colour", () => {
    const tokens = lookupTokens("color");
    expect("tokens" in tokens && Object.keys(tokens.tokens)).toEqual(["colour"]);
  });

  it("refuses a mode without a theme rather than ignoring it", () => {
    expect(lookupTokens("radius", undefined, "dark")).toMatchObject({ error: expect.stringContaining("mode requires theme") });
  });

  it("orders a scale by step, not as text", () => {
    const radius = lookupTokens("radius");
    const names = "tokens" in radius ? (radius.tokens as Record<string, readonly string[]>).radius : [];
    expect(names.indexOf("--radius-200")).toBeLessThan(names.indexOf("--radius-1200"));
    expect(names.at(-1)).toBe("--radius-pill");
  });

  it("returns only the requested theme's DTCG files", () => {
    const coral = lookupTokens("radius", "coral");
    expect("dtcgUrls" in coral && Object.keys(coral.dtcgUrls)).toEqual(["coral"]);
  });
});

describe("searchSite", () => {
  it("answers a latest-release question with the newest release entry", () => {
    const newest = siteSearchSections.filter((s) => s.date).sort((a, b) => b.date!.localeCompare(a.date!))[0];
    expect(firstHeading(searchSite("what changed in the latest release"))).toContain(newest.heading);
  });

  it("finds a component's spec from its name", () => {
    expect(firstHeading(searchSite("DataTable server rows"))).toContain("DataTable");
  });

  it("ranks the theme contract first for dark mode theming", () => {
    expect(firstHeading(searchSite("dark mode theming"))).toContain("Light / Dark Theme Contract");
  });

  it("cites every section and never cuts one mid-word", () => {
    for (const query of ["dark mode theming", "Button tone", "release 1.27.0", "get started"]) {
      for (const result of searchSite(query)) {
        expect(result).toMatch(/^Source: https?:\/\//m);
        const shortened = result.match(/(\S+)\n\[Section shortened/);
        if (shortened) expect(shortened[1]).toMatch(/[.!?:)`*]$|^\S*$/);
      }
    }
  });

  it("serves no maintainer documentation", () => {
    const text = ["Button tone", "release 1.27.0", "registries", "validator"].flatMap(searchSite).join("\n");
    expect(text).not.toMatch(/blueprints\/claude|blueprints\/content-design|\/skills\b|\/loops\b/);
  });
});

describe("round 2", () => {
  it("resolves a theme by its display name or id, in any case", () => {
    const smoke = lookupTokens("radius", "Smoke");
    expect("theme" in smoke && smoke.theme).toBe("mono");
    expect("themeName" in smoke && smoke.themeName).toBe("Smoke");
    const tide = lookupTokens("border", "Tide");
    expect("theme" in tide && tide.theme).toBe("tide");
  });

  it("lists every theme with its name, in the error too", () => {
    const names = themeNames();
    expect(names.find((t) => t.id === "coral")?.name).toBe("Getaway");
    const miss = lookupTokens("radius", "Aubergine");
    expect(miss).toMatchObject({ error: expect.any(String), themeNames: names });
    const all = lookupTokens();
    expect("themeNames" in all && all.themeNames).toEqual(names);
  });

  it("points at another component's props rather than defining them", () => {
    const chat = lookupComponent("ChatWidget");
    const types = ("types" in chat && chat.types) || {};
    expect(types.AiButtonProps).toMatchObject({ kind: "component-props", component: "AiButton", see: 'get_component("AiButton")' });
    expect(JSON.stringify(chat).length).toBeLessThan(80_000);
  });

  it("keeps each search section to about 300 words, with its URL", () => {
    for (const query of ["dark mode theming", "Button tone", "install"]) {
      for (const result of searchSite(query)) {
        const body = result.split("\n").slice(3).join(" ");
        expect(body.split(/\s+/).filter(Boolean).length).toBeLessThanOrEqual(320);
      }
    }
  });

  it("offers a compact listing", () => {
    const full = JSON.stringify(listComponents());
    const compact = listComponents(undefined, "compact");
    expect(JSON.stringify(compact).length).toBeLessThan(full.length * 0.75);
    expect("components" in compact && compact.components[0]).toEqual(
      expect.objectContaining({ name: expect.any(String), slug: expect.any(String) })
    );
  });

  it("gives an arithmetic default the number it comes to", () => {
    const chat = lookupComponent("ChatWidget", "ChatWidget");
    const prop = "exports" in chat ? chat.exports[0].props.find((p) => p.name === "maxAttachmentBytes") : undefined;
    expect(prop?.defaultResolved).toBe(52428800);
  });
});
