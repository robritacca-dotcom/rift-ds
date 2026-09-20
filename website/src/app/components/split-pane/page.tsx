"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { SplitPane } from "@robr0/design-system/components/SplitPane/SplitPane";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import { Kbd } from "@robr0/design-system/components/Kbd/Kbd";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function SplitPanePage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Split pane</h1>
            <PageLinks storybookPath="/?path=/docs/components-splitpane--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Two regions, one negotiable boundary
            </p>
            <p className={styles.introBody}>
              The sidebar and the canvas, the list and the detail, the editor
              and the preview. The split is a percentage, so it survives
              container resizes, and panes clip their content rather than
              growing the page. The divider is a real separator: focusable,
              draggable with pointer capture, and nudged by arrow keys.
            </p>
          </div>

          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="Horizontal" />
            <p className={styles.sectionBody}>
              Drag the divider, or focus it and use the arrow keys. Hold{" "}
              <Kbd>Shift</Kbd> for bigger steps; <Kbd>Home</Kbd> and{" "}
              <Kbd>End</Kbd> jump to the limits.
            </p>
            <div className={styles.demoBox}>
              <SplitPane>
                <div className={styles.paneFill}>First pane</div>
                <div className={styles.paneFill}>Second pane</div>
              </SplitPane>
            </div>
          </section>

          <section className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Vertical" />
            <p className={styles.sectionBody}>
              The same component stacked. The separator reports its orientation
              and the arrow keys follow it: up and down instead of left and
              right.
            </p>
            <div className={styles.demoBox}>
              <SplitPane direction="vertical" defaultSplit={40}>
                <div className={styles.paneFill}>Output</div>
                <div className={styles.paneFill}>Console</div>
              </SplitPane>
            </div>
          </section>

          <section className={`${styles.section} animate-in animate-delay-4`}>
            <SectionTitle title="Bounded sidebar" />
            <p className={styles.sectionBody}>
              minSplit and maxSplit fence the drag, so a sidebar can be
              squeezed but never collapsed away. This one starts at a quarter
              and moves between 15 and 40 percent.
            </p>
            <div className={styles.demoBox}>
              <SplitPane defaultSplit={25} minSplit={15} maxSplit={40}>
                <div className={styles.paneList}>
                  <span>Overview</span>
                  <span>Members</span>
                  <span>Billing</span>
                  <span>Settings</span>
                </div>
                <div className={styles.paneFill}>Canvas</div>
              </SplitPane>
            </div>
          </section>

          <section className={`${styles.section} animate-in animate-delay-5`}>
            <SectionTitle title="Scrolling regions" />
            <p className={styles.sectionBody}>
              A region that should scroll brings its own focusable scroll
              container inside the pane, so keyboard users can reach it. The
              long list here scrolls against a fixed neighbour instead of
              stretching the layout.
            </p>
            <div className={styles.demoBox}>
              <SplitPane defaultSplit={40}>
                <div
                  className={`${styles.paneList} ${styles.paneScroll}`}
                  tabIndex={0}
                  role="region"
                  aria-label="List rows"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <span key={i}>List row {i + 1}</span>
                  ))}
                </div>
                <div className={styles.paneFill}>Detail</div>
              </SplitPane>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
