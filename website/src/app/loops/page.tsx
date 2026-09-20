"use client";

import Link from "next/link";
import MegaNav from "../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Sidebar from "../../components/Sidebar/Sidebar";
import { Badge } from "@robr0/design-system/components/Badge/Badge";
import { Chip } from "@robr0/design-system/components/Chip/Chip";
import { getSidebarLinks, docsSidebarLinks } from "@/config/navigation";
import { loops } from "@/data/loops";
import styles from "./page.module.css";

const { sidebarLinks } = getSidebarLinks(docsSidebarLinks, "/loops");

/* ============================================
   PAGE
   ============================================ */

export default function LoopsPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <Sidebar links={sidebarLinks} />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          {/* Page Header */}
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Loops</h1>
          </div>

          {/* Intro */}
          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Agents on a schedule, with a human approval gate
            </p>
            <p className={styles.introBody}>
              Skills are capabilities: instructions Claude Code follows when I invoke
              them. Loops are what happens when a skill runs on a schedule. An agent
              does real work against real data and brings me a proposal. Nothing merges
              or deploys itself; every loop ends in the same place, me reviewing a
              branch. This page documents the loops currently running on this site.
            </p>
          </div>

          {/* Loops List */}
          <div className={`${styles.loopsGrid} animate-in animate-delay-2`}>
            {loops.map((loop) => (
              <div key={loop.slug} className={styles.loopCard}>
                <div className={styles.loopCardHeader}>
                  <div className={styles.loopMeta}>
                    <span className={`material-symbols-rounded ${styles.loopIcon}`}>
                      {loop.icon}
                    </span>
                    <code className={styles.loopName}>{loop.slug}</code>
                  </div>
                  <div className={styles.loopBadges}>
                    <Badge
                      variant={loop.status === "active" ? "positive" : "neutral"}
                      label={loop.status === "active" ? "Active" : "Paused"}
                    />
                    <Badge variant="neutral" label={loop.cadence} />
                  </div>
                </div>

                <p className={styles.loopDescription}>{loop.description}</p>

                <div className={styles.loopSection}>
                  <span className={styles.loopSectionLabel}>Each run:</span>
                  <div className={styles.loopStages}>
                    {loop.stages.map((stage, i) => (
                      <Chip
                        key={stage}
                        size="compact"
                        label={
                          <>
                            <span className={styles.loopStageNum}>{i + 1}</span>
                            {stage}
                          </>
                        }
                      />
                    ))}
                  </div>
                </div>

                <div className={styles.loopSection}>
                  <span className={styles.loopSectionLabel}>Guardrails:</span>
                  <ul className={styles.loopGuardrails}>
                    {loop.guardrails.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </div>

                <div className={styles.loopFooter}>
                  <span className={styles.loopSectionLabel}>Built on:</span>
                  {loop.skills.map((skill) => (
                    <Link key={skill} href="/skills" className={styles.loopSkillLink}>
                      <span className="material-symbols-rounded" aria-hidden="true">
                        bolt
                      </span>
                      {skill}
                    </Link>
                  ))}
                  <span className={styles.loopTrigger}>{loop.trigger}</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

    </>
  );
}
