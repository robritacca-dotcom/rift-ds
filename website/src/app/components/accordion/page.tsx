"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Accordion } from "@robr0/design-system/components/Accordion/Accordion";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

const faqItems = [
  {
    id: "1",
    title: "What is a design system?",
    content: (
      <p>
        A design system is a collection of reusable components, guided by clear standards, that can be assembled to build any number of applications consistently and efficiently.
      </p>
    ),
  },
  {
    id: "2",
    title: "Why use design tokens?",
    content: (
      <p>
        Tokens store design decisions (colours, spacing, typography) as named variables so every component stays in sync when values change.
      </p>
    ),
  },
  {
    id: "3",
    title: "How do I contribute?",
    content: (
      <p>
        Open a pull request with your component or token change. Make sure it follows the naming conventions and includes Storybook stories.
      </p>
    ),
  },
];

export default function AccordionPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Accordion</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-accordion--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Expand and collapse content
            </p>
            <p className={styles.introBody}>
              Accordions organise related content into collapsible sections so users can focus on what matters. Available in single-open or multiple-open mode.
            </p>
          </div>

          {/* Single */}
          <section className={styles.section}>
            <SectionTitle title="Single open" />
            <div style={{ maxWidth: "520px" }}>
              <Accordion items={faqItems} defaultExpanded={["1"]} />
            </div>
          </section>

          {/* Multiple */}
          <section className={styles.section}>
            <SectionTitle title="Multiple open" />
            <div style={{ maxWidth: "520px" }}>
              <Accordion items={faqItems} multiple defaultExpanded={["1", "3"]} />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
