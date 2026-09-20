"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { HoverCard } from "@robr0/design-system/components/HoverCard/HoverCard";
import { Avatar } from "@robr0/design-system/components/Avatar/Avatar";
import { Button } from "@robr0/design-system/components/Button/Button";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

const profileContent = (
  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <Avatar size="sm" name="Jane Doe" />
      <div>
        <div style={{ fontWeight: 600 }}>Jane Doe</div>
        <div style={{ color: "var(--color-text-tertiary)" }}>Product designer</div>
      </div>
    </div>
    <p style={{ margin: 0 }}>Designs the flows, then argues with the copy until it fits.</p>
  </div>
);

// Phrasing-level markup only: this card sits inside a <p> in the running-text
// example, where any block element would end the paragraph mid-parse.
const packageContent = (
  <span style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
    <span style={{ fontWeight: 600 }}>@robr0/design-system</span>
    <span>
      React component library with semantic tokens, light and dark themes, and a chat set.
    </span>
  </span>
);

export default function HoverCardPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Hover card</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-hovercard--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              A preview of the destination
            </p>
            <p className={styles.introBody}>
              Where a tooltip names a control, a hover card previews what is behind a link: a profile behind a username, a summary behind a reference. The panel is interactive and stays open while the pointer is inside it. It opens on focus too, so keyboard users get the same preview.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.variantRow}>
              <HoverCard content={profileContent}>
                <Button variant="tertiary" label="@janedoe" />
              </HoverCard>
            </div>
          </section>

          {/* Positions */}
          <section className={styles.section}>
            <SectionTitle title="Positions" />
            <div className={styles.variantRow}>
              <HoverCard content={packageContent} position="top">
                <Button variant="secondary" label="Top" />
              </HoverCard>
              <HoverCard content={packageContent} position="bottom">
                <Button variant="secondary" label="Bottom" />
              </HoverCard>
              <HoverCard content={packageContent} position="right">
                <Button variant="secondary" label="Right" />
              </HoverCard>
            </div>
          </section>

          {/* In running text */}
          <section className={styles.section}>
            <SectionTitle title="In running text" />
            <p className={styles.introBody} style={{ maxWidth: "480px" }}>
              The component library ships to npm as{" "}
              <HoverCard content={packageContent}>
                <a href="/docs/get-started" style={{ color: "var(--color-action-primary-text-tertiary)" }}>
                  @robr0/design-system
                </a>
              </HoverCard>{" "}
              and the website consumes it like any other package.
            </p>
          </section>

          {/* No delay */}
          <section className={styles.section}>
            <SectionTitle title="No delay" />
            <div className={styles.variantRow}>
              <HoverCard content={packageContent} showDelay={0}>
                <Button variant="secondary" label="Opens immediately" />
              </HoverCard>
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
