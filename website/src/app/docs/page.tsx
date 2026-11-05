"use client";

import MegaNav from "../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Sidebar from "../../components/Sidebar/Sidebar";
import TocCard from "../../components/TocCard/TocCard";
import { getSidebarLinks, docsSidebarLinks } from "@/config/navigation";
import styles from "./page.module.css";
import kit from "../../components/TocCard/TocIllustration.module.css";
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
              published for agents as well as people, from the MCP endpoint and
              the JSON schemas to the per-component markdown. Start with Get started to install
              and theme the package, read Overview for how the system is built
              and verified, or take the spec files it is built from. The
              release log records what each published version shipped.
            </p>
          </div>

          <div className={`${styles.tocGrid} animate-in animate-delay-2`}>
            {/* Overview */}
            <TocCard disc href="/overview" title="Overview">
              <div className={styles.pipelinePreview}>
                <span className={styles.pipelineDot} />
                <span className={styles.pipelineBar} />
                <span className={styles.pipelineDot} />
                <span className={styles.pipelineBar} />
                <span className={styles.pipelineDot} />
              </div>
            </TocCard>

            {/* Get started */}
            <TocCard disc href="/docs/get-started" title="Get started">
              {/* A terminal window running the install */}
              <div className={kit.frame} aria-hidden="true">
                <div className={kit.row}>
                  <span className={kit.dot} />
                  <span className={kit.dot} />
                  <span className={kit.dot} />
                </div>
                <code className={kit.code}>$ npm install</code>
                <span className={kit.bar} style={{ width: "56px" }} />
              </div>
            </TocCard>

            {/* AI chat */}
            <TocCard disc href="/docs/chat" title="Add AI chat">
              {/* A chat panel: two replies around the visitor's own, over the composer */}
              <div className={kit.frame} aria-hidden="true">
                <span className={`${kit.tile} ${styles.chatBubble}`} style={{ width: "56px" }} />
                <span className={`${kit.tile} ${styles.chatBubble} ${styles.chatBubbleOwn}`} style={{ width: "40px" }} />
                <span className={`${kit.tile} ${styles.chatBubble}`} style={{ width: "64px" }} />
                <span className={styles.chatInput} />
              </div>
            </TocCard>

            {/* Blocks */}
            <TocCard disc href="/docs/blocks" title="Blocks">
              {/* A page assembled from blocks */}
              <div className={kit.frame} aria-hidden="true">
                <span className={`${kit.bar} ${kit.barStrong} ${kit.barHeading}`} style={{ width: "40px" }} />
                <div className={styles.blockGrid}>
                  <span className={kit.tile} />
                  <span className={kit.tile} />
                  <span className={kit.tile} />
                  <span className={kit.tile} />
                </div>
              </div>
            </TocCard>

            <TocCard disc href="/docs/schemas" title="Schemas">
              {/* A JSON object: keys and values */}
              <div className={kit.frame} aria-hidden="true">
                <code className={kit.code}>{"{"}</code>
                {[28, 40, 32].map((w) => (
                  <div key={w} className={`${kit.row} ${styles.schemaRow}`}>
                    <span className={`${kit.bar} ${kit.barStrong}`} style={{ width: "20px" }} />
                    <span className={kit.bar} style={{ width: `${w}px` }} />
                  </div>
                ))}
              </div>
            </TocCard>

            {/* Claude MD */}
            <TocCard disc href="/blueprints/claude" title="Claude MD">
              {/* The agent's rulebook: a checklist of rules, the first ticked */}
              <div className={styles.docPreview} aria-hidden="true">
                {[64, 48, 56].map((w, i) => (
                  <div key={w} className={styles.ruleRow}>
                    <span className={i === 0 ? `${styles.ruleBox} ${styles.ruleBoxDone}` : styles.ruleBox} />
                    <span className={styles.docLine} style={{ width: `${w}px` }} />
                  </div>
                ))}
              </div>
            </TocCard>

            {/* Design MD */}
            <TocCard disc href="/blueprints/design" title="Design MD">
              {/* The design spec as a sheet: colour swatches over the shape tokens */}
              <div className={styles.specSheet} aria-hidden="true">
                <div className={styles.specRow}>
                  <span className={styles.specSwatch} style={{ background: "var(--color-action-primary-bg)" }} />
                  <span className={styles.specSwatch} style={{ background: "var(--color-core-accent-amber)" }} />
                  <span className={styles.specSwatch} style={{ background: "var(--color-core-accent-violet)" }} />
                </div>
                <div className={styles.specRow}>
                  <span className={styles.specPill} />
                  <span className={styles.specInput} />
                </div>
              </div>
            </TocCard>

            {/* Content MD */}
            <TocCard disc href="/blueprints/content-design" title="Content MD">
              <div className={styles.docPreview}>
                <span className={styles.docType} aria-hidden="true">
                  A<span className={styles.docTypeBold}>a</span>
                </span>
                <span className={styles.docLine} style={{ width: "72px" }} />
                <span className={styles.docLine} style={{ width: "48px" }} />
              </div>
            </TocCard>

            {/* Skills */}
            <TocCard disc href="/skills" title="Skills">
              <div className={styles.skillFiles}>
                <span className={`${styles.skillFile} ${styles.skillFileBack}`} />
                <span className={styles.skillFile}>
                  <span className={`${kit.bar} ${kit.barStrong} ${kit.barHeading}`} style={{ width: "28px" }} />
                  <span className={kit.bar} style={{ width: "36px" }} />
                  <span className={kit.bar} style={{ width: "24px" }} />
                </span>
              </div>
            </TocCard>

            {/* Loops */}
            <TocCard disc href="/loops" title="Loops">
              {/* A ring with a dot riding it */}
              <div className={styles.loopRing} aria-hidden="true">
                <span className={styles.loopDot} />
              </div>
            </TocCard>

            {/* Project journal */}
            <TocCard disc href="/releases" title="Release log">
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
