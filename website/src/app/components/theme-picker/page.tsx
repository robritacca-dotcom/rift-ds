"use client";

import React, { useState, useSyncExternalStore } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { ThemePicker } from "rift-ds/components/ThemePicker/ThemePicker";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";
import { themeSelectorTiles } from "@/lib/theme/presets";
import { useSiteTheme } from "@/lib/theme/use-theme-overrides";
import { applyBrand, readBrand, SERVED_THEME_ID, subscribeBrand } from "@/lib/theme/brand";

/* Fictional themes for the quiet demo, so choosing one changes nothing else. */
const DEMO_THEMES = [
  { value: "harbour", label: "Harbour", color: "#0E6E8F", description: "One face throughout" },
  { value: "orchard", label: "Orchard", color: "#2F6B3F", swatchRadius: "4px", description: "Serif headings, sans body", headingFont: "Georgia, serif" },
  { value: "ember", label: "Ember", color: "#C2410C", description: "Rounded and bright" },
];

export default function ThemePickerPage() {
  const theme = useSiteTheme();
  const brand = useSyncExternalStore(subscribeBrand, readBrand, () => SERVED_THEME_ID);
  const tiles = themeSelectorTiles(theme === "dark" ? "dark" : "light");
  const [demo, setDemo] = useState("harbour");

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Theme picker</h1>
            <PageLinks storybookPath="/?path=/docs/components-themepicker--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>Every look on offer, one click away</p>
            <p className={styles.introBody}>
              A circular trigger, the row height across, wearing the active
              theme&rsquo;s swatch, and a menu of every theme on offer. Each row
              previews the theme&rsquo;s colour, corner and faces. The host
              supplies the themes and applies the choice, so it works for the
              shipped presets or a product&rsquo;s own. It is the theme switcher
              in this site&rsquo;s header.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="The shipped themes" />
            <p className={styles.demoText}>
              Live: these are the presets this package ships, and choosing one
              rethemes the page through its data-brand attribute.
            </p>
            <div className={styles.row}>
              <ThemePicker themes={tiles} value={brand} onValueChange={applyBrand} align="start" />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Sizes" />
            <p className={styles.demoText}>
              Two sizes on the row-control scale, then disabled, where the
              trigger takes no press. These pick between three made-up themes
              and change nothing else.
            </p>
            <div className={styles.row}>
              <ThemePicker themes={DEMO_THEMES} value={demo} onValueChange={setDemo} align="start" />
              <ThemePicker themes={DEMO_THEMES} value={demo} onValueChange={setDemo} size="compact" align="start" />
              <ThemePicker themes={DEMO_THEMES} value={demo} disabled align="start" />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Placement and the footer" />
            <p className={styles.demoText}>
              The menu prefers the placement side, flips when that side has no
              room, and lines up with the trigger&rsquo;s start or end edge. A
              footer sits after the themes, below a divider: this site&rsquo;s
              header puts a link to the playground there, where a visitor
              builds a theme of their own.
            </p>
          </section>

          <ComponentInstallStrip slug="theme-picker" />
        </main>
      </div>
    </>
  );
}
