"use client";

import Image from "next/image";
import Link from "next/link";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import MegaNav from "../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Sidebar from "../../components/Sidebar/Sidebar";
import { ArchitectureMap } from "@/components/ArchitectureMap/ArchitectureMap";
import GraphMiniature from "@/components/SystemGraph/GraphMiniature";
import { getSidebarLinks, docsSidebarLinks } from "@/config/navigation";
import { COMPONENT_COUNT } from "@robr0/design-system/components/registry";
import { TOKEN_COUNT, TOKEN_COUNTS } from "@robr0/design-system/tokens/registry";
import { SKILL_COUNT } from "@/data/skills-registry";
import { SITE_UPDATE_COUNT } from "@/data/site-updates";
import { chatExchangeMap, operatorsMap, pipelineMap, runtimeMap, systemOverviewMap } from "./maps";
import styles from "./page.module.css";

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
            <h1 className={styles.pageTitle}>Overview of robr0 DS</h1>
          </div>

          {/* Intro */}
          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              An AI-ready design system, built to make this site
            </p>
            <p className={styles.introBody}>
              robr0 DS is the design system behind every page on this site: a solo build, run as a working experiment in how far a written spec and an AI pair can carry a production system. The foundation was designed in{" "}
              <a href="https://www.figma.com/design/8NzqDS8iRsBTFPbNGj3Woj/robr0-ds26?node-id=246-5864" target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>Figma</a>; the system lives in{" "}
              <a href="https://github.com/robritacca-dotcom/design-system" target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>the repo</a> as a{" "}
              <Link href="/blueprints/design" className={styles.inlineLink}>written spec</Link>, layered CSS tokens, and React components, and Claude Code builds from the spec, so a design change reaches production in under a minute. It ships as the npm package <code>@robr0/design-system</code>, and this site installs that package like any other consumer would. You can{" "}
              <Link href="/docs/get-started" className={styles.inlineLink}>install it yourself</Link> and{" "}
              <Link href="/playground" className={styles.inlineLink}>re-theme it live</Link>.
            </p>
            <p className={styles.introBody}>
              Everything is on display because the system is the work: the maps and the graph below show how the pieces fit, and all of it is open to lift.{" "}
              <Link href="/blueprints/claude" className={styles.inlineLink}>CLAUDE.md</Link>,{" "}
              <Link href="/blueprints/design" className={styles.inlineLink}>design.md</Link>,{" "}
              <Link href="/blueprints/content-design" className={styles.inlineLink}>content-design.md</Link>, the{" "}
              <Link href="/skills" className={styles.inlineLink}>skills</Link>, and the{" "}
              <Link href="/loops" className={styles.inlineLink}>loops</Link> drop into your own codebase or AI tooling. Agents get the same access: the site serves a Model Context Protocol endpoint at <code>/api/mcp</code>, so a coding agent connects with one URL and reads the component list, exact prop contracts, and the token registry while it builds with the package, instead of guessing at props.
            </p>
          </div>

          {/* Maps + rail two-column layout */}
          <div className={styles.resumeLayout}>
            {/* Maps column (left) */}
            <div className={styles.resumeMain}>

              <section className={`${styles.mapSection} animate-in animate-delay-2`}>
                <SectionTitle title="The system in one breath" />
                <p className={styles.sectionBody}>
                  One repo becomes one website, one Storybook, and one npm
                  package. Between the repo and its two destinations sits a
                  single gate: generators derive every surface from one
                  source of truth, validators fail the build when anything
                  drifts, and CI runs the whole chain on every push. The
                  rest of this page magnifies that picture one lane at a
                  time: what the repo holds, how a change moves through it,
                  what drives the moves, and what runs once the site is
                  live. Each map pans, zooms, and expands to fill the
                  screen.
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
                    { name: "Google", logo: "/logos/google.svg" },
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
                  caption="One repo, one gate, two destinations. The other four maps magnify the lanes."
                />
              </section>

              <section className={`${styles.mapSection} animate-in animate-delay-3`}>
                <SectionTitle title="The system as one graph" divider={false} />
                <p className={styles.sectionBody}>
                  Start with what the repo holds. Laid out as one graph, the
                  system is five layers deep: primitives feed the semantic
                  tokens, tokens feed the components, and the components
                  compose the site UI and every page. The{" "}
                  <Link href="/graph" className={styles.inlineLink}>
                    graph page
                  </Link>{" "}
                  reads every edge out of the CSS and the import statements
                  at build time. Pick any token or component and it traces
                  both directions: everything it depends on, and everything
                  that would feel a change to it.
                </p>
                <GraphMiniature />
              </section>

              <section className={`${styles.mapSection} animate-in animate-delay-3`}>
                <SectionTitle title="The pipeline" divider={false} />
                <p className={styles.sectionBody}>
                  A change to any of those layers becomes live the same way,
                  in five stages: author, generate and validate, build,
                  gate, ship. Figma feeds the
                  authoring stage from outside, Google is touched exactly once
                  at build time (the typeface is fetched, then self-hosted),
                  and a push to main deploys straight to Vercel.
                  The package takes its own lane: a manual release publishes
                  to npm with provenance, no stored token. The map carries the
                  detail: the drift guard, the hydration smoke, the axe audit
                  on every story.
                </p>
                <ArchitectureMap
                  map={pipelineMap}
                  caption="Five stages, then the flow snakes down through the gate. The teal edge is the one Google touch before runtime."
                />
              </section>

              <section className={`${styles.mapSection} animate-in animate-delay-3`}>
                <SectionTitle title="The operator layer" divider={false} />
                <p className={styles.sectionBody}>
                  Claude Code drives the pipeline through{" "}
                  <Link href="/skills" className={styles.inlineLink}>skills</Link>{" "}
                  named for their end state. The spine is four states a change
                  can be in; checkpoint, park, land, and ship are the
                  transitions between them, and the audit skills above the
                  spine can read and fix but never deploy. The only two paths
                  to production are ship and super-ship, which runs a full
                  drift audit first.
                </p>
                <ArchitectureMap
                  map={operatorsMap}
                  caption="States, not steps: the spine has no arrows of its own because the skills are the transitions."
                />
              </section>

              <section className={`${styles.mapSection} animate-in animate-delay-3`}>
                <SectionTitle title="The architecture at runtime" divider={false} />
                <p className={styles.sectionBody}>
                  Once the site is live, only the edges matter. Pages come
                  from Vercel with the fonts and the chat corpus already baked
                  in, analytics events go from the browser straight to Google
                  and never touch Vercel, and a scheduled smoke re-proves
                  production every four hours.
                </p>
                <ul className={styles.sectionBullets}>
                  <li>
                    The chat answers from the published site through Claude,
                    reaching for the same generated prop and token contracts
                    the MCP tools serve when a question needs them, held by
                    per-visitor rate limits and a daily budget; conversations
                    are kept for 30 days, tied to no name, then deleted. The
                    same widget runs in{" "}
                    <Link href="/playground?view=chat" className={styles.inlineLink}>
                      the playground&apos;s Chat view
                    </Link>
                    .
                  </li>
                  <li>
                    <code>/api/mcp</code> serves agents five tools with no
                    key, no account, and no model behind them: the component
                    list, per-component prop APIs, the token registry, install
                    setup, and site search.
                  </li>
                  <li>
                    The pipeline&apos;s single Google touch has two runtime
                    exceptions, both fonts: the playground&apos;s typeface
                    picker and the MCP endpoint&apos;s landing page fetch
                    type from Google when opened.
                  </li>
                </ul>
                <ArchitectureMap
                  map={runtimeMap}
                  caption="A space diagram, no time in it. The teal edge is the one the vendor-grouped version filed wrong."
                />
              </section>

              <section className={`${styles.mapSection} animate-in animate-delay-3`}>
                <SectionTitle title="How the chat answers" divider={false} />
                <p className={styles.sectionBody}>
                  One of those edges gets its own map. The chat&apos;s
                  context is a two-part answer to one question: what should
                  the model know? The site corpus
                  carries everything published as prose, baked in at build
                  time and cached for an hour, so most questions are answered
                  from context alone. What it deliberately leaves out is the
                  generated contracts: the component prop API and the token
                  registry, thousands of facts most questions never touch.
                  For those, the model carries two lookup tools. When a
                  question needs a prop&apos;s type or default, a
                  deprecation, or a token count, it reads the answer from the
                  same in-memory data <code>/api/mcp</code> serves to agents,
                  and the lookup surfaces in the widget as a trace point. The
                  corpus makes the chat fluent; the tools keep it exact.
                </p>
                <ArchitectureMap
                  map={chatExchangeMap}
                  caption="One exchange, zoomed in. The teal edge is the moment the model stops answering from prose and reads the contract."
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
                  <Link href="/project-journal" className={styles.statItem}>
                    <span className={styles.statValue}>{SITE_UPDATE_COUNT}</span>
                    <span className={styles.statTitle}>Journal entries</span>
                    <span className={styles.statLabel}>The build, tracked in public</span>
                  </Link>
                </div>
              </div>

              <div className={`${styles.resumeSection} animate-in animate-delay-3`}>
                <SectionTitle title="Links" />

                <a
                  href="https://www.figma.com/design/8NzqDS8iRsBTFPbNGj3Woj/robr0-ds26?node-id=246-5864"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.toolItem}
                >
                  <Image src="/logos/Figma.svg" alt="" width={28} height={28} />
                  <div className={styles.toolDetails}>
                    <span className={styles.toolName}>Figma</span>
                    <span className={styles.toolDesc}>Where the foundation was designed</span>
                  </div>
                  <span className={`material-symbols-rounded ${styles.toolLinkIcon}`} aria-hidden="true">open_in_new</span>
                </a>

                <a
                  href="https://design-system-iota-one.vercel.app/?path=/docs/robr0-ds--docs"
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
                  href="https://github.com/robritacca-dotcom/design-system"
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
