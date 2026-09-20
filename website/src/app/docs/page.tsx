"use client";

import MegaNav from "../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Sidebar from "../../components/Sidebar/Sidebar";
import TocCard from "../../components/TocCard/TocCard";
import { getSidebarLinks, docsSidebarLinks } from "@/config/navigation";
import styles from "./page.module.css";

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
              The system, explained and ready to reuse
            </p>
            <p className={styles.introBody}>
              Everything that makes robr0 DS run, documented in one place. Start with the overview for the pipeline behind the system, get started with installing and theming the package, read the spec files Claude Code builds from, or take the skills and loops that automate the work. The project journal keeps a running record of how it all came together.
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
            <TocCard href="/project-journal" title="Project journal">
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
