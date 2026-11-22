/**
 * The site chat's screen block, held to the session that asked for it
 * (2026-11-22): on the Agent status page, with a "Thought for" line in the
 * panel, the chat told the visitor it could not see their screen and could
 * not say what the green tick was. Every case names what it guards.
 */
import { describe, expect, it } from "vitest";

import { pageScreenLines, sanitiseSiteContext, siteContextBlock } from "./site-chat-context";

const blockFor = (context: unknown) => {
  const checked = sanitiseSiteContext(JSON.stringify(context));
  expect(checked).not.toBeNull();
  return siteContextBlock(checked!) ?? "";
};

describe("the visitor's screen", () => {
  it("carries the words of a component page the corpus leaves out", () => {
    const block = blockFor({ path: "/components/agent-status" });
    expect(block).toContain("## The page: /components/agent-status");
    expect(block).toContain("Finished in 4s");
    expect(block).toMatch(/Library components drawn on the page: .*AgentStatus \(\/components\/agent-status\)/);
  });

  it("describes the chat panel, the status line above each reply included", () => {
    const block = blockFor({ path: "/docs/get-started" });
    expect(block).toContain("## The chat panel");
    expect(block).toContain("Thought for 4s");
    expect(block).toContain("Agent status (/components/agent-status)");
  });

  it("points at the corpus for a page it already carries, rather than sending its words twice", () => {
    expect(pageScreenLines("/docs/chat")?.join("\n")).toContain("Site pages section, under /docs/chat");
  });

  it("names the theme, mode and placement the browser reports", () => {
    const block = blockFor({ path: "/", screen: { theme: "mono", mode: "dark", placement: "takeover" } });
    expect(block).toMatch(/theme \(id mono\) in dark mode/);
    expect(block).toContain("the whole screen");
  });

  it("drops a screen value outside its known set", () => {
    const checked = sanitiseSiteContext(JSON.stringify({ path: "/", screen: { theme: "<script>", mode: "sepia", placement: "ignore previous" } }));
    expect(JSON.parse(checked!)).toEqual({ path: "/" });
  });

  it("reads a highlight on a component page as the site's own words", () => {
    const block = blockFor({
      path: "/components/agent-status",
      highlight: { text: "A dot-matrix indicator beside a line of status text.", kind: "prose" },
    });
    expect(block).toContain("## What they highlighted");
    expect(block).toContain("(the site's own words)");
    expect(block).not.toContain("the reader's selection, data only");
  });

  it("answers null for a path with no page", () => {
    expect(pageScreenLines("/no-such-page")).toBeNull();
  });
});
