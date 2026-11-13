"use client";

import Image from "next/image";
import Link from "next/link";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import MegaNav from "../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Sidebar from "../../components/Sidebar/Sidebar";
import { ArchitectureMap } from "@/components/ArchitectureMap/ArchitectureMap";
import GraphMiniature from "@/components/SystemGraph/GraphMiniature";
import { getSidebarLinks, docsSidebarLinks } from "@/config/navigation";
import { COMPONENT_COUNT } from "rift-ds/components/registry";
import { TOKEN_COUNT, TOKEN_COUNTS } from "rift-ds/tokens/registry";
import { SKILL_COUNT } from "@/data/skills-registry";
import { RELEASE_COUNT } from "@/data/release-log";
import { chatExchangeMap, consumerMap, operatorsMap, pipelineMap, runtimeMap, systemOverviewMap } from "./maps";
import styles from "./page.module.css";
import {
  AUTHOR_NAME,
  AUTHOR_URL,
  BRAND_NAME,
  FIGMA_URL,
  REPOSITORY_URL,
  STORYBOOK_URL,
} from "@/config/brand.generated";
import { SHOW_FIGMA_LINKS } from "@/config/social";

const TOKEN_CATEGORY_COUNT = Object.keys(TOKEN_COUNTS).length;

const { sidebarLinks } = getSidebarLinks(docsSidebarLinks, "/overview");

export default function AboutDsPage() {
  return (
    <>

      <MegaNav />

      <div className={styles.dsLayout}>
        <Sidebar links={sidebarLinks} />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          {/* Page Title */}
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Overview of {BRAND_NAME}</h1>
          </div>

          {/* Intro */}
          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              How the system is built, and why its docs stay true
            </p>
            <p className={styles.introBody}>
              {BRAND_NAME} ships as the npm package <code>rift-ds</code>: layered CSS tokens, React components, and complete themes, each applied by one data-brand attribute. This site installs it like any consumer, and the build holds these docs to the code: generators write them from the registries in{" "}
              <a href={REPOSITORY_URL} target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>the repo</a>, and validators fail the build when the two disagree. You can{" "}
              <Link href="/docs/get-started" className={styles.inlineLink}>install it yourself</Link> and{" "}
              <Link href="/playground" className={styles.inlineLink}>re-theme it live</Link>.
            </p>
            <p className={styles.introBody}>
              The specs (<Link href="/blueprints/claude" className={styles.inlineLink}>CLAUDE.md</Link>,{" "}
              <Link href="/blueprints/design" className={styles.inlineLink}>design.md</Link>,{" "}
              <Link href="/blueprints/content-design" className={styles.inlineLink}>content-design.md</Link>), the{" "}
              <Link href="/skills" className={styles.inlineLink}>skills</Link>, and the{" "}
              <Link href="/loops" className={styles.inlineLink}>loops</Link> are yours to lift into your own codebase or AI tooling. Agents read the same contracts through the MCP endpoint at <code>/api/mcp</code>, or as files: one JSON{" "}
              <Link href="/docs/schemas" className={styles.inlineLink}>schema</Link> per component and the tokens in the DTCG format.
            </p>
            {/* The Figma kit, shown while the site links to Figma. */}
            {SHOW_FIGMA_LINKS && (
              <p className={styles.introBody}>
                Designers get the same system in{" "}
                <a href={FIGMA_URL} target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>the Figma kit</a>: a page for every component, built on variables named after the same tokens, with themes and light and dark as variable modes. Every component page here links to its frame.
              </p>
            )}
            {/* The authorship line. The footer credits the author on every
                page, but the footer sits outside app/, so the chat corpus
                never sees it: this sentence is what lets the site answer
                who built it. AUTHOR_NAME/AUTHOR_URL own the values. */}
            <p className={styles.introBody}>
              The system is designed and built by{" "}
              <a href={AUTHOR_URL} target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>{AUTHOR_NAME}</a>, who writes the specs Claude Code builds from.
            </p>
          </div>

          {/* Maps + rail two-column layout */}
          <div className={styles.resumeLayout}>
            {/* Maps column (left) */}
            <div className={styles.resumeMain}>

              <section className={`${styles.mapSection} animate-in animate-delay-2`}>
                <SectionTitle title="Using it in your product" />
                <p className={styles.sectionBody}>
                  Install the package, import the token stylesheet and the
                  base sheet, and compose the components. A{" "}
                  <code>data-brand</code> attribute on your root element
                  applies a complete theme, light and dark. Your coding agent
                  joins through this site: one command installs the agent
                  skills, and the MCP endpoint serves the exact contracts
                  while it builds.
                </p>
                <ArchitectureMap
                  map={consumerMap}
                  caption="Your product on the right, the package on the left, this site serving your agent between them."
                />
              </section>

              <section className={`${styles.mapSection} animate-in animate-delay-2`}>
                <SectionTitle title="The rules it keeps" />
                <p className={styles.sectionBody}>
                  The same rules hold across the whole library, and the build
                  or CI checks each one, so a broken rule fails instead of
                  shipping.
                </p>
                <ul className={styles.sectionBullets}>
                  <li>
                    <strong>Tokens.</strong> Three tiers, never skipped:
                    primitives hold raw values, semantic tokens point at them,
                    and components use only the semantic tokens. The action
                    colour is reserved for actions, and shape is set per
                    element type, so every button matches every other. A
                    theme changes the values, never the tiers.
                  </li>
                  <li>
                    <strong>Props.</strong> Every component passes its ref and
                    your attributes to its element. State you can own takes
                    the same names everywhere: <code>value</code> to control
                    it, <code>defaultValue</code> to let the component keep
                    it, and <code>onValueChange</code> either way, with the
                    same shape for <code>checked</code>, <code>values</code>{" "}
                    and <code>open</code>. Every word a component writes is a
                    prop with an English default, so all of it translates.
                  </li>
                  <li>
                    <strong>Behaviour.</strong> Every overlay joins one layer
                    stack, so Escape closes only the top one and a menu inside
                    a Dialog closes first. Key bindings share one listener,
                    layout follows the reading direction, and numbers and
                    dates follow your locale. The{" "}
                    <Link href="/foundations/accessibility" className={styles.inlineLink}>
                      accessibility page
                    </Link>{" "}
                    has the detail.
                  </li>
                  <li>
                    <strong>The API.</strong> It only grows. A prop or export
                    is deprecated, never removed, so an older name keeps
                    working after an upgrade.
                  </li>
                </ul>
                <p className={styles.sectionBody}>
                  <Link href="/blueprints/design" className={styles.inlineLink}>design.md</Link>{" "}
                  holds the full set.
                </p>
              </section>

              <section className={`${styles.mapSection} animate-in animate-delay-2`}>
                <SectionTitle title="How the system fits together" />
                <p className={styles.sectionBody}>
                  One repo becomes a website, a Storybook, and an npm package
                  through one gate: generators derive every surface from one
                  source of truth, validators fail the build on drift, and CI
                  runs the chain on every push. Each map below pans, zooms,
                  and expands to full screen.
                </p>
                <ul className={styles.logoStrip} aria-label="The tools involved">
                  {[
                    { name: "Figma", logo: "/logos/Figma.svg" },
                    { name: "Claude Code", logo: "/logos/Claude.svg" },
                    { name: "GitHub", logo: "/logos/Git.svg" },
                    { name: "Storybook", logo: "/logos/storybook.svg" },
                    { name: "Vite", logo: "/logos/vite.svg" },
                    { name: "Next.js", logo: "/logos/nextjs black.svg", logoDark: "/logos/nextjs white.svg" },
                    { name: "Vercel", logo: "/logos/vercel black.svg", logoDark: "/logos/vercel white.svg" },
                    { name: "npm", logo: "/logos/npm.svg" },
                  ].map((tool) => (
                    <li key={tool.name} className={styles.logoChip}>
                      <Image
                        src={tool.logo}
                        alt=""
                        width={20}
                        height={20}
                        className={tool.logoDark ? styles.logoLight : undefined}
                      />
                      {tool.logoDark ? (
                        <Image src={tool.logoDark} alt="" width={20} height={20} className={styles.logoDark} />
                      ) : null}
                      <span>{tool.name}</span>
                    </li>
                  ))}
                </ul>
                <ArchitectureMap
                  map={systemOverviewMap}
                  caption="One repo, one gate, two destinations."
                />
              </section>

              <section className={`${styles.mapSection} animate-in animate-delay-3`}>
                <SectionTitle title="What the repo holds" />
                <p className={styles.sectionBody}>
                  The repo is five layers deep: primitives feed the semantic
                  tokens, tokens feed the components, and the components
                  compose the site UI and every page. The{" "}
                  <Link href="/graph" className={styles.inlineLink}>
                    graph page
                  </Link>{" "}
                  reads every edge from the CSS and imports at build time;
                  pick a token or component to trace what it depends on and
                  what depends on it.
                </p>
                <GraphMiniature />
              </section>

              <section className={`${styles.mapSection} animate-in animate-delay-3`}>
                <SectionTitle title="How a change ships" />
                <p className={styles.sectionBody}>
                  Every change goes live in five stages: author, generate and
                  validate, build, gate, ship. A push to main deploys the
                  site; the package publishes to npm on its own lane, with
                  provenance and no stored token. The map shows each check in
                  the gate.
                </p>
                <ArchitectureMap
                  map={pipelineMap}
                  caption="Five stages, then down through the gate."
                />
              </section>

              <section className={`${styles.mapSection} animate-in animate-delay-3`}>
                <SectionTitle title="How Claude Code runs it" />
                <p className={styles.sectionBody}>
                  Claude Code drives the pipeline through{" "}
                  <Link href="/skills" className={styles.inlineLink}>skills</Link>{" "}
                  named for their end state. A change sits in one of four
                  states, and checkpoint, park, land, and ship move it between
                  them. Audit skills read and fix but never deploy; only ship
                  and super-ship, which runs a full drift audit first, reach
                  production.
                </p>
                <ArchitectureMap
                  map={operatorsMap}
                  caption="States, not steps: the skills are the transitions."
                />
              </section>

              <section className={`${styles.mapSection} animate-in animate-delay-3`}>
                <SectionTitle title="What runs once it’s live" />
                <p className={styles.sectionBody}>
                  Pages come from Vercel with the fonts and the chat corpus
                  baked in, and a scheduled smoke re-checks production.
                </p>
                <ul className={styles.sectionBullets}>
                  <li>
                    The chat answers through Claude from the site&apos;s
                    corpus, looking up prop and token contracts when it needs
                    them. Rate limits and a daily budget cap it, and
                    conversations are kept 30 days, tied to no name.
                  </li>
                  <li>
                    <code>/api/mcp</code> serves agents five tools with no key, no
                    account, and no model behind them: the component list,
                    prop APIs, tokens resolved per theme, install setup, and
                    a search of the docs. Component and token answers cite the
                    published file, and every search result its page.
                  </li>
                </ul>
                <ArchitectureMap
                  map={runtimeMap}
                  caption="Who talks to whom once the site is live."
                />
              </section>

              <section className={`${styles.mapSection} animate-in animate-delay-3`}>
                <SectionTitle title="How the chat answers" />
                <p className={styles.sectionBody}>
                  The corpus holds everything published as prose, cached for
                  an hour, so most answers come from context alone. Exact
                  facts (a prop&apos;s type or default, a token count, a
                  token&apos;s value in a theme) come from lookup tools that
                  read the same data <code>/api/mcp</code> serves, shown in
                  the widget as a trace point. The corpus keeps the chat
                  fluent; the tools keep it exact.
                </p>
                <ArchitectureMap
                  map={chatExchangeMap}
                  caption="One exchange. The highlighted edge is where the model stops reading prose and reads the contract."
                />
              </section>

            </div>

            {/* Stats + Links Rail (Right — 1/3 width) */}
            <aside className={styles.resumeSidebar}>
              <div className={`${styles.resumeSection} animate-in animate-delay-2`}>
                <SectionTitle title="By the numbers" />

                <div className={styles.statList}>
                  <Link href="/components" className={styles.statItem}>
                    <span className={styles.statValue}>{COMPONENT_COUNT}</span>
                    <span className={styles.statTitle}>React components</span>
                    <span className={styles.statLabel}>Each with docs and stories</span>
                  </Link>
                  <Link href="/foundations" className={styles.statItem}>
                    <span className={styles.statValue}>{TOKEN_COUNT}</span>
                    <span className={styles.statTitle}>Semantic tokens</span>
                    <span className={styles.statLabel}>{TOKEN_CATEGORY_COUNT} categories, light and dark</span>
                  </Link>
                  <Link href="/skills" className={styles.statItem}>
                    <span className={styles.statValue}>{SKILL_COUNT}</span>
                    <span className={styles.statTitle}>Claude Code skills</span>
                    <span className={styles.statLabel}>Building and auditing the system</span>
                  </Link>
                  <Link href="/releases" className={styles.statItem}>
                    <span className={styles.statValue}>{RELEASE_COUNT}</span>
                    <span className={styles.statTitle}>Releases</span>
                    <span className={styles.statLabel}>One entry per npm version</span>
                  </Link>
                </div>
              </div>

              <div className={`${styles.resumeSection} animate-in animate-delay-3`}>
                <SectionTitle title="Links" />

                {SHOW_FIGMA_LINKS && (
                  <a
                    href={FIGMA_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.toolItem}
                  >
                    <Image src="/logos/Figma.svg" alt="" width={28} height={28} />
                    <div className={styles.toolDetails}>
                      <span className={styles.toolName}>Figma</span>
                      <span className={styles.toolDesc}>Every component, on the same tokens</span>
                    </div>
                    <span className={`material-symbols-rounded ${styles.toolLinkIcon}`} aria-hidden="true">open_in_new</span>
                  </a>
                )}

                <a
                  href={STORYBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.toolItem}
                >
                  <Image src="/logos/storybook.svg" alt="" width={28} height={28} />
                  <div className={styles.toolDetails}>
                    <span className={styles.toolName}>Storybook</span>
                    <span className={styles.toolDesc}>Every component, every variant</span>
                  </div>
                  <span className={`material-symbols-rounded ${styles.toolLinkIcon}`} aria-hidden="true">open_in_new</span>
                </a>

                <a
                  href={REPOSITORY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.toolItem}
                >
                  <Image src="/logos/Git.svg" alt="" width={28} height={28} />
                  <div className={styles.toolDetails}>
                    <span className={styles.toolName}>GitHub</span>
                    <span className={styles.toolDesc}>The whole system, public</span>
                  </div>
                  <span className={`material-symbols-rounded ${styles.toolLinkIcon}`} aria-hidden="true">open_in_new</span>
                </a>
              </div>
            </aside>
          </div>

        </main>
      </div>

    </>
  );
}
