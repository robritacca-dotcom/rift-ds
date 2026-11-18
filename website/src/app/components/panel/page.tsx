"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Panel } from "rift-ds/components/Panel/Panel";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

export default function PanelPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Panel</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-panel--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The plain dashboard surface
            </p>
            <p className={styles.introBody}>
              A rounded container on the primary container background with no shadow, and no border unless it needs an edge. Where Card carries a title and its own look, Panel is just the surface: content stacks vertically with a medium gap, and the padding steps down or disappears when a region needs it.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.demoSurface}>
              <Panel>
                <h3 className={styles.panelHeading}>Fleet overview</h3>
                <p className={styles.panelBody}>
                  Twelve harvesters are active across three orchards, with two idle and one flagged for maintenance.
                </p>
              </Panel>
            </div>
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <div className={styles.demoSurface}>
              <div className={styles.panelRow}>
                <Panel padding="compact">
                  <h3 className={styles.panelHeading}>Queue depth</h3>
                  <p className={styles.panelBody}>
                    Fourteen jobs waiting, oldest queued two minutes ago.
                  </p>
                </Panel>
                <Panel padding="compact">
                  <h3 className={styles.panelHeading}>Error rate</h3>
                  <p className={styles.panelBody}>
                    Holding at 0.2 percent over the last hour.
                  </p>
                </Panel>
              </div>
            </div>
          </section>

          {/* Bordered */}
          <section className={styles.section}>
            <SectionTitle title="Bordered" />
            <div className={styles.demoSurface}>
              <div className={styles.panelRow}>
                <Panel bordered padding="compact">
                  <h3 className={styles.panelHeading}>Active members</h3>
                  <p className={styles.panelBody}>
                    The edge a Widget tile wears, for a theme whose page matches the panel.
                  </p>
                </Panel>
                <Panel bordered padding="compact">
                  <h3 className={styles.panelHeading}>Open issues</h3>
                  <p className={styles.panelBody}>
                    Side by side with bordered tiles, every card keeps a visible edge.
                  </p>
                </Panel>
              </div>
            </div>
          </section>

          {/* Flush */}
          <section className={styles.section}>
            <SectionTitle title="Flush" />
            <div className={styles.demoSurface}>
              <Panel padding="none">
                <div className={styles.flushHeader}>
                  <h3 className={styles.panelHeading}>Signal strength</h3>
                </div>
                <p className={`${styles.panelBody} ${styles.flushBody}`}>
                  With padding removed, edge-to-edge content like this tinted header strip can reach the rounded corners. Interior sections bring their own spacing.
                </p>
              </Panel>
            </div>
          </section>

          <ComponentInstallStrip slug="panel" />
        </main>
      </div>

    </>
  );
}
