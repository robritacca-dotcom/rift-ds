"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import {
  ContributionGraph,
  type ContributionDay,
} from "@robr0/design-system/components/ContributionGraph/ContributionGraph";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import GitHubContributions from "../../../components/GitHubContributions/GitHubContributions";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

/** Deterministic pseudo-random generator so the demo renders consistently */
const seededRandom = (seed: number) => () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};

/** Generate a year of demo contribution data ending today */
const generateYear = (seed = 42): { days: ContributionDay[]; total: number } => {
  const random = seededRandom(seed);
  const days: ContributionDay[] = [];
  let total = 0;

  const end = new Date();
  const start = new Date(end);
  start.setFullYear(start.getFullYear() - 1);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const active = random() < (isWeekend ? 0.25 : 0.6);
    const count = active ? Math.floor(random() * 12) + 1 : 0;
    const level = (count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 9 ? 3 : 4) as ContributionDay["level"];
    total += count;

    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    days.push({ date: iso, count, level });
  }

  return { days, total };
};

const demo = generateYear();

export default function ContributionGraphPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Contribution graph</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-contributiongraph--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              A year of activity, one cell per day
            </p>
            <p className={styles.introBody}>
              The contribution graph renders a GitHub-style heatmap: weeks as columns, weekdays as rows, and a five-step green ramp (<code>--color-chart-contribution-0</code> through <code>-4</code>) mapping each day&apos;s activity level to colour. It takes a plain array of days, so the data can come from anywhere: the GitHub API, an internal tool, or generated demo data.
            </p>
          </div>

          {/* Live data */}
          <section className={styles.section}>
            <SectionTitle title="Live GitHub data" />
            <p className={styles.introBody}>
              This instance pulls real contribution data for the account that builds robr0 DS, cached server-side and refreshed every six hours.
            </p>
            <GitHubContributions />
          </section>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <p className={styles.introBody}>
              The graph wears the same card, header, and padding as every other chart; bare strips them when a surrounding panel supplies the surface, as the live instance above does.
            </p>
            <ContributionGraph
              days={demo.days}
              title="Contribution activity"
              subtitle="One cell per day, coloured by volume"
              caption={`${demo.total} contributions in the last year`}
            />
          </section>

          {/* Grid only */}
          <section className={styles.section}>
            <SectionTitle title="Grid only" />
            <p className={styles.introBody}>
              Month labels, caption, and legend are all optional: the bare grid works as a compact activity strip.
            </p>
            <ContributionGraph
              bare
              days={demo.days}
              showMonthLabels={false}
              showLegend={false}
            />
          </section>
        </main>
      </div>

    </>
  );
}
