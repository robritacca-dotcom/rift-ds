"use client";

import Link from "next/link";
import MegaNav from "../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Sidebar from "../../components/Sidebar/Sidebar";
import FloatingAnchorNav from "@/components/FloatingAnchorNav/FloatingAnchorNav";
import { Badge } from "@robr0/design-system/components/Badge/Badge";
import { CodeBlock } from "@robr0/design-system/components/CodeBlock/CodeBlock";
import { getSidebarLinks, docsSidebarLinks } from "@/config/navigation";
import { SKILL_COUNT } from "@/data/skills-registry";
import { skillsContent } from "@/data/skills-content.generated";
import styles from "./page.module.css";

const { sidebarLinks } = getSidebarLinks(docsSidebarLinks, "/skills");

/* Floating on-this-page entries — one per skill card, in registry order. */
const SKILL_ANCHORS = skillsContent.map((skill) => ({
  id: skill.slug,
  label: skill.name,
}));


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
              <code className={styles.inlineCode}>.claude/skills/</code> (most in this
              repo; only <code className={styles.inlineCode}>ga-report</code> lives in my
              personal skills folder) and encode this project’s conventions:
              component patterns, token rules, navigation wiring, and more. Invoke any
              skill by name in Claude Code and it follows the exact steps without
              re-explanation each session. Expand any skill to read the full file, and
              copy it to adapt it for your own project. The recurring ones run as loops: see{" "}
              <Link href="/loops" className={styles.introLink}>Loops</Link>.
            </p>
          </div>

          {/* Skills List */}
          <div className={`${styles.railLayout} animate-in animate-delay-2`}>
            <div className={styles.skillsGrid}>
            {skillsContent.map((skill) => (
              <div key={skill.slug} id={skill.slug} className={styles.skillCard}>
                <div className={styles.skillCardHeader}>
                  <div className={styles.skillMeta}>
                    <span className={`material-symbols-rounded ${styles.skillIcon}`}>
                      {skill.icon}
                    </span>
                    <code className={styles.skillName}>{skill.name}</code>
                  </div>
                </div>

                <p className={styles.skillDescription}>{skill.description}</p>

                <CodeBlock
                  code={skill.content}
                  filename={`${skill.slug}.md`}
                  language="md"
                  collapsible
                  defaultCollapsed
                  maxHeight={300}
                />

                <div className={styles.skillInvoke}>
                  <span className={styles.skillInvokeLabel}>Invoke:</span>
                  {skill.invoke.map((phrase) => (
                    <Badge key={phrase} variant="info" label={phrase} />
                  ))}
                </div>
              </div>
            ))}
            </div>
          </div>

          <FloatingAnchorNav items={SKILL_ANCHORS} />
        </main>
      </div>

    </>
  );
}
