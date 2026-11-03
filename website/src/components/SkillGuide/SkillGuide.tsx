import Link from "next/link";
import MegaNav from "@/components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Sidebar from "@/components/Sidebar/Sidebar";
import { ArchitectureMap } from "@/components/ArchitectureMap/ArchitectureMap";
import type { ArchMap } from "@/components/ArchitectureMap/types";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { Table, type TableColumn, type TableRow } from "rift-ds/components/Table/Table";
import { Timeline, type TimelineItem } from "rift-ds/components/Timeline/Timeline";
import { getSidebarLinks, docsSidebarLinks } from "@/config/navigation";
import styles from "./SkillGuide.module.css";

const { sidebarLinks } = getSidebarLinks(docsSidebarLinks, "/skills");

/**
 * The shell every /skills/<slug> walkthrough renders: the steps as a
 * numbered Timeline, one real run traced on an ArchitectureMap, and a
 * bordered Table that sums the run up. A page passes content only; the
 * layout, section order and components live here.
 */
export interface SkillGuideProps {
  /** The skill's slug, shown as the page title. */
  slug: string;
  /** The sub-display line under the title. */
  tagline: string;
  /** The intro paragraph. */
  intro: React.ReactNode;
  /** The skill's steps, in order. */
  steps: TimelineItem[];
  /** One real run of the skill, drawn as a map. */
  example: {
    title: string;
    body: React.ReactNode;
    map: ArchMap;
    caption: string;
  };
  /** A table that sums the example up. */
  summary: {
    title: string;
    body: React.ReactNode;
    columns: TableColumn[];
    rows: TableRow[];
    caption: string;
  };
}

export function SkillGuide({ slug, tagline, intro, steps, example, summary }: SkillGuideProps) {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <Sidebar links={sidebarLinks} />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>{slug}</h1>
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>{tagline}</p>
            <p className={styles.sectionBody}>
              {intro} The full skill file is on{" "}
              <Link href={`/skills#${slug}`} className={styles.introLink}>Skills</Link>.
            </p>
          </div>

          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="The steps" />
            <Timeline items={steps} numbered />
          </section>

          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title={example.title} />
            <p className={styles.sectionBody}>{example.body}</p>
            <ArchitectureMap map={example.map} caption={example.caption} />
          </section>

          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title={summary.title} />
            <p className={styles.sectionBody}>{summary.body}</p>
            <Table
              columns={summary.columns}
              rows={summary.rows}
              bordered
              caption={summary.caption}
              captionHidden
            />
          </section>
        </main>
      </div>
    </>
  );
}

/** Inline code inside a walkthrough's prose, styled like the rest of the shell. */
export function GuideCode({ children }: { children: React.ReactNode }) {
  return <code className={styles.inlineCode}>{children}</code>;
}
