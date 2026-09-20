"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { AnchorNav } from "@robr0/design-system/components/AnchorNav/AnchorNav";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

const demoItems = [
  { id: "preview", label: "Preview" },
  { id: "installation", label: "Installation" },
  { id: "filtering", label: "Filtering" },
  { id: "notification-data", label: "Notification data and actions" },
];

const pageItems = [
  { id: "controlled", label: "Controlled" },
  { id: "floating", label: "Floating" },
  { id: "tracking", label: "Tracking this page" },
];

export default function AnchorNavPage() {
  const [demoActive, setDemoActive] = useState("preview");
  const [floatingActive, setFloatingActive] = useState("installation");

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Anchor nav</h1>
            <PageLinks storybookPath="/?path=/docs/components-anchornav--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              On this page, and where you are on it
            </p>
            <p className={styles.introBody}>
              A vertical list of anchor links for long pages. Left alone it watches the scroll position and marks the section under the reader; pass an active id and it becomes a controlled highlight. The current link carries the indicator bar and an aria-current of location. A floating variant collapses the list to a minimap of lines that expands on hover, so it can ride the page edge without taking column width.
            </p>
          </div>

          <section id="controlled" className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="Controlled" />
            <div className={styles.variantItem}>
              <AnchorNav
                items={demoItems}
                activeId={demoActive}
                onActiveChange={setDemoActive}
                onClick={(e) => e.preventDefault()}
              />
            </div>
          </section>

          <section id="floating" className={styles.section}>
            <SectionTitle title="Floating" />
            <p className={styles.introBody}>
              The floating variant collapses to one short line per section and
              costs the page no column width. Hover it, tab into it, or tap it
              and the full list expands as a panel; the longer, darker line is
              the current section.
            </p>
            <div className={styles.floatingDemo}>
              <div className={styles.floatingDemoHint}>
                Hover the lines on the right
              </div>
              <div className={styles.floatingDemoNav}>
                <AnchorNav
                  variant="floating"
                  items={demoItems}
                  activeId={floatingActive}
                  onActiveChange={setFloatingActive}
                  onClick={(e) => e.preventDefault()}
                />
              </div>
            </div>
          </section>

          <section id="tracking" className={styles.section}>
            <SectionTitle title="Tracking this page" />
            <p className={styles.introBody}>
              This one lists the two sections above and below, and follows along as you scroll.
            </p>
            <div className={styles.variantItem}>
              <AnchorNav items={pageItems} title="Contents" />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
