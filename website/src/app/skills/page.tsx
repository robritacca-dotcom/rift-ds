"use client";

import Link from "next/link";
import MegaNav from "../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Sidebar from "../../components/Sidebar/Sidebar";
import FloatingAnchorNav from "@/components/FloatingAnchorNav/FloatingAnchorNav";
import { SkillCard } from "@/components/SkillCard/SkillCard";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { Table, type TableColumn } from "rift-ds/components/Table/Table";
import { getSidebarLinks, docsSidebarLinks } from "@/config/navigation";
import { SKILL_COUNT } from "@/data/skills-registry";
import { skillsContent, skillCategories } from "@/data/skills-content.generated";
import { QUALITY_GATE } from "@/data/quality-gate.generated";
import styles from "./page.module.css";

const { sidebarLinks } = getSidebarLinks(docsSidebarLinks, "/skills");

const SKILLS_BY_SLUG = new Map(skillsContent.map((skill) => [skill.slug, skill]));

/* A category's anchor. The suffix keeps it apart from the skill cards,
   whose ids are bare slugs ("ship" is both a category and a skill). */
const categoryAnchor = (id: string) => `${id}-skills`;
const GATE_ANCHOR = "quality-gate";
const GATE_TITLE = "Every check a ship runs";

/* Floating on-this-page entries: one per category, in registry order,
   then the quality gate. */
const PAGE_ANCHORS = [
  ...skillCategories.map((category) => ({
    id: categoryAnchor(category.id),
    label: category.label,
  })),
  { id: GATE_ANCHOR, label: "Quality gate" },
];

const GATE_COLUMNS: TableColumn[] = [
  { key: "check", header: "Check", rowHeader: true },
  { key: "text", header: "What it holds" },
];

/* ============================================
   PAGE
   ============================================ */

export default function SkillsPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <Sidebar links={sidebarLinks} />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          {/* Page Header */}
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Skills</h1>
          </div>

          {/* Intro */}
          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Reusable AI instructions, tuned for this project
            </p>
            <p className={styles.introBody}>
              These {SKILL_COUNT} skill files live in{" "}
              <code className={styles.inlineCode}>.claude/skills/</code> in this
              repo. They are the maintainer’s own: the steps Claude Code follows
              here to add a component, audit the system or ship a change. Invoke
              one by name and it runs without re-explanation each session. Every
              card holds the full file, so expand one to read it, or copy it and
              adapt it for your own project. The skills written to be installed
              in a project that uses the package are on{" "}
              <Link href="/docs/get-started" className={styles.introLink}>Get started</Link>.
            </p>
          </div>

          {/* One section per category, in registry order */}
          {skillCategories.map((category) => (
            <section
              key={category.id}
              id={categoryAnchor(category.id)}
              className={`${styles.category} animate-in animate-delay-2`}
            >
              <SectionTitle title={category.label} />
              <p className={styles.introBody}>{category.description}</p>
              <div className={styles.skillsGrid}>
                {category.skills.map((slug) => {
                  const skill = SKILLS_BY_SLUG.get(slug);
                  return skill ? <SkillCard key={slug} skill={skill} /> : null;
                })}
              </div>
            </section>
          ))}

          {/* The quality gate: generated from the chain, verify and CI */}
          <section id={GATE_ANCHOR} className={`${styles.category} animate-in animate-delay-2`}>
            <SectionTitle title={GATE_TITLE} />
            <p className={styles.introBody}>
              This is the whole gate, in the order it runs: the{" "}
              <code className={styles.inlineCode}>validate-registry</code> chain, the rest of{" "}
              <code className={styles.inlineCode}>npm run verify</code>, then what CI adds. The
              list is built from <code className={styles.inlineCode}>scripts/chain.mjs</code>,{" "}
              <code className={styles.inlineCode}>package.json</code> and the CI workflow on
              every build, so a new validator cannot join the chain without a line here. After
              the push, the hydration smoke runs once more against the live site.
            </p>
            {QUALITY_GATE.map((group) => (
              <div key={group.id} className={styles.gateGroup}>
                <h3 className={styles.gateGroupTitle}>{group.title}</h3>
                <p className={styles.introBody}>{group.body}</p>
                <Table
                  columns={GATE_COLUMNS}
                  rows={group.checks.map((check) => ({
                    id: check.name,
                    cells: {
                      check: <code className={styles.inlineCode}>{check.name}</code>,
                      text: check.text,
                    },
                  }))}
                  bordered
                  caption={group.title}
                  captionHidden
                />
              </div>
            ))}
          </section>

          <FloatingAnchorNav items={PAGE_ANCHORS} />
        </main>
      </div>

    </>
  );
}
