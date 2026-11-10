"use client";

import { useEffect, useState } from "react";
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
import { Accordion } from "rift-ds/components/Accordion/Accordion";
import { Tabs } from "rift-ds/components/Tabs/Tabs";
import { OpenChatLink } from "./OpenChatLink";
import { componentMetadata } from "rift-ds/components/registry";
import { chatWidget } from "rift-ds/chat";
import { MCP_CLIENTS } from "@/lib/mcp-clients";
import { MCP_TOOLS } from "@/lib/mcp-tools";
import { SITE_URL } from "@/lib/structuredData";
import { SHOW_FIGMA_LINKS } from "@/config/social";
import { ASSISTANT_NAME, FIGMA_URL, NPM_URL, REPOSITORY_URL, STORYBOOK_URL } from "@/config/brand.generated";
import {
  AGENT_SKILLS,
  AGENT_STARTER,
  AGENT_STARTER_FILE,
  AGENT_STARTER_SNIPPET,
  skillCurlSnippet,
} from "@/data/agent-skills";

const { sidebarLinks } = getSidebarLinks(docsSidebarLinks, "/docs/get-started");

/** On-this-page rail entries: ids match the elements below, in document order. */
const PAGE_SECTIONS = [
  { id: "install", label: "Install" },
  { id: "re-theme", label: "Theme" },
  { id: "preset-themes", label: "Shipped themes" },
  { id: "dark-mode", label: "Dark mode" },
  { id: "fonts", label: "Fonts" },
  { id: "icons", label: "Icons" },
  { id: "locale", label: "Locale and direction" },
  { id: "money", label: "Money and dates" },
  { id: "shortcuts", label: "Keyboard shortcuts" },
  { id: "forms", label: "Forms" },
  { id: "chat-agent-ui", label: "Chat" },
  { id: "ambient-background", label: "Ambient background" },
  { id: "built-with", label: "Built with" },
];

/* The ways in, agents first: real alternatives, so a reader picks one. */
const INSTALL_TABS = [
  { value: "agent-quickstart", label: "With an agent", panelId: "agent-quickstart" },
  { value: "quick-start", label: "Next.js", panelId: "quick-start" },
  { value: "react", label: "Any React app", panelId: "react" },
  { value: "other", label: "Other ways", panelId: "other-ways" },
];

/* Deep links and the anchors of the sections these tabs replaced, each to its tab. */
const LINKED_TABS: Record<string, string> = {
  "agent-quickstart": "agent-quickstart",
  "agent-docs": "agent-quickstart",
  "quick-start": "quick-start",
  react: "react",
  "other-ways": "other",
  "shadcn-registry": "other",
  clone: "other",
};

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

const LOCALE_SNIPPET = `// app/providers.tsx: a client component, mounted from the root layout.
'use client';
import { LocaleProvider } from 'rift-ds/behaviors/LocaleProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return <LocaleProvider locale="de-DE">{children}</LocaleProvider>;
}`;

const FORMAT_SNIPPET = `import { addDecimal, formatMoney, formatRelative, parseDecimal } from 'rift-ds/format';

const typed = parseDecimal('1.234,5', { locale: 'de-DE' }); // "1234.5"
const total = addDecimal(typed ?? '0', '0.10'); // "1234.60", never a float
formatMoney(total, { currency: 'EUR', locale: 'de-DE' }); // "1.234,60 €"
formatRelative('2026-11-09', { now: '2026-11-06', minUnit: 'day' }); // "in 3 days"`;

const SHORTCUT_SNIPPET = `'use client';
import { useShortcut } from 'rift-ds/behaviors/shortcuts';
import { Kbd } from 'rift-ds/components/Kbd/Kbd';

export function SaveButton({ onSave }: { onSave: () => void }) {
  useShortcut('mod+s', onSave, { description: 'Save', allowInInput: true });
  return <button onClick={onSave}>Save <Kbd keys="mod+s" size="compact" /></button>;
}`;

const FORMS_SNIPPET = `import { Checkbox } from 'rift-ds/components/Checkbox/Checkbox';
import { Dropdown } from 'rift-ds/components/Dropdown/Dropdown';
import { TagInput } from 'rift-ds/components/TagInput/TagInput';

// FormData reads: plan=pro, tag=design, tag=docs, terms=on
<form action={saveProject}>
  <Dropdown name="plan" label="Plan" defaultValue="pro" options={plans} />
  <TagInput name="tag" label="Tags" defaultValues={['design', 'docs']} />
  <Checkbox name="terms" label="Accept the terms" defaultChecked />
  <button type="submit">Save</button>
</form>`;

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
    name: "TanStack",
    desc: "Table and Virtual, the engine and windowing under DataTable",
    icon: "table_chart",
    href: "https://tanstack.com/table",
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
    ...(SHOW_FIGMA_LINKS ? { href: FIGMA_URL } : {}),
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
  const [installTab, setInstallTab] = useState(INSTALL_TABS[0].value);

  // A link to a tab's id opens that tab and brings the section into view.
  useEffect(() => {
    const openLinkedTab = () => {
      const linked = LINKED_TABS[window.location.hash.slice(1)];
      if (!linked) return;
      setInstallTab(linked);
      document.getElementById("install")?.scrollIntoView();
    };
    openLinkedTab();
    window.addEventListener("hashchange", openLinkedTab);
    return () => window.removeEventListener("hashchange", openLinkedTab);
  }, []);

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
              Install Rift DS, then make it yours
            </p>
            <p className={styles.introBody}>
              <code>rift-ds</code> is the package this site is built with. Theming is plain CSS
              custom properties, with no configuration API or theme provider.{" "}
              <Link href="/playground" className={styles.inlineLink}>
                Try it in the playground
              </Link>
              .
            </p>
          </div>

          {/* Content + Built-with rail */}
          <div className={styles.railLayout}>
            <div className={styles.railMain}>
              {/* Every way in, agents first. Every panel stays in the document
                  (hidden, not unmounted), so a search engine and the corpus
                  coverage check read all of them. */}
              <section id="install" className={`${styles.section} animate-in animate-delay-2`}>
                <SectionTitle title="Install" />
                <div className={styles.installTabs}>
                  <Tabs
                    tabs={INSTALL_TABS}
                    value={installTab}
                    onValueChange={setInstallTab}
                    aria-label="Ways to install"
                  />
                </div>

                <div id="agent-quickstart" role="tabpanel" aria-label="With an agent" hidden={installTab !== "agent-quickstart"} className={styles.panel}>
                  <p className={styles.sectionNote}>
                    Use this if a coding agent writes your code. Paste this file into your agent,
                    or save it at your project root as <code>{AGENT_STARTER_FILE}</code>. Your
                    agent does the install from there.
                  </p>
                  <CodeBlock
                    code={AGENT_STARTER}
                    language="markdown"
                    filename={AGENT_STARTER_FILE}
                    maxHeight={360}
                    showCopy
                    onCopied={countStarter("copy")}
                  />
                  <h3 className={styles.subheading}>Optional: give your agent more</h3>
                  <p className={styles.sectionNote}>
                    Connect the MCP endpoint so it can look up exact props and tokens while it
                    builds. No key or account is needed.
                  </p>
                  <CodeBlock code={MCP_CLIENTS[0].snippet} language={MCP_CLIENTS[0].language} filename={MCP_CLIENTS[0].filename ?? MCP_CLIENTS[0].label} showCopy />
                  <p className={styles.sectionNote}>
                    Install the skills it loads every session. This also prints the MCP connect line.
                  </p>
                  <CodeBlock code={INIT_SNIPPET} language="bash" showCopy onCopied={countInstall("init")} />
                  <Accordion
                    multiple
                    items={[
                      {
                        id: "mcp-clients",
                        title: "Other MCP clients",
                        content: (
                          <div className={styles.panel}>
                            {MCP_CLIENTS.slice(1).map((client) => (
                              <CodeBlock
                                key={client.id}
                                code={client.snippet}
                                language={client.language}
                                filename={client.filename ?? client.label}
                                showCopy
                              />
                            ))}
                          </div>
                        ),
                      },
                      {
                        id: "mcp-tools",
                        title: "What the MCP tools answer",
                        content: (
                          <div className={styles.panel}>
                            <ul className={styles.promptList}>
                              {MCP_TOOLS.map((tool) => (
                                <li key={tool.name} className={styles.promptItem}>
                                  <span>“{tool.prompt}”</span>
                                  <code className={styles.promptTool}>{tool.name}</code>
                                </li>
                              ))}
                            </ul>
                            <p className={styles.sectionNote}>
                              The same contracts are plain files too: every component page&apos;s
                              For agents button has its markdown and its JSON schema, and{" "}
                              <Link href="/docs/schemas" className={styles.inlineLink}>Schemas</Link>{" "}
                              covers the rest.
                            </p>
                          </div>
                        ),
                      },
                      {
                        id: "skills",
                        title: "The skills, and installing without npm",
                        content: (
                          <div className={styles.panel}>
                            <ul className={styles.promptList}>
                              {AGENT_SKILLS.map((skill) => (
                                <li key={skill.name} className={styles.promptItem}>
                                  <span>{skill.summary}</span>
                                  <code className={styles.promptTool}>{skill.name}</code>
                                </li>
                              ))}
                            </ul>
                            <p className={styles.sectionNote}>
                              <code>npx rift-ds init</code> writes them to <code>.claude/skills/</code>.
                              Add <code>--skill</code> and a name to install one, and re-run it to
                              refresh them. No npm nearby? The same files are one curl each:
                            </p>
                            <CodeBlock code={SKILL_SNIPPET} language="bash" showCopy />
                          </div>
                        ),
                      },
                      {
                        id: "starter-more",
                        title: "Save AGENTS.md from the terminal, or with your theme",
                        content: (
                          <div className={styles.panel}>
                            <p className={styles.sectionNote}>Fetch it again after you upgrade:</p>
                            <CodeBlock code={AGENT_STARTER_SNIPPET} language="bash" showCopy onCopied={countStarter("curl")} />
                            <p className={styles.sectionNote}>
                              Made a theme in the{" "}
                              <Link href="/playground" className={styles.inlineLink}>playground</Link>?
                              Its Get started button gives you one AGENTS.md with the setup, the
                              theme in words and its CSS.
                            </p>
                          </div>
                        ),
                      },
                    ]}
                  />
                </div>

                <div id="quick-start" role="tabpanel" aria-label="Next.js" hidden={installTab !== "quick-start"} className={styles.panel}>
                  <p className={styles.sectionNote}>
                    Use this if you have a Next.js app router project, or a fresh{" "}
                    <code>create-next-app</code>. Run these:
                  </p>
                  <CodeBlock code={QUICK_START_SNIPPET} language="bash" showCopy onCopied={countInstall("quick-start")} />
                  <p className={styles.sectionNote}>
                    Then make <code>app/layout.tsx</code> this, keep your metadata, and drop the{" "}
                    <code>globals.css</code> import <code>create-next-app</code> added.
                  </p>
                  <CodeBlock code={LAYOUT_SNIPPET} language="tsx" showCopy />
                  <p className={styles.sectionNote}>
                    Your first page is at <code>/dashboard</code>. Neither <code>init</code>{" "}
                    command overwrites a file. <Link href="/docs/blocks" className={styles.inlineLink}>Blocks</Link>{" "}
                    lists the other starting pages.
                  </p>
                </div>

                <div id="react" role="tabpanel" aria-label="Any React app" hidden={installTab !== "react"} className={styles.panel}>
                  <p className={styles.sectionNote}>
                    Use this for any other React 19 app with a bundler, such as Vite.
                  </p>
                  <CodeBlock code={INSTALL_SNIPPET} language="bash" showCopy onCopied={countInstall("npm")} />
                  <CodeBlock code={USAGE_SNIPPET} language="tsx" filename="app.tsx" showCopy />
                  <Accordion
                    multiple
                    items={[
                      {
                        id: "requirements",
                        title: "Requirements",
                        content: (
                          <p className={styles.sectionNote}>
                            React 19 or later and a bundler that handles CSS and font imports, with
                            TypeScript&apos;s <code>moduleResolution</code> set to{" "}
                            <code>&quot;bundler&quot;</code> or <code>&quot;nodenext&quot;</code>. The
                            package is ESM-only.
                          </p>
                        ),
                      },
                      {
                        id: "charts",
                        title: "Charts",
                        content: (
                          <div className={styles.panel}>
                            <p className={styles.sectionNote}>Recharts is an optional peer, needed only for the recharts-backed charts.</p>
                            <CodeBlock code={CHARTS_SNIPPET} language="tsx" showCopy />
                          </div>
                        ),
                      },
                      {
                        id: "providers",
                        title: "Optional providers",
                        content: (
                          <p className={styles.sectionNote}>
                            <code>ToastProvider</code> for <code>useToast</code>,{" "}
                            <code>LinkProvider</code> for your router&apos;s link, and{" "}
                            <code>LocaleProvider</code> for the locale numbers and dates are written in.
                          </p>
                        ),
                      },
                    ]}
                  />
                </div>

                <div id="other-ways" role="tabpanel" aria-label="Other ways" hidden={installTab !== "other"} className={styles.panel}>
                  <h3 id="shadcn-registry" className={styles.subheading}>Single components</h3>
                  <p className={styles.sectionNote}>
                    Use this if you want source you own, not a dependency. The shadcn CLI brings
                    the component, what it builds on and the shared base.{" "}
                    <a href="/r/registry.json">/r/registry.json</a> lists them all. If your project
                    has no <code>components.json</code>, run <code>npx shadcn init</code> first.
                  </p>
                  <CodeBlock code={SHADCN_SNIPPET} language="bash" showCopy onCopied={countInstall("shadcn")} />
                  <h3 id="clone" className={styles.subheading}>The whole repo</h3>
                  <p className={styles.sectionNote}>
                    Use this to run or fork the system itself. Everything is MIT licensed, this site
                    included, and one install brings up both Storybook and these docs.
                  </p>
                  <CodeBlock code={CLONE_SNIPPET} language="bash" showCopy onCopied={countInstall("clone")} />
                </div>
              </section>

              {/* Customise */}
              <section id="customise" className={`${styles.section} animate-in animate-delay-3`}>
                <SectionTitle title="Customise" />

                <div id="re-theme" className={styles.subsection}>
                  <h3 className={styles.subheading}>Theme</h3>
                  <p className={styles.sectionNote}>
                    Components read semantic tokens, and semantic tokens read primitives, so
                    overriding a primitive changes everything built on it, in both modes.
                    The{" "}
                    <Link href="/playground" className={styles.inlineLink}>playground</Link>{" "}
                    writes this CSS for you.
                  </p>
                  <CodeBlock code={PRIMITIVE_SNIPPET} language="css" showCopy />
                  <p className={styles.sectionNote}>To change one meaning, override its semantic token:</p>
                  <CodeBlock code={SEMANTIC_SNIPPET} language="css" showCopy />
                </div>

                <div id="preset-themes" className={styles.subsection}>
                  <h3 className={styles.subheading}>Shipped themes</h3>
                  <p className={styles.sectionNote}>
                    Import the aggregate once and set one attribute:{" "}
                    {THEME_SELECTOR_ORDER.filter((id) => id !== BASE_THEME_ID)
                      .map((id) => THEME_PRESETS[id].label)
                      .join(", ")}
                    . Each also loads alone from <code>tokens/presets/&lt;id&gt;.css</code>.
                  </p>
                  <CodeBlock code={PRESET_SNIPPET} language="tsx" showCopy />
                </div>

                <div id="dark-mode" className={styles.subsection}>
                  <h3 className={styles.subheading}>Dark mode</h3>
                  <p className={styles.sectionNote}>
                    Set <code>data-theme=&quot;dark&quot;</code> on the root element. Components
                    have no <code>prefers-color-scheme</code> queries, so your app decides when,
                    and <code>base.css</code> brings the page and native controls along.
                  </p>
                  <CodeBlock code={DARK_MODE_SNIPPET} language="html" showCopy />
                  <p className={styles.sectionNote}>
                    To let visitors choose, apply the stored mode before first paint and add a
                    ThemeToggle:
                  </p>
                  <CodeBlock code={COLOR_MODE_SNIPPET} language="tsx" showCopy />
                </div>

                <div id="fonts" className={styles.subsection}>
                  <h3 className={styles.subheading}>Fonts</h3>
                  <p className={styles.sectionNote}>
                    No text face is bundled. Load any font and point the family token at it, or
                    split headings and body into two roles.
                  </p>
                  <CodeBlock code={FONT_SNIPPET} language="css" showCopy />
                </div>

                <div id="icons" className={styles.subsection}>
                  <h3 className={styles.subheading}>Icons</h3>
                  <p className={styles.sectionNote}>
                    Material Symbols ships as a variable font, with fill, weight and grade as
                    custom properties at any scope. Every icon prop also takes your own element.
                  </p>
                  <CodeBlock code={ICON_SNIPPET} language="css" showCopy />
                  <CodeBlock code={ICON_NODE_SNIPPET} language="tsx" showCopy />
                </div>

                <div id="locale" className={styles.subsection}>
                  <h3 className={styles.subheading}>Locale and direction</h3>
                  <p className={styles.sectionNote}>
                    Numbers, dates and times are written in US English until you wrap the app in{" "}
                    <code>LocaleProvider</code>. A component&apos;s own <code>locale</code> prop
                    wins, and the few that render on the server take the prop alone.
                  </p>
                  <CodeBlock code={LOCALE_SNIPPET} language="tsx" showCopy />
                  <p className={styles.sectionNote}>
                    The locale formats and never translates: every word a component writes is a
                    prop with an English default. For a right-to-left language, set{" "}
                    <code>dir=&quot;rtl&quot;</code> on <code>&lt;html&gt;</code> and the layout,
                    keys, popups and directional icons follow.
                  </p>
                </div>

                <div id="money" className={styles.subsection}>
                  <h3 className={styles.subheading}>Money and dates</h3>
                  <p className={styles.sectionNote}>
                    An amount is a decimal string such as <code>&quot;1234.50&quot;</code>, never a
                    float. <code>rift-ds/format</code> reads what a person typed in their locale,
                    adds and multiplies on whole numbers, and writes money and relative dates. It
                    has no React, so a server route can use it too.
                  </p>
                  <CodeBlock code={FORMAT_SNIPPET} language="ts" showCopy />
                </div>

                <div id="shortcuts" className={styles.subsection}>
                  <h3 className={styles.subheading}>Keyboard shortcuts</h3>
                  <p className={styles.sectionNote}>
                    <code>useShortcut</code> binds a key string, <code>mod+s</code> being ⌘S on a
                    Mac and Ctrl+S elsewhere. It stays quiet while someone types and never takes
                    Escape from an open overlay. Give it a <code>description</code> and{" "}
                    <code>useRegisteredShortcuts</code> lists it for a help dialog.
                  </p>
                  <CodeBlock code={SHORTCUT_SNIPPET} language="tsx" showCopy />
                </div>

                <div id="forms" className={styles.subsection}>
                  <h3 className={styles.subheading}>Forms</h3>
                  <p className={styles.sectionNote}>
                    Give a control a <code>name</code> and it submits with the form around it, so{" "}
                    <code>FormData</code> and a server action read it with no state of your own.
                    Custom controls submit through a hidden input, which native validation
                    skips, so check <code>required</code> where you handle the submit.
                  </p>
                  <CodeBlock code={FORMS_SNIPPET} language="tsx" showCopy />
                </div>

                <div id="chat-agent-ui" className={styles.subsection}>
                  <h3 className={styles.subheading}>Chat</h3>
                  <p className={styles.sectionNote}>
                    One command scaffolds the{" "}
                    <Link href="/docs/chat" className={styles.inlineLink}>chat widget</Link> into a
                    Next.js app, with its server handlers, and a scripted mode runs it with no
                    key. Keys stay on the server. This site&apos;s{" "}
                    <OpenChatLink className={styles.inlineLinkButton}>{ASSISTANT_NAME}</OpenChatLink>{" "}
                    is that widget.{" "}
                    <Link href="/components/ai-chat" className={styles.inlineLink}>Its component page</Link>{" "}
                    has every option.
                  </p>
                  <CodeBlock code={CHAT_SNIPPET} language="bash" showCopy />
                </div>

                <div id="ambient-background" className={styles.subsection}>
                  <h3 className={styles.subheading}>Ambient background</h3>
                  <p className={styles.sectionNote}>
                    <Link href="/components/shader-field" className={styles.inlineLink}>Shader field</Link>{" "}
                    fills a positioned ancestor you provide and can fail on hardware you do not
                    control, so it reports its status and you paint the fallback.
                  </p>
                  <CodeBlock code={SHADER_SNIPPET} language="tsx" showCopy />
                </div>
              </section>

              {/* Built with */}
              <section id="built-with" className={`${styles.section} animate-in animate-delay-4`}>
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
