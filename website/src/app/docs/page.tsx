"use client";

import MegaNav from "../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Sidebar from "../../components/Sidebar/Sidebar";
import TocCard from "../../components/TocCard/TocCard";
import { getSidebarLinks, docsSidebarLinks } from "@/config/navigation";
import styles from "./page.module.css";
import { BRAND_NAME } from "@/config/brand.generated";

const { sidebarLinks } = getSidebarLinks(docsSidebarLinks, "/docs");

/* Static intensity pattern (0–4) for the mini contribution-grid preview */
const journalCells = [
  0, 2, 1, 3, 0,
  1, 3, 4, 2, 1,
  2, 4, 3, 4, 2,
  1, 2, 4, 3, 0,
  0, 1, 2, 1, 1,
];

export default function DocsPage() {
  return (
    <>

      <MegaNav />

      <div className={styles.dsLayout}>
        <Sidebar links={sidebarLinks} />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          {/* Page Title */}
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Docs</h1>
          </div>

          {/* Intro */}
          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              What it is, how to use it, and why to trust it
            </p>
            <p className={styles.introBody}>
              {BRAND_NAME} is an open source React design system built for AI
              products and the coding agents that build them. Three ideas run
              through everything here. Every look is one attribute: complete
              themes ship in the package as generated stylesheets. Every fact
              on this site derives from a registry the build enforces, so the
              docs cannot quietly drift from the code. And every contract is
              published for agents as well as people, from the MCP endpoint to
              the per-component markdown. Start with Get started to install
              and theme the package, read Overview for how the system is built
              and verified, or take the spec files it is built from. The
              release log records what each published version shipped.
            </p>
          </div>

          <div className={`${styles.tocGrid} animate-in animate-delay-2`}>
            {/* Overview */}
            <TocCard href="/overview" title="Overview">
              <div className={`${styles.circlePreview} ${styles.circleDashed}`}>
                <div className={styles.pipelinePreview}>
                  <span className={styles.pipelineDot} />
                  <span className={styles.pipelineBar} />
                  <span className={styles.pipelineDot} />
                  <span className={styles.pipelineBar} />
                  <span className={styles.pipelineDot} />
                </div>
              </div>
            </TocCard>

            {/* Get started */}
            <TocCard href="/docs/get-started" title="Get started">
              <div className={`${styles.circlePreview} ${styles.circleDashed}`}>
                <div className={styles.installPreview}>
                  <span className="material-symbols-rounded" aria-hidden="true" style={{ color: "var(--color-text-secondary)" }}>
                    terminal
                  </span>
                  <code className={styles.previewInstall}>npm install</code>
                </div>
              </div>
            </TocCard>

            {/* Claude MD */}
            <TocCard href="/blueprints/claude" title="Claude MD">
              <div className={`${styles.circlePreview} ${styles.circleNeutral}`}>
                <div className={styles.docPreview}>
                  <span className={styles.docHeading} />
                  <span className={styles.docLine} style={{ width: "72px" }} />
                  <span className={styles.docLine} style={{ width: "56px" }} />
                  <span className={styles.docLine} style={{ width: "64px" }} />
                </div>
              </div>
            </TocCard>

            {/* Design MD */}
            <TocCard href="/blueprints/design" title="Design MD">
              <div className={`${styles.circlePreview} ${styles.circleNeutral}`}>
                <div className={styles.docPreview}>
                  <div className={styles.docSwatches}>
                    <span className={styles.docSwatch} style={{ background: "var(--primitive-teal-07)" }} />
                    <span className={styles.docSwatch} style={{ background: "var(--color-core-accent-amber)" }} />
                    <span className={styles.docSwatch} style={{ background: "var(--primitive-purple-07)" }} />
                  </div>
                  <span className={styles.docLine} style={{ width: "72px" }} />
                  <span className={styles.docLine} style={{ width: "56px" }} />
                </div>
              </div>
            </TocCard>

            {/* Content MD */}
            <TocCard href="/blueprints/content-design" title="Content MD">
              <div className={`${styles.circlePreview} ${styles.circleNeutral}`}>
                <div className={styles.docPreview}>
                  <span className={styles.docType} aria-hidden="true">
                    A<span className={styles.docTypeBold}>a</span>
                  </span>
                  <span className={styles.docLine} style={{ width: "72px" }} />
                  <span className={styles.docLine} style={{ width: "48px" }} />
                </div>
              </div>
            </TocCard>

            {/* Skills */}
            <TocCard href="/skills" title="Skills">
              <div className={`${styles.circlePreview} ${styles.circleGreen}`}>
                <div className={styles.skillFiles}>
                  <span className={`${styles.skillFile} ${styles.skillFileBack}`} />
                  <span className={styles.skillFile}>
                    <span className="material-symbols-rounded" aria-hidden="true" style={{ color: "var(--color-text-secondary)" }}>
                      auto_awesome
                    </span>
                  </span>
                </div>
              </div>
            </TocCard>

            {/* Loops */}
            <TocCard href="/loops" title="Loops">
              <div className={`${styles.circlePreview} ${styles.circleBlue}`}>
                <span className="material-symbols-rounded" aria-hidden="true" style={{ color: "var(--color-text-secondary)" }}>
                  cycle
                </span>
              </div>
            </TocCard>

            {/* Project journal */}
            <TocCard href="/releases" title="Release log">
              <div className={styles.journalGrid}>
                {journalCells.map((level, i) => (
                  <span key={i} className={`${styles.journalCell} ${styles[`journalCellL${level}`]}`} />
                ))}
              </div>
            </TocCard>
          </div>
        </main>
      </div>

    </>
  );
}
