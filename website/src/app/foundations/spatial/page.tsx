"use client";

import { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { SpacingSwatch } from "@robr0/design-system/components/SpacingSwatch/SpacingSwatch";
import type { SpacingSwatchVariant } from "@robr0/design-system/components/SpacingSwatch/SpacingSwatch";
import PageLinks from "../../../components/PageLinks/PageLinks";
import { getSidebarLinks, foundationsSidebarLinks } from "@/config/navigation";
import styles from "./page.module.css";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import { Tabs } from "@robr0/design-system/components/Tabs/Tabs";

const { sidebarLinks } = getSidebarLinks(foundationsSidebarLinks, "/foundations/spatial");

/* ============================================
   SPACING DATA
   Organised by section: Border, Radius, Gap, Padding.
   Each entry maps to a primitive token.
   ============================================ */

interface SpacingToken {
  label: string;
  value: string;
  px: number;
  variant: SpacingSwatchVariant;
  /** Values the token resolves to below 768px — section-rhythm tokens only */
  mobileValue?: string;
  mobilePx?: number;
}

const borderTokens: SpacingToken[] = [
  { label: "XS", value: "1px", px: 1, variant: "border" },
  { label: "MD", value: "2px", px: 2, variant: "border" },
];

const radiusTokens: SpacingToken[] = [
  { label: "XXS", value: "2px", px: 2, variant: "radius" },
  { label: "XS", value: "4px", px: 4, variant: "radius" },
  { label: "SM", value: "8px", px: 8, variant: "radius" },
  { label: "MD", value: "12px", px: 12, variant: "radius" },
  { label: "LG", value: "16px", px: 16, variant: "radius" },
  { label: "XL", value: "24px", px: 24, variant: "radius" },
  { label: "Composer", value: "29px", px: 29, variant: "radius" },
  { label: "XXL", value: "48px", px: 48, variant: "radius" },
  { label: "Full", value: "999px", px: 999, variant: "radius" },
];

const gapTokens: SpacingToken[] = [
  { label: "XXS", value: "2px", px: 2, variant: "gap" },
  { label: "XS", value: "4px", px: 4, variant: "gap" },
  { label: "SM", value: "8px", px: 8, variant: "gap" },
  { label: "SM-MD", value: "12px", px: 12, variant: "gap" },
  { label: "MD", value: "16px", px: 16, variant: "gap" },
  { label: "LG", value: "20px", px: 20, variant: "gap" },
  { label: "XL", value: "40px", px: 40, variant: "gap" },
  { label: "XXL", value: "60px", px: 60, variant: "gap", mobileValue: "40px", mobilePx: 40 },
  { label: "XXXL", value: "80px", px: 80, variant: "gap", mobileValue: "60px", mobilePx: 60 },
  { label: "XXXXL", value: "120px", px: 120, variant: "gap", mobileValue: "80px", mobilePx: 80 },
];

const paddingTokens: SpacingToken[] = [
  { label: "XXXS", value: "2px", px: 2, variant: "padding" },
  { label: "XXS", value: "4px", px: 4, variant: "padding" },
  { label: "XS", value: "6px", px: 6, variant: "padding" },
  { label: "SM", value: "8px", px: 8, variant: "padding" },
  { label: "SM-MD", value: "12px", px: 12, variant: "padding" },
  { label: "MD", value: "16px", px: 16, variant: "padding" },
  { label: "LG", value: "20px", px: 20, variant: "padding" },
  { label: "XL", value: "40px", px: 40, variant: "padding" },
  { label: "XXL", value: "60px", px: 60, variant: "padding", mobileValue: "40px", mobilePx: 40 },
];

const spacingSections = [
  { title: "Border", tokens: borderTokens },
  { title: "Radius", tokens: radiusTokens },
  { title: "Gap", tokens: gapTokens },
  { title: "Padding", tokens: paddingTokens },
];

/* ============================================
   PAGE
   ============================================ */

const viewportTabs = [
  { value: "desktop", label: "Desktop", icon: "desktop_windows" },
  { value: "mobile", label: "Mobile", icon: "smartphone" },
];

export default function SemanticSpacingPage() {
  const [viewport, setViewport] = useState("desktop");
  const isMobileView = viewport === "mobile";

  return (
    <>

      <MegaNav />

      <div className={styles.dsLayout}>
        <Sidebar links={sidebarLinks} />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          {/* Page Title */}
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Semantic spacing</h1>
            <PageLinks
              figmaUrl="https://www.figma.com/design/8NzqDS8iRsBTFPbNGj3Woj/robr0-ds26?node-id=113-5648"
              storybookPath="/?path=/docs/foundations-tokens--docs"
            />
          </div>

          {/* Intro */}
          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Border, radius, gap, and padding tokens from Figma variables
            </p>
            <p className={styles.introBody}>
              Border controls stroke thickness. Radius sets corner rounding, from subtle (2px) to full pill shapes. Gap is the space between sibling elements like buttons in a group or items in a list. Padding is the breathing room inside a container, like the space between a card edge and its content.
            </p>
          </div>

          {/* Viewport toggle — section-rhythm tokens (gap XXL–XXXXL,
              padding XXL) step one notch down below 768px. */}
          <div className={`${styles.viewportToggle} animate-in animate-delay-2`}>
            <Tabs
              tabs={viewportTabs}
              activeTab={viewport}
              onTabChange={setViewport}
              ariaLabel="Token values by viewport"
            />
            <p className={styles.viewportNote}>
              {isMobileView
                ? "Below 768px the section-rhythm steps (gap XXL–XXXXL, padding XXL) compress one notch. Everything else holds."
                : "Above 768px every step renders at its full size."}
            </p>
          </div>

          {/* Sections */}
          {spacingSections.map((section, idx) => (
            <section
              key={section.title}
              className={`${styles.spacingGroup}${idx < 2 ? " animate-in animate-delay-2" : ""}`}
            >
              <SectionTitle title={section.title} />
              <div className={styles.spacingGrid}>
                {section.tokens.map((t) => (
                  <SpacingSwatch
                    key={`${section.title}-${t.label}`}
                    label={t.label}
                    value={isMobileView && t.mobileValue ? t.mobileValue : t.value}
                    px={isMobileView && t.mobilePx ? t.mobilePx : t.px}
                    variant={t.variant}
                  />
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>

    </>
  );
}
