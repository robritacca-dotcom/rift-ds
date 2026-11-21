"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";
import { BackToTop } from "rift-ds/components/BackToTop/BackToTop";

export default function BackToTopPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Back to top</h1>
            <PageLinks storybookPath="/?path=/docs/components-backtotop--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>A way back up a long page</p>
            <p className={styles.introBody}>
              A round button that appears in the bottom corner once the reader has scrolled a long way, and takes them back to the top. The jump is smooth unless the reader asks for reduced motion, and while it is hidden it is never a tab stop.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="On this page" />
            <p className={styles.demoText}>
              Scroll down this page and the button appears in the bottom corner.
              Set <code>focusTarget</code> to the main region&apos;s id so a keyboard
              reader continues from the top too.
            </p>
            <BackToTop threshold={480} focusTarget="main-content" />
          </section>

          <ComponentInstallStrip slug="back-to-top" />
        </main>
      </div>
    </>
  );
}
