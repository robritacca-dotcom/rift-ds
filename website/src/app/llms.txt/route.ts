import {
  componentsSidebarLinks,
  docsSidebarLinks,
  foundationsSidebarLinks,
  templatesSidebarLinks,
  type NavLink,
} from "@/config/navigation";
import { SITE_URL } from "@/lib/structuredData";
import { NPM_URL, REPOSITORY_URL, SKILL_NAME, STORYBOOK_URL } from "@/config/brand.generated";

/**
 * /llms.txt — a markdown index of the site for AI agents, per llmstxt.org.
 * Link lists are derived from the shared navigation config so they can never
 * drift from what the site actually serves.
 */

export const dynamic = "force-static";

function section(title: string, intro: string, links: NavLink[]): string {
  const items = links
    .filter((link) => !link.disabled && link.label !== "Contents")
    .map(
      (link) =>
        `- [${link.label}](${SITE_URL}${link.href})${link.description ? `: ${link.description}` : ""}`
    )
    .join("\n");
  return `## ${title}\n\n${intro}\n\n${items}`;
}

export function GET() {
  const body = [
    "# Design system",
    "",
    "> An AI-ready design system built by Claude Code from published specs (CLAUDE.md, design.md, content-design.md) and shipped to npm as an open React component library, with the docs site it builds.",
    "",
    section(
      "Design system docs",
      `How the system works and the artifacts you can reuse. Index at ${SITE_URL}/docs.`,
      docsSidebarLinks
    ),
    "",
    section(
      "Foundations",
      `Design tokens and language. Index at ${SITE_URL}/foundations.`,
      foundationsSidebarLinks
    ),
    "",
    section(
      "Templates",
      `Complete screens built from the system's components and tokens alone. Index at ${SITE_URL}/templates.`,
      templatesSidebarLinks
    ),
    "",
    section(
      "Components",
      `React component documentation with live examples. Index at ${SITE_URL}/components. ` +
        `Append .md to any component URL for its prop contract as markdown, ` +
        `generated from the same JSDoc as the published .d.ts.`,
      componentsSidebarLinks
    ),
    "",
    "## Interactive surfaces",
    "",
    "Live tools for exploring and re-theming the design system.",
    "",
    `- [Playground](${SITE_URL}/playground): re-theme the design system live (components, type and chat) and copy the generated CSS`,
    `- [Theme presets](${SITE_URL}/docs/get-started): complete looks ship in the package as generated stylesheets, applied by one data-brand attribute on the root element`,
    `- [System graph](${SITE_URL}/graph): every token, component and page as one dependency graph, traceable in both directions`,
    `- [Home](${SITE_URL}/): the whole system working on one page, with live component demos`,
    "",
    "## Optional",
    "",
    "Raw markdown sources and machine-readable indexes.",
    "",
    `- [MCP server](${SITE_URL}/api/mcp): a Model Context Protocol endpoint (Streamable HTTP, no auth). Tools cover the component list, per-component prop APIs, the design token registry, install setup, and full-text site search. Point any MCP client at this URL`,
    `- [Agent skill](${SITE_URL}/skill/${SKILL_NAME}/SKILL.md): a SKILL.md for consumers of the package, generated from the registries. Save it (with its references/components.md catalogue) into a project's .claude/skills/${SKILL_NAME}/ and a coding agent loads the library's install, theming and catalogue rules every session. \`npx @robr0/design-system init\` fetches the pair and prints the MCP connect line`,
    `- [Storybook](${STORYBOOK_URL}): the rendered API reference. Every component has a props table with types, defaults, and deprecations`,
    `- [npm package](${NPM_URL}): \`npm install @robr0/design-system\` ships complete .d.ts type declarations for every component`,
    `- [CLAUDE.md](${SITE_URL}/CLAUDE.md): how this repository is *maintained* (architecture, registries, workflows). Written for contributors to the system itself, not for people using the package: for that, read design.md below and the README`,
    `- [GitHub source](${REPOSITORY_URL}): the full source, if you want to read the implementation`,
    `- [design.md](${SITE_URL}/design.md): the full design specification (tokens, colours, typography, component rules)`,
    `- [content-design.md](${SITE_URL}/content-design.md): the writing rules (voice, register by surface, words and patterns the project never ships)`,
    `- [Sitemap](${SITE_URL}/sitemap.xml)`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
