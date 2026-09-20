"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Button } from "@robr0/design-system/components/Button/Button";
import { Popover } from "@robr0/design-system/components/Popover/Popover";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function PopoverPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Popover</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-popover--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              A small panel next to a trigger element
            </p>
            <p className={styles.introBody}>
              Positioned above, below, left, or right. Can open on click or on hover for tooltip-like behaviour. Closes on outside click or pressing escape.
            </p>
          </div>

          {/* Click trigger */}
          <section className={styles.section}>
            <SectionTitle title="Click trigger" />
            <div className={styles.variantRow}>
              <Popover
                trigger="click"
                position="bottom"
                content={
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, marginBottom: "4px" }}>Popover title</p>
                    <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>Content appears on click.</p>
                  </div>
                }
              >
                <Button label="Click me" variant="secondary" size="compact" />
              </Popover>
            </div>
          </section>

          {/* Hover trigger */}
          <section className={styles.section}>
            <SectionTitle title="Hover trigger" />
            <div className={styles.variantRow}>
              <Popover
                trigger="hover"
                position="bottom"
                content={<p style={{ margin: 0 }}>Tooltip-style popover on hover.</p>}
              >
                <Button label="Hover me" variant="tertiary" size="compact" />
              </Popover>
            </div>
          </section>

          {/* Positions */}
          <section className={styles.section}>
            <SectionTitle title="Positions" />
            <div className={styles.variantRow} style={{ gap: "80px", padding: "60px 0" }}>
              <Popover trigger="click" position="bottom" open content={<p style={{ margin: 0 }}>Bottom</p>}>
                <Button label="Bottom" variant="tertiary" size="compact" />
              </Popover>
              <Popover trigger="click" position="top" open content={<p style={{ margin: 0 }}>Top</p>}>
                <Button label="Top" variant="tertiary" size="compact" />
              </Popover>
              <Popover trigger="click" position="right" open content={<p style={{ margin: 0 }}>Right</p>}>
                <Button label="Right" variant="tertiary" size="compact" />
              </Popover>
            </div>
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <div className={styles.variantRow}>
              <Popover
                trigger="click"
                position="bottom"
                size="compact"
                content={<p style={{ margin: 0, fontSize: "14px" }}>Compact popover content.</p>}
              >
                <Button label="Compact" variant="secondary" size="compact" />
              </Popover>
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
