"use client";

import Link from "next/link";
import Image from "next/image";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { getSidebarLinks, docsSidebarLinks } from "@/config/navigation";
import { THEME_PRESETS, THEME_SELECTOR_ORDER } from "@/lib/theme/presets";
import { BASE_THEME_ID } from "@/lib/theme/brand";
import styles from "./page.module.css";
import FloatingAnchorNav from "@/components/FloatingAnchorNav/FloatingAnchorNav";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { CodeBlock } from "rift-ds/components/CodeBlock/CodeBlock";
import { Button } from "rift-ds/components/Button/Button";
import { OpenChatLink } from "./OpenChatLink";
import { componentMetadata } from "rift-ds/components/registry";
import { MCP_CLIENTS } from "@/lib/mcp-clients";
import { MCP_TOOLS } from "@/lib/mcp-tools";
import { SITE_URL } from "@/lib/structuredData";
import { SHOW_FIGMA_LINKS } from "@/config/social";
import { ASSISTANT_NAME, FIGMA_FILE_URL, NPM_URL, REPOSITORY_URL, SKILL_NAME, STORYBOOK_URL } from "@/config/brand.generated";

const { sidebarLinks } = getSidebarLinks(docsSidebarLinks, "/docs/get-started");

/** On-this-page rail entries — ids match the section elements below, in document order. */
const PAGE_SECTIONS = [
  { id: "agent-quickstart", label: "Quick start with an agent" },
  { id: "install", label: "Install" },
  { id: "shadcn-registry", label: "Or pull single components" },
  { id: "clone", label: "Or clone the repo" },
  { id: "dark-mode", label: "Dark mode" },
  { id: "fonts", label: "Bring your own font" },
  { id: "icons", label: "Tune the icons" },
  { id: "re-theme", label: "Re-theme with primitives" },
  { id: "preset-themes", label: "Ship a theme" },
  { id: "chat-agent-ui", label: "Chat and agent UI" },
  { id: "agent-docs", label: "Docs for your agent" },
  { id: "ambient-background", label: "Ambient background" },
  { id: "see-it-live", label: "See it live" },
  { id: "built-with", label: "Built with" },
];

const INSTALL_SNIPPET = `npm install rift-ds`;

const USAGE_SNIPPET = `// Load the tokens once — primitives, semantic tokens, and both themes.
import 'rift-ds/tokens/tokens.css';

// Then import components — from the barrel…
import { Button, Card, Badge } from 'rift-ds';

// …or by deep path (what this site does):
import { Button } from 'rift-ds/components/Button/Button';

// Optional: only if you render raw .material-symbols-rounded spans —
// any component import already loads the icon font for you.
import 'rift-ds/fonts/material-symbols.css';`;

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
import { BarChart, LineChart } from 'rift-ds/charts';`;

const DARK_MODE_SNIPPET = `<!-- Light is the default; flip the whole system with one attribute -->
<html data-theme="dark">`;

const SHADCN_SNIPPET = `npx shadcn@latest add ${SITE_URL}/r/button.json`;

const CLONE_SNIPPET = `git clone ${REPOSITORY_URL}.git
cd ${REPOSITORY_URL.split("/").pop()}
npm install          # one install; the website is an npm workspace
npm run storybook    # the component sandbox, or:
npm run dev -w website   # this whole docs site, locally`;

const ICON_SNIPPET = `/* The bundled Material Symbols font keeps every Google axis live. */
:root {
  --material-symbols-fill: 1;      /* 0 line · 1 filled */
  --material-symbols-weight: 300;  /* 100-700 stroke thickness */
  --material-symbols-grade: 0;     /* -50-200 contrast tuning */
}`;

const ICON_NODE_SNIPPET = `// Every icon prop takes a Material name or your own element.
import { Search } from 'lucide-react';

<Input iconLeft="search" />
<Input iconLeft={<Search size={20} />} />`;

const PRESET_SNIPPET = `// Every shipped theme, one generated stylesheet each, plus this aggregate.
import 'rift-ds/tokens/presets/presets.css';

<html data-brand="terminal">`;

const INIT_SNIPPET = `npx rift-ds init`;

const SKILL_SNIPPET = `curl --create-dirs -o .claude/skills/${SKILL_NAME}/SKILL.md ${SITE_URL}/skill/${SKILL_NAME}/SKILL.md
curl --create-dirs -o .claude/skills/${SKILL_NAME}/references/components.md ${SITE_URL}/skill/${SKILL_NAME}/references/components.md`;

/* Three questions a model answers wrong without the docs above — each one
   is a fact the agent skill and one MCP tool both hold, and each has a
   generic-React guess that misses. */
const SELF_CHECK_SNIPPET = `Before writing any rift-ds code, answer these:

1. Which import path serves the recharts-backed charts?
2. Which attribute switches the system to dark mode?
3. Which provider, if any, does the library need, and for what?

If any answer is a guess, run \`npx rift-ds init\` to install
the agent docs, or connect the MCP endpoint, then check again.`;

const SHADER_SNIPPET = `import { ShaderField, type ShaderFieldStatus } from 'rift-ds';

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
   In the base token files the action colour runs on the teal ramp:
   light fills on teal-08/09/10, dark on teal-05/04/03. Re-key those
   steps to rebrand —
   or copy a complete override from the playground. */
:root {
  --primitive-teal-08: #6D31D3;  /* light fill */
  --primitive-teal-09: #4C2293;  /* light hover */
  --primitive-teal-10: #2E1560;  /* light active, dark label */
  --primitive-teal-05: #A78BFA;  /* dark fill */
  --primitive-teal-04: #C4B5FD;  /* dark hover */
  --primitive-teal-03: #DDD6FE;  /* dark active */

  /* Pill buttons become rounded rectangles */
  --primitive-radius-pill: 12px;
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
    href: STORYBOOK_URL,
  },
  {
    name: "npm",
    desc: "Published with provenance on every release",
    icon: "deployed_code",
    href: NPM_URL,
  },
  {
    name: "GitHub",
    desc: "Source, CI, and releases",
    logo: "/logos/Git.svg",
    href: REPOSITORY_URL,
  },
  {
    name: "Figma",
    desc: "Where the foundation was designed",
    logo: "/logos/Figma.svg",
    // The card stays (it is a fact about the stack); the link out follows
    // the site-wide Figma switch.
    ...(SHOW_FIGMA_LINKS ? { href: `${FIGMA_FILE_URL}?node-id=246-5864` } : {}),
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
              The design system ships as <code>rift-ds</code>, the same
              package this site is built with. There is no configuration API or theme
              provider: theming is plain CSS custom properties. Import the token
              stylesheet, use the components, and re-theme by redefining tokens. (The
              one provider in the library is <code>ToastProvider</code>, needed only
              if you use the toast queue via <code>useToast</code>.){" "}
              <Link href="/playground" className={styles.inlineLink}>
                Try it live in the playground
              </Link>
              : it generates the exact CSS you would paste into your app, with a THEME.md and a setup prompt for a coding agent.
            </p>
          </div>

          {/* Content + Built-with rail */}
          <div className={styles.railLayout}>
            <div className={styles.railMain}>
              {/* Agent quick start — before the human steps, because for many
                  readers the agent IS the installer */}
              <section id="agent-quickstart" className={`${styles.section} animate-in animate-delay-2`}>
                <SectionTitle title="Quick start with an agent" />
                <p className={styles.sectionNote}>
                  Building with a coding agent? One command teaches it the
                  system before you write anything: it installs the generated
                  agent skill into your project and prints the MCP connect
                  line, so the agent knows the components, the tokens, and the
                  theming contract from its first session. The{" "}
                  <a href="#agent-docs" className={styles.inlineLink}>
                    docs for your agent
                  </a>{" "}
                  section below has everything it sets up.
                </p>
                <CodeBlock code={INIT_SNIPPET} language="bash" showCopy />
              </section>

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

              {/* shadcn registry */}
              <section id="shadcn-registry" className={`${styles.section} animate-in animate-delay-3`}>
                <SectionTitle title="Or pull single components" />
                <p className={styles.sectionNote}>
                  The site serves a shadcn-compatible registry, so the shadcn
                  CLI can install any component as source you own instead of a
                  package you depend on. One add brings the component, the
                  components it builds on, and the shared base (tokens, theme
                  presets, icon font, behavior hooks) into a rift
                  folder in your project, imports intact. The index at{" "}
                  <a href="/r/registry.json">/r/registry.json</a> lists every
                  component. The CLI expects a <code>components.json</code>{" "}
                  and a <code>tsconfig.json</code> in your project; if you
                  have neither, <code>npx shadcn init</code> creates them.
                </p>
                <CodeBlock code={SHADCN_SNIPPET} language="bash" showCopy />
              </section>

              {/* Clone */}
              <section id="clone" className={`${styles.section} animate-in animate-delay-3`}>
                <SectionTitle title="Or clone the repo" />
                <p className={styles.sectionNote}>
                  The package is one way in; the source is another. The whole
                  system is MIT licensed, this site included, so you can clone
                  the repo, run it, and keep whatever parts serve you: the
                  components and tokens, the generators and validators that
                  hold the docs to the code, or the specs the system is built
                  from. One install brings up both the Storybook sandbox and
                  this documentation site.
                </p>
                <CodeBlock code={CLONE_SNIPPET} language="bash" showCopy />
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
                  No text face is bundled, on purpose: the type is yours to choose.
                  The whole scale chains to one family token, so you load any font
                  however your stack prefers and point the token at it. Want headings
                  in one face and body copy in another? The scale chains through two
                  family roles, both defaulting to the primary token, so you split
                  them instead. The shipped themes prove the range:{" "}
                  {THEME_SELECTOR_ORDER.length} looks mixing serif, sans, grotesk,
                  rounded and mono pairings over the same components. Try pairings live in
                  the playground.
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

              {/* Icons */}
              <section id="icons" className={`${styles.section} animate-in animate-delay-5`}>
                <SectionTitle title="Tune the icons" />
                <p className={styles.sectionNote}>
                  Icons ship as the full Material Symbols variable font, so
                  every axis Google exposes is a custom property: fill,
                  stroke weight, and grade, settable at any scope from one
                  icon to the whole app. Optical size is automatic. And
                  nothing couples you to the bundled font: every icon prop
                  in the library accepts your own element as well as a
                  Material name, so a Lucide or any other icon set drops
                  straight in. Draw custom SVGs with currentColor and they
                  inherit text colour the way the bundled glyphs do.
                </p>
                <CodeBlock code={ICON_SNIPPET} language="css" showCopy />
                <CodeBlock code={ICON_NODE_SNIPPET} language="tsx" showCopy />
              </section>

              {/* Preset themes */}
              <section id="preset-themes" className={`${styles.section} animate-in animate-delay-5`}>
                <SectionTitle title="Ship a theme" />
                <p className={styles.sectionNote}>
                  Complete looks ship in the package as generated stylesheets.
                  Import the aggregate once, set one attribute on the root
                  element, and the whole product follows: light and dark, the
                  action family, the ambience, and the chart colours together.
                  Remove the attribute to return to the shipped look.
                </p>
                <CodeBlock code={PRESET_SNIPPET} language="tsx" showCopy />
                <p className={styles.sectionNote}>
                  The shipped themes:{" "}
                  {THEME_SELECTOR_ORDER.filter((id) => id !== BASE_THEME_ID)
                    .map((id) => THEME_PRESETS[id].label)
                    .join(", ")}
                  . Each also loads alone from{" "}
                  <code>tokens/presets/&lt;id&gt;.css</code>, and the theme dots
                  on the home page swap the same attribute, so every look here
                  is the one a consumer gets.
                </p>
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
                    open {ASSISTANT_NAME}
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
                  (navigation, components, the type specimen, the chat
                  widget, and a full dashboard): pick a brand colour,
                  tint the neutrals, reshape the radii, swap the font, then export the
                  theme as CSS, with a THEME.md for a coding agent.
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
