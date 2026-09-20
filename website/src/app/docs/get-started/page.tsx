"use client";

import Link from "next/link";
import Image from "next/image";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { getSidebarLinks, docsSidebarLinks } from "@/config/navigation";
import styles from "./page.module.css";
import FloatingAnchorNav from "@/components/FloatingAnchorNav/FloatingAnchorNav";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import { CodeBlock } from "@robr0/design-system/components/CodeBlock/CodeBlock";
import { Button } from "@robr0/design-system/components/Button/Button";
import { OpenChatLink } from "./OpenChatLink";
import { componentMetadata } from "@robr0/design-system/components/registry";
import { MCP_CLIENTS } from "@/lib/mcp-clients";
import { MCP_TOOLS } from "@/lib/mcp-tools";
import { SITE_URL } from "@/lib/structuredData";

const { sidebarLinks } = getSidebarLinks(docsSidebarLinks, "/docs/get-started");

/** On-this-page rail entries — ids match the section elements below, in document order. */
const PAGE_SECTIONS = [
  { id: "install", label: "Install" },
  { id: "dark-mode", label: "Dark mode" },
  { id: "fonts", label: "Bring your own font" },
  { id: "re-theme", label: "Re-theme with primitives" },
  { id: "chat-agent-ui", label: "Chat and agent UI" },
  { id: "agent-docs", label: "Docs for your agent" },
  { id: "ambient-background", label: "Ambient background" },
  { id: "see-it-live", label: "See it live" },
  { id: "built-with", label: "Built with" },
];

const INSTALL_SNIPPET = `npm install @robr0/design-system`;

const USAGE_SNIPPET = `// Load the tokens once — primitives, semantic tokens, and both themes.
import '@robr0/design-system/tokens/tokens.css';

// Then import components — from the barrel…
import { Button, Card, Badge } from '@robr0/design-system';

// …or by deep path (what this site does):
import { Button } from '@robr0/design-system/components/Button/Button';

// Optional: only if you render raw .material-symbols-rounded spans —
// any component import already loads the icon font for you.
import '@robr0/design-system/fonts/material-symbols.css';`;

/* The dependency-free chart pieces are a registry fact — charts-category
   components without the `recharts` flag, which the barrel generator holds
   to each module's actual imports — so the snippet derives the list rather
   than restating it. */
const BARREL_CHARTS = componentMetadata
  .filter((c) => c.category === "charts" && !c.recharts)
  .map((c) => c.name)
  .join(", ");

const CHARTS_SNIPPET = `// The recharts-backed charts live behind their own entry so that peer
// dependency stays optional — the dependency-free chart pieces
// (${BARREL_CHARTS}) come from the main barrel.
import { BarChart, LineChart } from '@robr0/design-system/charts';`;

const DARK_MODE_SNIPPET = `<!-- Light is the default; flip the whole system with one attribute -->
<html data-theme="dark">`;

const INIT_SNIPPET = `npx @robr0/design-system init`;

const SKILL_SNIPPET = `curl --create-dirs -o .claude/skills/robr0-design-system/SKILL.md ${SITE_URL}/skill/robr0-design-system/SKILL.md
curl --create-dirs -o .claude/skills/robr0-design-system/references/components.md ${SITE_URL}/skill/robr0-design-system/references/components.md`;

/* Three questions a model answers wrong without the docs above — each one
   is a fact the agent skill and one MCP tool both hold, and each has a
   generic-React guess that misses. */
const SELF_CHECK_SNIPPET = `Before writing any @robr0/design-system code, answer these:

1. Which import path serves the recharts-backed charts?
2. Which attribute switches the system to dark mode?
3. Which provider, if any, does the library need, and for what?

If any answer is a guess, run \`npx @robr0/design-system init\` to install
the agent docs, or connect the MCP endpoint, then check again.`;

const SHADER_SNIPPET = `import { ShaderField, type ShaderFieldStatus } from '@robr0/design-system';

const [status, setStatus] = useState<ShaderFieldStatus>('pending');

// Note: the fallback paints on 'unavailable', not on 'not active'.
<div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
  {status === 'unavailable' && <YourCssFallback />}
  <ShaderField params={{ streak: 0.4 }} onStatusChange={setStatus} />
</div>`;

const FONT_SNIPPET = `/* The whole type scale chains to one token.
   Load any font (Google Fonts, next/font, self-hosted), then: */
:root {
  --font-family-primary: 'Inter', sans-serif;
}

/* Or mix faces: display and heading styles read one family role,
   body styles read the other. Both default to the primary family,
   so overriding either role alone leaves the rest untouched. */
:root {
  --font-family-heading: 'Fraunces', serif;
  --font-family-body: 'Inter', sans-serif;
}`;

const PRIMITIVE_SNIPPET = `/* Every semantic token references a primitive, so overriding a
   primitive re-themes everything built on it — in both themes.
   The action colour is theme-split: light fills run teal-08/09/10,
   dark inverts to teal-05/04/03. Re-key those steps to rebrand —
   or copy a complete override from the playground. */
:root {
  --primitive-teal-08: #6D31D3;  /* light fill */
  --primitive-teal-09: #4C2293;  /* light hover */
  --primitive-teal-10: #2E1560;  /* light active, dark label */
  --primitive-teal-05: #A78BFA;  /* dark fill */
  --primitive-teal-04: #C4B5FD;  /* dark hover */
  --primitive-teal-03: #DDD6FE;  /* dark active */

  /* Pill buttons become rounded rectangles */
  --primitive-radius-full: 12px;
}`;

const SEMANTIC_SNIPPET = `/* Prefer surgical changes? Override a semantic token directly —
   scope the dark value under the theme attribute. */
:root {
  --color-status-info-border: #345AC4;
}
[data-theme="dark"] {
  --color-status-info-border: #7F99E3;
}`;

/** The package's own stack — what it is built and shipped with. */
const STACK_TOOLS: {
  name: string;
  desc: string;
  logo?: string;
  icon?: string;
  href?: string;
}[] = [
  {
    name: "React",
    desc: "UI library, the required peer dependency",
    logo: "/logos/React.svg",
  },
  {
    name: "Vite",
    desc: "Dev server and story test runner",
    logo: "/logos/vite.svg",
  },
  {
    name: "Storybook",
    desc: "Every component, every variant",
    logo: "/logos/storybook.svg",
    href: "https://design-system-iota-one.vercel.app/?path=/docs/robr0-ds--docs",
  },
  {
    name: "npm",
    desc: "Published with provenance on every release",
    icon: "deployed_code",
    href: "https://www.npmjs.com/package/@robr0/design-system",
  },
  {
    name: "GitHub",
    desc: "Source, CI, and releases",
    logo: "/logos/Git.svg",
    href: "https://github.com/robritacca-dotcom/design-system",
  },
  {
    name: "Figma",
    desc: "Where the foundation was designed",
    logo: "/logos/Figma.svg",
    href: "https://www.figma.com/design/8NzqDS8iRsBTFPbNGj3Woj/robr0-ds26?node-id=246-5864",
  },
];

function ToolLogo({ tool }: { tool: (typeof STACK_TOOLS)[number] }) {
  if (tool.logo) {
    return <Image src={tool.logo} alt="" width={28} height={28} />;
  }
  return (
    <span className={`material-symbols-rounded ${styles.toolGlyph}`} aria-hidden="true">
      {tool.icon}
    </span>
  );
}

function ToolItem({ tool }: { tool: (typeof STACK_TOOLS)[number] }) {
  const body = (
    <>
      <ToolLogo tool={tool} />
      <div className={styles.toolDetails}>
        <span className={styles.toolName}>{tool.name}</span>
        <span className={styles.toolDesc}>{tool.desc}</span>
      </div>
      {tool.href && (
        <span className={`material-symbols-rounded ${styles.toolLinkIcon}`} aria-hidden="true">
          open_in_new
        </span>
      )}
    </>
  );

  if (tool.href) {
    return (
      <a href={tool.href} target="_blank" rel="noopener noreferrer" className={styles.toolItem}>
        {body}
      </a>
    );
  }
  return <div className={styles.toolItem}>{body}</div>;
}

export default function GetStartedPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <Sidebar links={sidebarLinks} />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />

          {/* Page Title */}
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Get started</h1>
          </div>

          {/* Intro */}
          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              One package, one stylesheet, and every token is yours to override
            </p>
            <p className={styles.introBody}>
              The design system ships as <code>@robr0/design-system</code>, the same
              package this site is built with. There is no configuration API or theme
              provider: theming is plain CSS custom properties. Import the token
              stylesheet, use the components, and re-theme by redefining tokens. (The
              one provider in the library is <code>ToastProvider</code>, needed only
              if you use the toast queue via <code>useToast</code>.){" "}
              <Link href="/playground" className={styles.inlineLink}>
                Try it live in the playground
              </Link>
              : it generates the exact CSS you would paste into your app.
            </p>
          </div>

          {/* Content + Built-with rail */}
          <div className={styles.railLayout}>
            <div className={styles.railMain}>
              {/* Install */}
              <section id="install" className={`${styles.section} animate-in animate-delay-2`}>
                <SectionTitle title="Install" />
                <p className={styles.sectionNote}>
                  React 19+ (react and react-dom) is the only required peer
                  dependency (recharts is an optional extra, for the recharts-backed charts). Everything else (component CSS, both
                  themes, the Material Symbols icon font) is bundled. The package is
                  ESM-only: use a bundler that handles CSS and font imports (Vite,
                  Next.js, webpack), with TypeScript&apos;s{" "}
                  <code>moduleResolution</code> set to <code>&quot;bundler&quot;</code>{" "}
                  (or <code>&quot;nodenext&quot;</code>).
                </p>
                <CodeBlock code={INSTALL_SNIPPET} language="bash" showCopy />
                <CodeBlock code={USAGE_SNIPPET} language="tsx" filename="app.tsx" showCopy />
                <CodeBlock code={CHARTS_SNIPPET} language="tsx" showCopy />
              </section>

              {/* Dark mode */}
              <section id="dark-mode" className={`${styles.section} animate-in animate-delay-3`}>
                <SectionTitle title="Dark mode" />
                <p className={styles.sectionNote}>
                  Every semantic token has a light and a dark value. Set{" "}
                  <code>data-theme=&quot;dark&quot;</code> on the root element to switch.
                  There are no <code>prefers-color-scheme</code> queries in components, so
                  your app decides when.
                </p>
                <CodeBlock code={DARK_MODE_SNIPPET} language="html" showCopy />
              </section>

              {/* Fonts */}
              <section id="fonts" className={`${styles.section} animate-in animate-delay-4`}>
                <SectionTitle title="Bring your own font" />
                <p className={styles.sectionNote}>
                  The system is designed for Nunito Sans but deliberately does not bundle
                  it. Load it (or any font) however your stack prefers and point one token
                  at it. This site loads Nunito Sans with <code>next/font</code> and does
                  exactly this override in its global CSS. Want headings in one face and
                  body copy in another? The scale chains through two family roles, both
                  defaulting to the primary token, so you can split them instead. Try
                  pairings live in the playground.
                </p>
                <CodeBlock code={FONT_SNIPPET} language="css" showCopy />
              </section>

              {/* Primitives */}
              <section id="re-theme" className={`${styles.section} animate-in animate-delay-5`}>
                <SectionTitle title="Re-theme with primitives" />
                <p className={styles.sectionNote}>
                  Tokens are three tiers: primitives hold the raw values, semantic tokens
                  reference primitives, components use semantic tokens. That chain is
                  build-enforced, which is what makes a primitive override cascade through
                  the entire system, both themes included.
                </p>
                <CodeBlock code={PRIMITIVE_SNIPPET} language="css" showCopy />
                <p className={styles.sectionNote}>
                  Semantic tokens are fair game too when you want to change one meaning
                  without touching the ramp it comes from:
                </p>
                <CodeBlock code={SEMANTIC_SNIPPET} language="css" showCopy />
              </section>

              {/* Chat and agent UI */}
              <section id="chat-agent-ui" className={`${styles.section} animate-in animate-delay-6`}>
                <SectionTitle title="Chat and agent UI" />
                <p className={styles.sectionNote}>
                  The <code>ai</code> category installs with the rest of the package:
                  chat surface primitives (Chat thread, Chat message, Composer, Chat
                  header, Model picker), agent-state components (Agent status, Agent
                  plan, Reasoning, Tool call), session surfaces (Thread panel,
                  Thread tabs, Usage card), and supporting pieces such as Prose
                  and the citation chips.
                  They are components like any other here, themed by the same tokens,
                  and they render whatever conversation you hand them.
                </p>
                <p className={styles.sectionNote}>
                  What the package does not ship is the conversation itself. You
                  bring the state (the transcript, which turn is streaming), a
                  transport that talks to your backend, and a server-side endpoint
                  holding your LLM API key. Keys stay on the server; nothing in the
                  package or your client code ever holds one. This site&apos;s chat
                  is the reference implementation:{" "}
                  <OpenChatLink className={styles.inlineLinkButton}>
                    open robr0 GPT
                  </OpenChatLink>{" "}
                  and you are looking at those components at work.
                </p>
              </section>

              {/* MCP server */}
              <section id="agent-docs" className={`${styles.section} animate-in animate-delay-6`}>
                <SectionTitle title="Docs for your agent" />
                <p className={styles.sectionNote}>
                  The documentation also serves machines. The site exposes a
                  Model Context Protocol endpoint at <code>/api/mcp</code>:
                  connect any MCP client and your coding agent can query the
                  component list, the exact prop contract of every component,
                  the token registry, and the site&apos;s published content
                  while it builds. The prop data is generated from the same
                  JSDoc as the package&apos;s type declarations, so it always
                  matches what npm ships. No key or account is needed;
                  everything it serves is already public.
                </p>
                {MCP_CLIENTS.map((client) => (
                  <CodeBlock
                    key={client.id}
                    code={client.snippet}
                    language={client.language}
                    filename={client.filename ?? client.label}
                    showCopy
                  />
                ))}
                <p className={styles.sectionNote}>
                  Once connected, each of these is answered by one tool:
                </p>
                <ul className={styles.promptList}>
                  {MCP_TOOLS.map((tool) => (
                    <li key={tool.name} className={styles.promptItem}>
                      <span>“{tool.prompt}”</span>
                      <code className={styles.promptTool}>{tool.name}</code>
                    </li>
                  ))}
                </ul>
                <p className={styles.sectionNote}>
                  The same contracts are served as plain files too: append{" "}
                  <code>.md</code> to any component URL for its prop table as
                  markdown, or use the copy button in a component page&apos;s
                  header to put it on the clipboard for your agent.
                </p>
                <p className={styles.sectionNote}>
                  The MCP tools answer on demand. For knowledge an agent
                  carries into every session, there is also a generated
                  agent skill: two markdown files built from the same
                  registries, covering install, theming and the full
                  component catalogue. One command fetches the current pair
                  from this site into a project&apos;s{" "}
                  <code>.claude/skills/</code>, where skill-capable agents
                  load them automatically:
                </p>
                <CodeBlock code={INIT_SNIPPET} language="bash" showCopy />
                <p className={styles.sectionNote}>
                  The files regenerate with every deploy, so re-run the
                  command to refresh them. No npm nearby? The same pair is
                  one curl each:
                </p>
                <CodeBlock code={SKILL_SNIPPET} language="bash" showCopy />
                <p className={styles.sectionNote}>
                  Not sure your agent needs any of this? Paste this check
                  into it before it writes code with the package. Every
                  answer is in the skill and one MCP call away; a model
                  working from generic React patterns misses all three.
                </p>
                <CodeBlock code={SELF_CHECK_SNIPPET} language="text" showCopy />
              </section>

              {/* Ambient background */}
              <section id="ambient-background" className={`${styles.section} animate-in animate-delay-6`}>
                <SectionTitle title="Ambient background" />
                <p className={styles.sectionNote}>
                  <Link href="/components/shader-field" className={styles.inlineLink}>
                    Shader field
                  </Link>{" "}
                  is the one component that asks more of you than an import. It
                  renders a WebGL2 field of soft light sources that read your
                  colour tokens at runtime, so it re-themes with everything
                  else. But it fills a positioned ancestor you provide, and it
                  can fail on hardware you do not control. So it never decides what
                  to paint instead of itself: it reports <code>pending</code>,{" "}
                  <code>active</code> or <code>unavailable</code>, and one
                  fallback covers every failure. It also checks{" "}
                  <code>prefers-reduced-motion</code> itself, since the CSS
                  motion tokens cannot see an animation loop.
                </p>
                <CodeBlock code={SHADER_SNIPPET} language="tsx" showCopy />
                <p className={styles.sectionNote}>
                  The background behind this page is that component, with eight
                  blurred CSS discs kept painted underneath as its fallback.
                </p>
              </section>

              {/* Playground CTA */}
              <section id="see-it-live" className={`${styles.section} animate-in animate-delay-6`}>
                <SectionTitle title="See it live" />
                <p className={styles.sectionNote}>
                  The playground applies these overrides to a full page in real time
                  (navigation, components, the type specimen, and the chat
                  widget): pick a brand colour,
                  tint the neutrals, reshape the radii, swap the font, then copy the
                  generated CSS.
                </p>
                <Link href="/playground" className={styles.ctaLink}>
                  <Button label="Open the playground" variant="primary" iconRight="arrow_forward" />
                </Link>
              </section>

              {/* Built with */}
              <section id="built-with" className={`${styles.section} animate-in animate-delay-6`}>
                <SectionTitle title="Built with" />
                <div className={styles.toolList}>
                  {STACK_TOOLS.map((tool) => (
                    <ToolItem key={tool.name} tool={tool} />
                  ))}
                </div>
              </section>
            </div>
          </div>

          <FloatingAnchorNav items={PAGE_SECTIONS} />
        </main>
      </div>

    </>
  );
}
