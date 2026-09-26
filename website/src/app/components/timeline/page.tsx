"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Timeline } from "rift-ds/components/Timeline/Timeline";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

const CAREER = [
  {
    meta: "May 2024 – Present",
    title: "Northlight, Staff Product Designer",
    description:
      "The conversational AI platform, from prototype to production sessions.",
  },
  {
    meta: "Aug 2023 – May 2024",
    title: "Fieldnote, Lead Product Designer",
    description:
      "AI generation workflows for infrastructure planning: successful generations up sharply.",
  },
  {
    meta: "2021 – 2023",
    title: "Acme, Product Designer",
    description: "Profile and offer-creation platforms for global recruiting.",
  },
];

const LOOP_RUN = [
  { title: "Pull analytics" },
  { title: "One hypothesis" },
  { title: "Rewrite on a branch" },
  { title: "Approval" },
];

const companyLogo = (src: string, alt: string) => (
  <Image src={src} alt={alt} width={32} height={32} />
);

const EXPERIENCE = [
  {
    name: "Northlight",
    logo: companyLogo("/logos/storybook.svg", "Northlight"),
    roles: [
      {
        title: "Principal Product Designer",
        subtitle: "Consumer AI",
        start: "Jan 2026",
        present: true,
        bullets: [
          "Shipped the embedded assistant experiences inside ChatGPT and Claude.",
          <>
            Designed the bidirectional review checklist (full story in the{" "}
            <Link href="/templates">templates</Link>)
          </>,
        ],
      },
      {
        title: "Principal Product Designer",
        subtitle: "Agent Platform",
        start: "May 2024",
        end: "Jan 2026",
        bullets: [
          "Led design of the end-to-end conversational AI platform.",
          "Scaled to dozens of agents in production.",
        ],
      },
    ],
  },
  {
    name: "Fieldnote",
    logo: companyLogo("/logos/vite.svg", "Fieldnote"),
    roles: [
      {
        title: "Principal Product Designer",
        start: "Aug 2023",
        end: "May 2024",
        description:
          "Led end-to-end UX for a 0→1 generative AI tool for infrastructure planning.",
        bullets: [
          "Cut time-to-value from weeks to days.",
          "Reduced anomalies per output sharply.",
        ],
      },
    ],
  },
];

export default function TimelinePage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Timeline</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-timeline--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Ordered sequences: histories and steppers
            </p>
            <p className={styles.introBody}>
              One component, two orientations. Vertical for histories and process
              narratives: career entries, project phases. Horizontal for compact
              steppers like a loop&apos;s run stages. Markers are dots by default,
              numbered circles with <code>numbered</code>, or Material Symbols per item.
              The <code>company</code> variant swaps the marker for a logo and groups one
              or more roles (each with a right-aligned date) under a single entry.
            </p>
          </div>

          {/* Vertical */}
          <section className={styles.section}>
            <SectionTitle title="Vertical: a history" />
            <Timeline items={CAREER} />
          </section>

          {/* Numbered */}
          <section className={styles.section}>
            <SectionTitle title="Vertical: numbered steps" />
            <Timeline numbered items={LOOP_RUN} />
          </section>

          {/* Icons */}
          <section className={styles.section}>
            <SectionTitle title="With icons" />
            <Timeline
              items={[
                { icon: "monitoring", title: "Pull analytics", description: "Read GA4, filter bot noise." },
                { icon: "edit", title: "Rewrite on a branch", description: "One copy-shaped change per run." },
                { icon: "check_circle", title: "Approval", description: "A human approves every merge." },
              ]}
            />
          </section>

          {/* Horizontal */}
          <section className={styles.section}>
            <SectionTitle title="Horizontal stepper" />
            <Timeline orientation="horizontal" numbered items={LOOP_RUN} />
          </section>

          {/* Company */}
          <section className={styles.section}>
            <SectionTitle title="Company: grouped roles" />
            <Timeline variant="company" items={EXPERIENCE} />
          </section>

          <ComponentInstallStrip slug="timeline" />
        </main>
      </div>

    </>
  );
}
