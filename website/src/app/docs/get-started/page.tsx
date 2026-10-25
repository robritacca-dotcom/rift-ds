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
import { SITE_EVENTS, trackEvent } from "@/lib/analytics";
import { Button } from "rift-ds/components/Button/Button";
import { OpenChatLink } from "./OpenChatLink";
import { componentMetadata } from "rift-ds/components/registry";
import { chatWidget } from "rift-ds/chat";
import { MCP_CLIENTS } from "@/lib/mcp-clients";
import { MCP_TOOLS } from "@/lib/mcp-tools";
import { SITE_URL } from "@/lib/structuredData";
import { SHOW_FIGMA_LINKS } from "@/config/social";
import { ASSISTANT_NAME, FIGMA_FILE_URL, NPM_URL, REPOSITORY_URL, STORYBOOK_URL } from "@/config/brand.generated";
import {
  AGENT_SKILLS,
  AGENT_STARTER,
  AGENT_STARTER_FILE,
  AGENT_STARTER_SNIPPET,
  skillCurlSnippet,
} from "@/data/agent-skills";

const { sidebarLinks } = getSidebarLinks(docsSidebarLinks, "/docs/get-started");

/** On-this-page rail entries — ids match the section elements below, in document order. */
const PAGE_SECTIONS = [
  { id: "quick-start", label: "Start a Next.js app" },
  { id: "agent-quickstart", label: "Build with a coding agent" },
  { id: "install", label: "Install in any React app" },
  { id: "shadcn-registry", label: "Or pull single components" },
  { id: "clone", label: "Or clone the repo" },
  { id: "dark-mode", label: "Dark mode" },
  { id: "fonts", label: "Bring your own font" },
  { id: "re-theme", label: "Re-theme with primitives" },
  { id: "icons", label: "Tune the icons" },
  { id: "preset-themes", label: "Ship a theme" },
  { id: "chat-agent-ui", label: "Chat and agent UI" },
  { id: "agent-docs", label: "Docs for your agent" },
  { id: "ambient-background", label: "Ambient background" },
  { id: "see-it-live", label: "See it live" },
  { id: "built-with", label: "Built with" },
];

const INSTALL_SNIPPET = `npm install rift-ds`;

/* The three-command start, and the root layout `init app` prints. The
   layout is a hand mirror of the lines in src/cli/init.mjs's initApp,
   held to them by scripts/validate-chat-widget.mjs, so the page and the
   terminal never show two layouts. */
const QUICK_START_SNIPPET = `npm install rift-ds
npx rift-ds init app
npx rift-ds init block dashboard`;

const LAYOUT_SNIPPET = `// app/layout.tsx
import 'rift-ds/tokens/tokens.css';
import 'rift-ds/tokens/base.css';
import '../components/rift/font.css';
import { riftFont } from '../components/rift/font';
import { ColorModeScript } from '../components/rift/ColorModeScript';
import { RiftRoot } from '../components/rift/RiftRoot';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={riftFont.variable} suppressHydrationWarning>
      <head>
        <ColorModeScript />
      </head>
      <body>
        <RiftRoot>{children}</RiftRoot>
      </body>
    </html>
  );
}`;

/* One count per install path copied, so a launch can be judged on installs
   rather than page views (website/src/lib/analytics.ts owns the events). */
const countInstall = (snippet: string) => () => trackEvent(SITE_EVENTS.copyInstall, { snippet });
const countStarter = (delivery: string) => () =>
  trackEvent(SITE_EVENTS.copyAgentStarter, { surface: "get_started", delivery });

const USAGE_SNIPPET = `// Load the tokens once — primitives, semantic tokens, and both themes.
import 'rift-ds/tokens/tokens.css';

// The reset and the page every component is tuned against
// (border-box sizing, no stray margins, the body's font and colours).
// Leave it out only if your app already styles the page.
import 'rift-ds/tokens/base.css';

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

/* The widget's scaffold: the registry owns the subcommand and the peers it
   installs beside the package. */
const CHAT_SNIPPET = `npx rift-ds ${chatWidget.command}`;

const COLOR_MODE_SNIPPET = `// app/layout.tsx: apply the visitor's stored mode before first paint.
import { colorModeScript } from 'rift-ds/components/ThemeToggle/colorMode';

<html lang="en" suppressHydrationWarning>
  <head>
    <script dangerouslySetInnerHTML={{ __html: colorModeScript() }} />
  </head>
  …
</html>

// Anywhere the mode should change: System, Light and Dark.
import { ThemeToggle } from 'rift-ds/components/ThemeToggle/ThemeToggle';
<ThemeToggle />`;

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

/* One curl per file of every skill, built from the generated manifest
   (the same list the init bin installs from), never restated here. */
const SKILL_SNIPPET = skillCurlSnippet();

/* Three questions a model answers wrong without the docs above — each one
   is a fact the library skill and one MCP tool both hold, and each has a
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
              library has two optional providers: <code>ToastProvider</code>, needed
              only if you use the toast queue via <code>useToast</code>, and{" "}
              <code>LinkProvider</code>, which hands components your router&apos;s
              link.){" "}
              <Link href="/playground" className={styles.inlineLink}>
                Try it live in the playground
              </Link>
              : it generates the exact CSS you would paste into your app, and one AGENTS.md that hands a coding agent the setup and the theme together.
            </p>
          </div>

          {/* Content + Built-with rail */}
          <div className={styles.railLayout}>
            <div className={styles.railMain}>
              {/* The quick start: three commands to a themed first page in
                  Next.js, the path both a person and an agent should take
                  (the agent starter below opens with the same commands). */}
              <section id="quick-start" className={`${styles.section} animate-in animate-delay-2`}>
                <SectionTitle title="Start a Next.js app" />
                <p className={styles.sectionNote}>
                  In a Next.js app router project, a fresh{" "}
                  <code>create-next-app</code> included, three commands give you a
                  first page with the layout, the spacing, the font and the colour
                  mode in place:
                </p>
                <CodeBlock code={QUICK_START_SNIPPET} language="bash" showCopy onCopied={countInstall("quick-start")} />
                <p className={styles.sectionNote}>
                  <code>init app</code> adds the pieces the library needs under{" "}
                  <code>components/rift/</code> and prints your root layout. Make{" "}
                  <code>app/layout.tsx</code> this, keeping your metadata, and drop
                  the <code>globals.css</code> import <code>create-next-app</code>{" "}
                  added: its body colours and font cover the library&apos;s.
                </p>
                <CodeBlock code={LAYOUT_SNIPPET} language="tsx" showCopy />
                <p className={styles.sectionNote}>
                  <code>init block dashboard</code> adds a dashboard at{" "}
                  <code>/dashboard</code>, inside an app shell with the sidebar,
                  the top bar and the page header. Run your dev server and open
                  it. The other blocks, and what each one writes, are on{" "}
                  <Link href="/docs/blocks" className={styles.inlineLink}>
                    Blocks
                  </Link>
                  . Neither command overwrites a file, and the files are yours to
                  change.
                </p>
              </section>

              {/* Agent quick start: the same path, handed to a coding agent */}
              <section id="agent-quickstart" className={`${styles.section} animate-in animate-delay-2`}>
                <SectionTitle title="Build with a coding agent" />
                <p className={styles.sectionNote}>
                  Working with an agent? Give it one file, <code>{AGENT_STARTER_FILE}</code>:
                  it opens with the same three commands, then the setup for
                  other apps, the rules, and where to look things up. Copy it into your agent, or save it at your
                  project root, where most coding agents read it on their
                  own.
                </p>
                <CodeBlock
                  code={AGENT_STARTER}
                  language="markdown"
                  filename={AGENT_STARTER_FILE}
                  maxHeight={360}
                  showCopy
                  onCopied={countStarter("copy")}
                />
                <p className={styles.sectionNote}>
                  Or save it from the terminal. The site regenerates it on
                  every deploy, matched to the latest release, so fetch it
                  again after you upgrade.
                </p>
                <CodeBlock code={AGENT_STARTER_SNIPPET} language="bash" showCopy onCopied={countStarter("curl")} />
                <p className={styles.sectionNote}>
                  For the full setup, the system is built so the coding
                  agent you already use can build with it, restyle what
                  you have, and check its own work. Three pieces do that:
                </p>
                <ul className={styles.promptList}>
                  <li className={styles.promptItem}>
                    <span>
                      Agent skills it loads every session: the library’s
                      rules, how to move existing screens onto the tokens
                      and components, and how to audit styles against them.
                    </span>
                    <code className={styles.promptTool}>npx rift-ds init</code>
                  </li>
                  <li className={styles.promptItem}>
                    <span>
                      An MCP endpoint that answers exact prop and token
                      questions while it writes code.
                    </span>
                    <code className={styles.promptTool}>/api/mcp</code>
                  </li>
                  <li className={styles.promptItem}>
                    <span>
                      A theme it can read: the playground exports yours as
                      one AGENTS.md, with the look in words and its CSS.
                    </span>
                    <code className={styles.promptTool}>/playground</code>
                  </li>
                </ul>
                <p className={styles.sectionNote}>
                  Install them with one command. It installs the skills and prints
                  the MCP connect line, and the{" "}
                  <a href="#agent-docs" className={styles.inlineLink}>
                    docs for your agent
                  </a>{" "}
                  section below covers everything it sets up. Then ask in
                  plain words: “Apply the theme to the settings screen”,
                  or “Audit the styles in this folder”.
                </p>
                <CodeBlock code={INIT_SNIPPET} language="bash" showCopy onCopied={countInstall("init")} />
              </section>

              {/* Install */}
              <section id="install" className={`${styles.section} animate-in animate-delay-2`}>
                <SectionTitle title="Install in any React app" />
                <p className={styles.sectionNote}>
                  React 19+ (react and react-dom) is the only required peer
                  dependency (recharts is an optional extra, for the recharts-backed charts). Everything else (component CSS, both
                  themes, the Material Symbols icon font) is bundled. The package is
                  ESM-only: use a bundler that handles CSS and font imports (Vite,
                  Next.js, webpack), with TypeScript&apos;s{" "}
                  <code>moduleResolution</code> set to <code>&quot;bundler&quot;</code>{" "}
                  (or <code>&quot;nodenext&quot;</code>).
                </p>
                <CodeBlock code={INSTALL_SNIPPET} language="bash" showCopy onCopied={countInstall("npm")} />
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
                <CodeBlock code={SHADCN_SNIPPET} language="bash" showCopy onCopied={countInstall("shadcn")} />
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
                <CodeBlock code={CLONE_SNIPPET} language="bash" showCopy onCopied={countInstall("clone")} />
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
                <p className={styles.sectionNote}>
                  The page behind the components follows too once base.css is
                  imported: it paints the body from the tokens and sets{" "}
                  <code>color-scheme</code>, so scrollbars and native controls
                  turn dark with everything else. Without it the body keeps the
                  browser default, and a dark theme lands as dark components on
                  a white page.
                </p>
                <p className={styles.sectionNote}>
                  To let visitors choose, render the colour-mode script in the
                  document head, which applies the stored choice before first
                  paint, and put a ThemeToggle where the choice belongs. In a
                  Next.js app, <code>npx rift-ds init app</code> scaffolds the
                  script as a component, and{" "}
                  <Link href="/docs/blocks" className={styles.inlineLink}>
                    the blocks
                  </Link>{" "}
                  give a first page that already wears it.
                </p>
                <CodeBlock code={COLOR_MODE_SNIPPET} language="tsx" showCopy />
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
                  The conversation itself ships too, as one widget. The{" "}
                  <Link href="/docs/chat" className={styles.inlineLink}>chat widget</Link>{" "}
                  composes those components into the whole thing: the panel with its
                  docked, overlay and takeover forms, the streaming engine, the
                  threads, the rich cards, and the server handlers that call the
                  model. One command scaffolds it into a Next.js app, and a
                  scripted mode runs it with no key. Keys stay on the server;
                  nothing in the package or your client code ever holds one. This
                  site&apos;s chat is that widget, configured for this site:{" "}
                  <OpenChatLink className={styles.inlineLinkButton}>
                    open {ASSISTANT_NAME}
                  </OpenChatLink>{" "}
                  and you are looking at it at work.
                </p>
                <CodeBlock code={CHAT_SNIPPET} language="bash" showCopy />
                <p className={styles.sectionNote}>
                  Every option it takes, shown on the chat itself, is on{" "}
                  <Link href="/components/ai-chat" className={styles.inlineLink}>its component page</Link>.
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
                  carries into every session, there are also generated
                  agent skills: folders of markdown built from the same
                  registries.
                </p>
                <ul className={styles.promptList}>
                  {AGENT_SKILLS.map((skill) => (
                    <li key={skill.name} className={styles.promptItem}>
                      <span>{skill.summary}</span>
                      <code className={styles.promptTool}>{skill.name}</code>
                    </li>
                  ))}
                </ul>
                <p className={styles.sectionNote}>
                  One command fetches the current set from this site into a
                  project&apos;s <code>.claude/skills/</code>, where
                  skill-capable agents load them automatically. Add{" "}
                  <code>--skill</code> and a name to install one of them:
                </p>
                <CodeBlock code={INIT_SNIPPET} language="bash" showCopy onCopied={countInstall("init")} />
                <p className={styles.sectionNote}>
                  The files regenerate with every deploy, so re-run the
                  command to refresh them. No npm nearby? The same files
                  are one curl each:
                </p>
                <CodeBlock code={SKILL_SNIPPET} language="bash" showCopy />
                <p className={styles.sectionNote}>
                  Made a theme in the{" "}
                  <Link href="/playground" className={styles.inlineLink}>
                    playground
                  </Link>
                  ? Its Export theme button gives you one AGENTS.md: the setup,
                  the theme in words and its CSS. Save it at your project root
                  and your agent wires the theme in from it, and the restyling
                  skill reads its theme before it changes anything.
                </p>
                <p className={styles.sectionNote}>
                  Not sure your agent needs any of this? Paste this check
                  into it before it writes code with the package. Every
                  answer is in the skills and one MCP call away; a model
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
                  theme as one AGENTS.md for a coding agent, or as CSS alone.
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
