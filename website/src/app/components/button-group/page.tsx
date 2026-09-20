"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { ButtonGroup } from "@robr0/design-system/components/ButtonGroup/ButtonGroup";
import type { ButtonProps } from "@robr0/design-system/components/Button/Button";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
/* ============================================
   DEMO DATA
   ============================================ */

const horizontalDefault: ButtonProps[] = [
  { label: "Home", variant: "tertiary", state: "default" },
  { label: "About", variant: "tertiary", state: "default" },
  { label: "Components", variant: "tertiary", state: "active" },
  { label: "Foundations", variant: "tertiary", state: "default" },
];

const horizontalWithIcons: ButtonProps[] = [
  { label: "Home", variant: "tertiary", state: "default", iconLeft: "home" },
  { label: "Settings", variant: "tertiary", state: "default", iconLeft: "settings" },
  { label: "Profile", variant: "tertiary", state: "active", iconLeft: "person" },
];

const verticalDefault: ButtonProps[] = [
  { label: "Overview", variant: "tertiary", state: "active" },
  { label: "Button", variant: "tertiary", state: "default" },
  { label: "Button group", variant: "tertiary", state: "default" },
  { label: "Card", variant: "tertiary", state: "default" },
  { label: "Navigation", variant: "tertiary", state: "default" },
  { label: "Toggle switch", variant: "tertiary", state: "default" },
];

const verticalWithIcons: ButtonProps[] = [
  { label: "Dashboard", variant: "tertiary", state: "default", iconLeft: "dashboard" },
  { label: "Analytics", variant: "tertiary", state: "active", iconLeft: "bar_chart" },
  { label: "Settings", variant: "tertiary", state: "default", iconLeft: "settings" },
  { label: "Help", variant: "tertiary", state: "default", iconLeft: "help" },
];

const primaryGroup: ButtonProps[] = [
  { label: "Cancel", variant: "tertiary", state: "default" },
  { label: "Save", variant: "secondary", state: "default", iconRight: "arrow_forward" },
];

/* ============================================
   PAGE
   ============================================ */


export default function ButtonGroupPage() {
  return (
    <>

      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          {/* Page Title */}
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Button group</h1>
            <PageLinks
              figmaUrl="https://www.figma.com/design/8NzqDS8iRsBTFPbNGj3Woj/robr0-ds26?node-id=256-12612"
              storybookPath="/?path=/docs/components-buttongroup--docs"
            />
          </div>

          {/* Intro */}
          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Groups related buttons in a row or column
            </p>
            <p className={styles.introBody}>
              Used for nav menus, toolbars, and action sets where buttons need consistent spacing and alignment without wiring it up manually each time.
            </p>
          </div>

          {/* Horizontal */}
          <section className={styles.section}>
            <SectionTitle title="Horizontal" />
            <div className={styles.showcase}>
              <span className={styles.showcaseLabel}>Default</span>
              <div className={styles.previewBox}>
                <ButtonGroup orientation="horizontal" buttons={horizontalDefault} />
              </div>

              <span className={styles.showcaseLabel}>With icons</span>
              <div className={styles.previewBox}>
                <ButtonGroup orientation="horizontal" buttons={horizontalWithIcons} />
              </div>

              <span className={styles.showcaseLabel}>Mixed priorities</span>
              <div className={styles.previewBox}>
                <ButtonGroup orientation="horizontal" buttons={primaryGroup} />
              </div>
            </div>
          </section>

          {/* Vertical */}
          <section className={styles.section}>
            <SectionTitle title="Vertical" />
            <div className={styles.showcase}>
              <span className={styles.showcaseLabel}>Default</span>
              <div className={styles.previewBox}>
                <ButtonGroup orientation="vertical" buttons={verticalDefault} />
              </div>

              <span className={styles.showcaseLabel}>With icons</span>
              <div className={styles.previewBox}>
                <ButtonGroup orientation="vertical" buttons={verticalWithIcons} />
              </div>
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
