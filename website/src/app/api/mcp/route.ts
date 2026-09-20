/**
 * POST /api/mcp — the site's Model Context Protocol endpoint.
 *
 * A stateless Streamable HTTP server (mcp-handler on the MCP SDK v2) that
 * any MCP client can connect to with just this URL. The tools are
 * deterministic reads over generated registry data: the component prop API,
 * the component and token registries, and the site corpus. No model is
 * called, so there is no model spend to guard and no persona to defend; the
 * chat's guardrails deliberately do not apply here. Bandwidth and function
 * invocations are unmetered by choice — the tools are cheap in-memory reads,
 * and a limiter would cost more than the abuse it prevents. Revisit if a
 * tool ever stops being one.
 *
 * The security boundary is the corpus rule, inherited whole: everything
 * served is generated from already-published sources (component JSDoc that
 * ships in the npm tarball, the registries, the public site corpus), so the
 * worst case of any request is a stranger reading what was already public.
 * Never add a tool that reads anything else.
 *
 * A browser GET (Accept: text/html) gets a small landing page instead of a
 * JSON-RPC refusal — the URL is published in llms.txt and the README, so
 * people will type it in. MCP clients negotiate with their own Accept
 * headers and never see it.
 */
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

import pkg from "@robr0/design-system/package.json";
import {
  COMPONENT_COUNT,
  componentCategoryMetadata,
} from "@robr0/design-system/components/registry";
import {
  TOKEN_COUNT,
  TOKEN_COUNTS,
} from "@robr0/design-system/tokens/registry";

import { componentApi } from "@/data/component-api.generated";
import { MCP_CLIENTS } from "@/lib/mcp-clients";
import { MCP_TOOLS } from "@/lib/mcp-tools";
import { lookupComponent, lookupTokens, searchCorpus } from "@/lib/site-tools";
import { SITE_URL } from "@/lib/structuredData";

export const runtime = "nodejs";
export const maxDuration = 30;

/** Every tool answers in one text block; JSON for data, markdown for prose. */
const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] });
const json = (value: unknown) => text(JSON.stringify(value, null, 2));

// The tool implementations live in @/lib/site-tools, shared with the site
// chat's Anthropic tools (/api/chat) so the two surfaces cannot drift. The
// registrations stay here — scripts/validate-mcp-tools.mjs reads them from
// this file to hold the roster and every stated tool count.

/* ============================================
   The handler
   ============================================ */

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "list_components",
      {
        title: "List components",
        description:
          `List the ${COMPONENT_COUNT} public components in @robr0/design-system, ` +
          `with category, description and docs URL. Filter with the optional ` +
          `category argument. Use get_component for a component's full prop API.`,
        inputSchema: z.object({
          category: z
            .string()
            .optional()
            .describe("A category id from the categories list, to filter by"),
        }),
      },
      async ({ category }) => {
        const components = componentApi
          .filter((entry) => !category || entry.category === category)
          .map((entry) => ({
            name: entry.name,
            label: entry.label,
            category: entry.category,
            description: entry.description,
            docsUrl: `${SITE_URL}/components/${entry.slug}`,
          }));
        return json({
          package: pkg.name,
          version: pkg.version,
          categories: componentCategoryMetadata,
          count: components.length,
          components,
        });
      }
    );

    server.registerTool(
      "get_component",
      {
        title: "Get a component's prop API",
        description:
          "The full contract for one component: import paths, whether it needs " +
          "'use client', every exported component in its module, and every own " +
          "prop with its type, default, requiredness and JSDoc description. The " +
          "data is generated from the same source as the published .d.ts, so it " +
          "matches what npm ships.",
        inputSchema: z.object({
          name: z
            .string()
            .min(1)
            .describe("Component name, label or docs slug, e.g. Button or agent-plan"),
        }),
      },
      async ({ name }) => json(lookupComponent(name))
    );

    server.registerTool(
      "list_tokens",
      {
        title: "List design tokens",
        description:
          `List the ${TOKEN_COUNT} semantic design tokens by category ` +
          `(${Object.keys(TOKEN_COUNTS).join(", ")}). Components consume these as ` +
          `CSS custom properties; consumers re-theme by overriding them. Values ` +
          `and guidance live on ${SITE_URL}/foundations.`,
        inputSchema: z.object({
          category: z
            .string()
            .optional()
            .describe("A token category to filter by, e.g. colour or motion"),
        }),
      },
      async ({ category }) => json(lookupTokens(category))
    );

    server.registerTool(
      "search_site",
      {
        title: "Search the site",
        description:
          "Full-text search over everything published on robertritacca.com: the " +
          "design system docs and specs, case studies, essays, skills and the " +
          "project journal. Returns the most relevant sections as markdown.",
        inputSchema: z.object({
          query: z.string().min(2).max(200).describe("Words to look for"),
        }),
      },
      async ({ query }) => {
        const results = searchCorpus(query);
        if (results.length === 0) {
          return text(
            `Nothing matched ${JSON.stringify(query)}. The corpus covers the design ` +
              `system, Rob Ritacca's case studies and essays, and the site itself; ` +
              `try different words, or browse ${SITE_URL}/llms.txt for the index.`
          );
        }
        return text(results.join("\n\n---\n\n"));
      }
    );

    server.registerTool(
      "get_setup",
      {
        title: "Get install and theming setup",
        description:
          "How to install @robr0/design-system and wire up tokens, themes and " +
          "fonts in a consumer app.",
        inputSchema: z.object({}),
      },
      async () =>
        text(
          [
            `# Using ${pkg.name} ${pkg.version}`,
            "",
            "```bash",
            `npm install ${pkg.name}`,
            "```",
            "",
            "Import the token stylesheet once, then use components from the barrel or deep subpaths:",
            "",
            "```tsx",
            `import '${pkg.name}/tokens/tokens.css';`,
            `import { Button } from '${pkg.name}';`,
            "```",
            "",
            `Dark mode is data-theme="dark" on the root element; every semantic token has a light and a dark value. ` +
              `Re-theme by overriding the CSS custom properties (call list_tokens for the full set).`,
            "",
            `Fonts: the primary face is not bundled; set --font-family-primary to your own (the system ships with Nunito Sans in mind). ` +
              `The Material Symbols icon font ships inside the package.`,
            "",
            `Charts: components from '${pkg.name}/charts' need the optional recharts peer dependency; nothing else does.`,
            "",
            `Providers: none required — no theme provider, no configuration API. The one provider in the ` +
              `library is ToastProvider, needed only for the toast queue via useToast.`,
            "",
            `Full guide: ${SITE_URL}/docs/get-started. Live docs: ${SITE_URL}/components. ` +
              `Design spec: ${SITE_URL}/design.md.`,
            "",
            `Agent skill: ${SITE_URL}/skill/robr0-design-system/SKILL.md — run \`npx ${pkg.name} init\` ` +
              `to fetch it (with its references/components.md) into the project's ` +
              `.claude/skills/robr0-design-system/, or save the pair by hand. It carries the library's ` +
              `install, theming and catalogue rules into every session.`,
          ].join("\n")
        )
    );
  },
  {
    serverInfo: { name: "robr0-design-system", version: pkg.version },
    // Stateless for real: no subscriptions/listen SSE streams held open.
    maxSubscriptions: 0,
    instructions:
      `Documentation server for robertritacca.com and the ${pkg.name} React component ` +
      `library. Everything it serves is public. Start with list_components or ` +
      `search_site; get_component returns exact prop contracts for code generation.`,
  }
);

/* ============================================
   The human landing page

   A browser GET lands here with Accept: text/html
   and no MCP client to speak the protocol, so it
   gets a page that says what this URL is instead
   of a JSON-RPC refusal. MCP clients negotiate
   with their own Accept headers and never see it.
   ============================================ */

// The tool list and connect snippets the landing page renders live in
// @/lib/mcp-tools and @/lib/mcp-clients, shared with the get-started page.
// scripts/validate-mcp-tools.mjs holds the roster to the registrations above.
const claudeConnect = MCP_CLIENTS.find((client) => client.id === "claude-code")!;

function landingPage(): string {
  const toolRows = MCP_TOOLS.map(
    (tool) =>
      `<li><code>${tool.name}</code><span>${tool.blurb}</span></li>`
  ).join("\n      ");
  const promptRows = MCP_TOOLS.map(
    (tool) =>
      `<li><span class="ask">“${tool.prompt}”</span><span class="dim">${tool.name}</span></li>`
  ).join("\n      ");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MCP endpoint · Robert Ritacca</title>
<meta name="description" content="The Model Context Protocol endpoint for the ${pkg.name} component library. Point any MCP client at this URL.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:opsz,wght@6..12,400;6..12,600;6..12,700;6..12,800&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #FDFDFD; --tile: #FFFFFF; --border: #E4E4E4;
    --text-1: #1D1D1D; --text-2: #5C5C5C; --text-3: #8A8A8A;
    --teal: #0E6E8F; --code-bg: #F4F4F4;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #050505; --tile: #0E0E0E; --border: #232323;
      --text-1: #F1F1F1; --text-2: #BCBCBC; --text-3: #A2A2A2;
      --teal: #3CA5C6; --code-bg: #161616;
    }
  }
  * { margin: 0; box-sizing: border-box; }
  body {
    background: var(--bg); color: var(--text-1);
    font-family: 'Nunito Sans', sans-serif;
    line-height: 1.55; padding: 48px 24px;
    display: flex; justify-content: center;
  }
  main { max-width: 640px; width: 100%; }
  .kicker {
    font-size: 13px; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--text-3); margin-bottom: 10px;
  }
  h1 { font-size: 28px; font-weight: 800; margin-bottom: 12px; }
  p { color: var(--text-2); margin-bottom: 16px; }
  p b { color: var(--text-1); font-weight: 700; }
  .snippet {
    background: var(--code-bg); border: 1px solid var(--border);
    border-radius: 12px; padding: 14px 18px; margin: 20px 0 28px;
    font-family: ui-monospace, 'SF Mono', Menlo, monospace;
    font-size: 13.5px; color: var(--text-1);
    overflow-x: auto; white-space: nowrap;
  }
  .snippet .dim { color: var(--text-3); }
  h2 {
    font-size: 15px; font-weight: 800; margin: 26px 0 12px;
  }
  ul { list-style: none; padding: 0; }
  li {
    display: flex; gap: 14px; align-items: baseline;
    padding: 10px 0; border-bottom: 1px solid var(--border);
    font-size: 14.5px;
  }
  li:last-child { border-bottom: none; }
  li code {
    font-family: ui-monospace, 'SF Mono', Menlo, monospace;
    font-size: 13px; font-weight: 600; color: var(--teal);
    flex: none; min-width: 148px;
  }
  li span { color: var(--text-2); }
  li .ask { color: var(--text-1); flex: 1; }
  li .dim {
    font-family: ui-monospace, 'SF Mono', Menlo, monospace;
    font-size: 12px; color: var(--text-3); flex: none;
  }
  .links { margin-top: 30px; font-size: 14.5px; color: var(--text-3); }
  .links a { color: var(--teal); font-weight: 700; text-decoration: none; }
  .links a:hover { text-decoration: underline; }
</style>
</head>
<body>
<main>
  <div class="kicker">robertritacca.com</div>
  <h1>This URL is an MCP endpoint</h1>
  <p>You have reached the Model Context Protocol server for <b>${pkg.name}</b>, the component library behind this site. It is built for agents rather than browsers: an MCP client connects with nothing but this URL and reads the library's real documentation. No key, no account, and no model behind it; every tool is a deterministic read over published data.</p>
  <div class="snippet"><span class="dim">$</span> ${claudeConnect.snippet}</div>
  <h2>What a connected agent can do</h2>
  <ul>
      ${toolRows}
  </ul>
  <h2>Try asking</h2>
  <p>Once connected, each of these is answered by one tool.</p>
  <ul>
      ${promptRows}
  </ul>
  <p class="links">Reading as a person? The docs live at <a href="${SITE_URL}/components">robertritacca.com/components</a>, the install guide at <a href="${SITE_URL}/docs/get-started">get-started</a>, and the agent index at <a href="${SITE_URL}/llms.txt">llms.txt</a>. The package is <a href="https://www.npmjs.com/package/${pkg.name}">${pkg.name}</a> on npm.</p>
</main>
</body>
</html>
`;
}

const handleGet = (request: Request) => {
  const accept = request.headers.get("accept") ?? "";
  if (accept.includes("text/html") && !accept.includes("text/event-stream")) {
    return new Response(landingPage(), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
  return handler(request);
};

export { handleGet as GET, handler as POST };
