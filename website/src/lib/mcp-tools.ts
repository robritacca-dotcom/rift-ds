/**
 * The MCP tool roster as data: one entry per tool the /api/mcp route
 * registers. The route's browser landing page and the get-started page's
 * agent-docs section both render from this array, so the tool list and its
 * example prompts have one home. Held to the actual `server.registerTool`
 * calls in both directions by scripts/validate-mcp-tools.mjs, which also
 * requires every entry to carry a prompt: a new tool cannot ship without an
 * example of what it answers.
 *
 * Register: state what the tool returns, never promote (content-design.md).
 * A prompt is one question the tool can answer on its own; the tools are
 * deterministic reads, so a prompt must never imply the server can install,
 * write, or change anything.
 */
export interface McpTool {
  /** The name the route registers, exactly. */
  name: string;
  /** What the tool returns, one line. */
  blurb: string;
  /** One question a visitor can put to their connected agent. */
  prompt: string;
}

export const MCP_TOOLS: McpTool[] = [
  {
    name: "list_components",
    blurb: "every component in the library, with category, description and docs URL",
    prompt: "Which components are in the ai category?",
  },
  {
    name: "get_component",
    blurb: "one component's full prop contract, generated from the same JSDoc as the published .d.ts",
    prompt: "What props does DataTable take?",
  },
  {
    name: "list_tokens",
    blurb: "the semantic design tokens by category",
    prompt: "Which semantic tokens control motion?",
  },
  {
    name: "search_site",
    blurb: "full-text search over everything published on this site",
    prompt: "What has Rob written about design tokens?",
  },
  {
    name: "get_setup",
    blurb: "install and theming setup for a consumer app",
    prompt: "How do I install the library and set up dark mode?",
  },
];
