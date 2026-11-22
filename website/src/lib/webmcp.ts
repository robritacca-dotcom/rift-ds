"use client";

/**
 * A page's tools, offered to an agent in the reader's browser through WebMCP
 * (`document.modelContext`): the page says what it can do, and the browser's
 * agent calls it, with no server of ours in between. This is the whole of the
 * site's hold on that API, and it knows nothing about any one page: a page
 * hands `usePageTools` its tools and they are registered while it is mounted.
 *
 * Where the browser has no WebMCP, which today is nearly everywhere, the hook
 * does nothing at all: no polyfill, no dependency, nothing loaded. The API is a
 * draft (a Chrome origin trial, and `chrome://flags/#enable-webmcp-testing`
 * locally), so the shape used here is the small part of it that has held:
 * `registerTool(tool, { signal })`, unregistered by aborting the signal.
 */

import { useEffect, useRef } from "react";

/** One tool a page offers. */
export interface PageTool {
  name: string;
  description: string;
  /** JSON Schema for the input. */
  inputSchema: object;
  /** read only answers; page changes what the page shows; propose asks for a change the reader must confirm on the page. */
  kind: "read" | "page" | "propose";
  /** Runs the tool in the page. What it returns is the agent's answer. */
  execute: (input: Record<string, unknown>, options: { signal?: AbortSignal }) => unknown | Promise<unknown>;
}

type ModelContext = {
  registerTool: (
    tool: {
      name: string;
      description: string;
      inputSchema: object;
      annotations: { readOnlyHint: boolean; consequentialHint: boolean };
      execute: (input: Record<string, unknown>, options?: { signal?: AbortSignal }) => Promise<unknown>;
    },
    options?: { signal?: AbortSignal },
  ) => unknown;
};

/* `document.modelContext` is the draft's home for it; Chrome before 150 had it on `navigator`. */
const modelContext = (): ModelContext | null => {
  const found =
    (document as unknown as { modelContext?: ModelContext }).modelContext ??
    (navigator as unknown as { modelContext?: ModelContext }).modelContext;
  return typeof found?.registerTool === "function" ? found : null;
};

/**
 * Registers the tools with the browser's agent while the caller is mounted. The
 * list is registered once, by name; each call runs the tool as it is at that
 * moment, so an `execute` may close over state that changes between renders.
 */
export function usePageTools(tools: PageTool[]): void {
  const latest = useRef(tools);
  useEffect(() => {
    latest.current = tools;
  });
  const names = tools.map((tool) => tool.name).join(" ");

  useEffect(() => {
    const context = modelContext();
    if (!context) return;
    const controller = new AbortController();
    for (const tool of latest.current) {
      const { name } = tool;
      try {
        /* A name the browser refuses, or one already taken, leaves the others registered. */
        void Promise.resolve(
          context.registerTool(
            {
              name,
              description: tool.description,
              inputSchema: tool.inputSchema,
              annotations: { readOnlyHint: tool.kind === "read", consequentialHint: tool.kind === "propose" },
              execute: async (input, options) => {
                const current = latest.current.find((candidate) => candidate.name === name);
                if (!current) return "This tool is no longer available on the page.";
                return current.execute(input ?? {}, { signal: options?.signal });
              },
            },
            { signal: controller.signal },
          ),
        ).catch(() => undefined);
      } catch {
        /* As above. */
      }
    }
    return () => controller.abort();
  }, [names]);
}
