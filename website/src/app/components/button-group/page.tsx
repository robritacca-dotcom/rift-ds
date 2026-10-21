"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { ButtonGroup } from "rift-ds/components/ButtonGroup/ButtonGroup";
import type { ButtonProps } from "rift-ds/components/Button/Button";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import { FIGMA_FILE_URL } from "@/config/brand.generated";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";
/* ============================================
   DEMO DATA
   ============================================ */

const horizontalDefault: ButtonProps[] = [
  { label: "Home", variant: "tertiary" },
  { label: "About", variant: "tertiary" },
  { label: "Components", variant: "tertiary", state: "active" },
  { label: "Foundations", variant: "tertiary" },
];

const horizontalWithIcons: ButtonProps[] = [
  { label: "Home", variant: "tertiary", iconLeft: "home" },
  { label: "Settings", variant: "tertiary", iconLeft: "settings" },
  { label: "Profile", variant: "tertiary", state: "active", iconLeft: "person" },
];

const verticalDefault: ButtonProps[] = [
  { label: "Overview", variant: "tertiary", state: "active" },
  { label: "Button", variant: "tertiary" },
  { label: "Button group", variant: "tertiary" },
  { label: "Card", variant: "tertiary" },
  { label: "Navigation", variant: "tertiary" },
  { label: "Toggle switch", variant: "tertiary" },
];

const verticalWithIcons: ButtonProps[] = [
  { label: "Dashboard", variant: "tertiary", iconLeft: "dashboard" },
  { label: "Analytics", variant: "tertiary", state: "active", iconLeft: "bar_chart" },
  { label: "Settings", variant: "tertiary", iconLeft: "settings" },
  { label: "Help", variant: "tertiary", iconLeft: "help" },
];

const primaryGroup: ButtonProps[] = [
  { label: "Cancel", variant: "tertiary" },
  { label: "Save", variant: "secondary", iconRight: "arrow_forward" },
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
              figmaUrl={`${FIGMA_FILE_URL}?node-id=256-12612`}
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

          <ComponentInstallStrip slug="button-group" />
        </main>
      </div>

    </>
  );
}
