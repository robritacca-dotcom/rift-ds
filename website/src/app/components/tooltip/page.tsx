"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Tooltip } from "@robr0/design-system/components/Tooltip/Tooltip";
import { Button } from "@robr0/design-system/components/Button/Button";
import { CircularButton } from "@robr0/design-system/components/CircularButton/CircularButton";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function TooltipPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Tooltip</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-tooltip--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Contextual labels on hover and focus
            </p>
            <p className={styles.introBody}>
              Tooltips provide brief, informative text when users hover over or focus on an element. The bubble rides the same floating surface as Popover, staying light in light mode and dark in dark, and supports four placement positions with a directional arrow. Pressing Escape dismisses a visible tooltip from anywhere on the page.
            </p>
          </div>

          {/* Positions */}
          <section className={styles.section}>
            <SectionTitle title="Positions" />
            <div className={styles.variantRow} style={{ gap: "40px", padding: "40px 0" }}>
              <Tooltip content="Tooltip on top" position="top">
                <Button label="Top" variant="secondary" />
              </Tooltip>
              <Tooltip content="Tooltip on bottom" position="bottom">
                <Button label="Bottom" variant="secondary" />
              </Tooltip>
              <Tooltip content="Tooltip on left" position="left">
                <Button label="Left" variant="secondary" />
              </Tooltip>
              <Tooltip content="Tooltip on right" position="right">
                <Button label="Right" variant="secondary" />
              </Tooltip>
            </div>
          </section>

          {/* On icon buttons */}
          <section className={styles.section}>
            <SectionTitle title="On icon buttons" />
            <div className={styles.variantRow} style={{ gap: "20px", padding: "20px 0" }}>
              <Tooltip content="Search" position="bottom">
                <CircularButton icon="search" ariaLabel="Search" variant="secondary" tooltip={false} />
              </Tooltip>
              <Tooltip content="Settings" position="bottom">
                <CircularButton icon="settings" ariaLabel="Settings" variant="secondary" tooltip={false} />
              </Tooltip>
              <Tooltip content="Notifications" position="bottom">
                <CircularButton icon="notifications" ariaLabel="Notifications" variant="secondary" tooltip={false} />
              </Tooltip>
              <Tooltip content="Profile" position="bottom">
                <CircularButton icon="person" ariaLabel="Profile" variant="secondary" tooltip={false} />
              </Tooltip>
            </div>
          </section>

          {/* Delays */}
          <section className={styles.section}>
            <SectionTitle title="Delay options" />
            <div className={styles.variantRow} style={{ gap: "20px", padding: "20px 0" }}>
              <Tooltip content="No delay" position="top" showDelay={0} hideDelay={0}>
                <Button label="Instant" variant="tertiary" />
              </Tooltip>
              <Tooltip content="Default delay (300ms)" position="top">
                <Button label="Default" variant="tertiary" />
              </Tooltip>
              <Tooltip content="Slow delay (800ms)" position="top" showDelay={800}>
                <Button label="Slow" variant="tertiary" />
              </Tooltip>
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
