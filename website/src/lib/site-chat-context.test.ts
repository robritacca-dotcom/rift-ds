/**
 * The site chat's screen block, held to the session that asked for it
 * (2026-11-22): on the Agent status page, with a "Thought for" line in the
 * panel, the chat told the visitor it could not see their screen and could
 * not say what the green tick was. Every case names what it guards.
 */
import { describe, expect, it } from "vitest";

import { namedPages, pageScreenLines, sanitiseSiteContext, siteContextBlock } from "./site-chat-context";

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

describe("pages the visitor names", () => {
  const ask = (...contents: string[]) => contents.map((content) => ({ role: "user" as const, content }));

  it("finds a component named in plain words, inside a longer phrase", () => {
    expect(namedPages(ask("Look at the live agent status"), null).map((page) => page.path)).toEqual(["/components/agent-status"]);
  });

  it("finds one written as the component name, an export name or the slug", () => {
    expect(namedPages(ask("What does AgentStatusMark draw?"), null)[0]?.path).toBe("/components/agent-status");
    expect(namedPages(ask("how is agent-status built"), null)[0]?.path).toBe("/components/agent-status");
  });

  it("skips the page already on screen", () => {
    expect(namedPages(ask("Look at the live agent status"), "/components/agent-status")).toEqual([]);
  });

  it("keeps a page an earlier message named, for a follow-up that only says its", () => {
    const messages = [...ask("Tell me about Reasoning"), { role: "assistant" as const, content: "It is a disclosure." }, ...ask("and what does its summary show?")];
    expect(namedPages(messages, null).map((page) => page.path)).toContain("/components/reasoning");
  });

  it("attaches a named page's words to the block", () => {
    const block = siteContextBlock(sanitiseSiteContext(JSON.stringify({ path: "/docs/get-started" }))!, { messages: ask("What is the live agent status?") }) ?? "";
    expect(block).toContain("## Pages they named");
    expect(block).toContain("### Agent status (/components/agent-status)");
    expect(block).toContain("Finished in 4s");
  });

  it("reads a one-word name only when it is written as one, never as an ordinary word", () => {
    expect(namedPages(ask("Does Rift list status icons?"), null)).toEqual([]);
    expect(namedPages(ask("What's the send button doing?"), null)).toEqual([]);
    expect(namedPages(ask("How do I use the Button?"), null)[0]?.path).toBe("/components/button");
    expect(namedPages(ask("what does the card component do"), null)[0]?.path).toBe("/components/card");
  });

  it("caps how many pages one message attaches", () => {
    expect(namedPages(ask("Compare Button, Badge, Tooltip, Accordion and Avatar"), null).length).toBeLessThanOrEqual(3);
  });
});
