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
  FIGMA_FILE_URL,
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
              {BRAND_NAME} ships as the npm package <code>rift-ds</code>: layered CSS tokens, React components, and complete themes, each a generated stylesheet applied by one data-brand attribute. This site installs that package like any other consumer would, and everything documented here is held to the code by the build: generators write the docs from the code&apos;s own registries in{" "}
              <a href={REPOSITORY_URL} target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>the repo</a>, and validators fail the build when the two disagree. What these pages say is what the package does. You can{" "}
              <Link href="/docs/get-started" className={styles.inlineLink}>install it yourself</Link> and{" "}
              <Link href="/playground" className={styles.inlineLink}>re-theme it live</Link>.
            </p>
            <p className={styles.introBody}>
              All of it is open to lift: the specs ({" "}
              <Link href="/blueprints/claude" className={styles.inlineLink}>CLAUDE.md</Link>,{" "}
              <Link href="/blueprints/design" className={styles.inlineLink}>design.md</Link>,{" "}
              <Link href="/blueprints/content-design" className={styles.inlineLink}>content-design.md</Link>), the{" "}
              <Link href="/skills" className={styles.inlineLink}>skills</Link>, and the{" "}
              <Link href="/loops" className={styles.inlineLink}>loops</Link> drop into your own codebase or AI tooling. Agents connect to the same docs through the MCP endpoint at <code>/api/mcp</code>: one URL for the component list, exact prop contracts, and the token registry.
            </p>
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
                  The consumer&apos;s view first. Install the package, import
                  one stylesheet, and compose the components; a{" "}
                  <code>data-brand</code> attribute on your root element
                  applies a complete theme, light and dark included. Your
                  coding agent joins through this site: one command installs
                  the generated agent skill, and the MCP endpoint serves the
                  exact prop and token contracts while it builds.
                </p>
                <ArchitectureMap
                  map={consumerMap}
                  caption="Your product on the right, the package on the left, and this site serving your agent between them."
                />
              </section>

              <section className={`${styles.mapSection} animate-in animate-delay-2`}>
                <SectionTitle title="The system in one breath" />
                <p className={styles.sectionBody}>
                  One repo becomes one website, one Storybook, and one npm
                  package, through a single gate: generators derive every
                  surface from one source of truth, validators fail the
                  build when anything drifts, and CI runs the whole chain
                  on every push. The maps below magnify that picture one
                  lane at a time; each pans, zooms, and expands to fill
                  the screen.
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
                  gate, ship. A push to main deploys the site; the package
                  takes its own lane, published to npm with provenance and
                  no stored token. The map carries the detail: the drift
                  guard, the hydration smoke, the axe audit on every story.
                </p>
                <ArchitectureMap
                  map={pipelineMap}
                  caption="Five stages, then the flow snakes down through the gate."
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
                  from Vercel with the fonts and the chat corpus already
                  baked in, and a scheduled smoke re-proves production on a
                  cron.
                </p>
                <ul className={styles.sectionBullets}>
                  <li>
                    The chat answers through Claude from the published
                    site&apos;s corpus, reaching for the generated prop and
                    token contracts when a question needs them; rate limits
                    and a daily budget hold it, and conversations are kept
                    30 days, tied to no name.
                  </li>
                  <li>
                    <code>/api/mcp</code> serves agents five tools with no
                    key, no account, and no model behind them: the component
                    list, per-component prop APIs, the token registry, install
                    setup, and site search.
                  </li>
                </ul>
                <ArchitectureMap
                  map={runtimeMap}
                  caption="A space diagram, no time in it: who talks to whom once the site is live."
                />
              </section>

              <section className={`${styles.mapSection} animate-in animate-delay-3`}>
                <SectionTitle title="How the chat answers" divider={false} />
                <p className={styles.sectionBody}>
                  The chat&apos;s context is deliberate. The site corpus
                  carries everything published as prose, cached for an hour,
                  so most questions are answered from context alone. The
                  generated contracts stay out of it: for a prop&apos;s type
                  or default, or a token count, the model calls two lookup
                  tools that read the same in-memory data{" "}
                  <code>/api/mcp</code> serves to agents, and the lookup
                  surfaces in the widget as a trace point. The corpus makes
                  the chat fluent; the tools keep it exact.
                </p>
                <ArchitectureMap
                  map={chatExchangeMap}
                  caption="One exchange, zoomed in. The highlighted edge is the moment the model stops answering from prose and reads the contract."
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
                    href={`${FIGMA_FILE_URL}?node-id=246-5864`}
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
