"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Swatch } from "@robr0/design-system/components/Swatch/Swatch";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

const PALETTE: Array<[string, string]> = [
  ["#EF476F", "Red 07"],
  ["#EF8247", "Orange 07"],
  ["#FFD166", "Yellow 07"],
  ["#06D6A0", "Green 07"],
  ["#118AB2", "Teal 07"],
  ["#1E47B0", "Blue 07"],
  ["#9E47EF", "Purple 07"],
];

export default function SwatchPage() {
  const [picked, setPicked] = useState("#118AB2");

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Swatch</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-swatch--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The building block of colour choice
            </p>
            <p className={styles.introBody}>
              A clickable colour tile for preset palettes and picker triggers. The colour is
              plain data (pass any CSS colour as <code>value</code>), and the selected state
              draws a theme-aware ring. Purely presentational, so it renders from Server
              Components; interactivity is whatever <code>onClick</code> you give it.
            </p>
          </div>

          {/* Interactive palette */}
          <section className={styles.section}>
            <SectionTitle title="Palette" />
            <div style={{ display: "flex", gap: "var(--gap-sm)" }}>
              {PALETTE.map(([value, label]) => (
                <Swatch
                  key={value}
                  value={value}
                  label={label}
                  selected={picked === value}
                  onClick={() => setPicked(value)}
                />
              ))}
            </div>
          </section>

          {/* Shapes */}
          <section className={styles.section}>
            <SectionTitle title="Shapes" />
            <div style={{ display: "flex", gap: "var(--gap-sm)", alignItems: "center" }}>
              <Swatch value="#118AB2" label="Circle" />
              <Swatch value="#118AB2" label="Square" shape="square" />
            </div>
          </section>

          {/* Sizes */}
          <section className={styles.section}>
            <SectionTitle title="Sizes" />
            <div style={{ display: "flex", gap: "var(--gap-sm)", alignItems: "center" }}>
              <Swatch value="#9E47EF" label="Default" />
              <Swatch value="#9E47EF" label="Compact" size="compact" />
            </div>
          </section>

          {/* States */}
          <section className={styles.section}>
            <SectionTitle title="States" />
            <div style={{ display: "flex", gap: "var(--gap-sm)", alignItems: "center" }}>
              <Swatch value="#06D6A0" label="Default state" />
              <Swatch value="#06D6A0" label="Selected state" selected />
              <Swatch value="#06D6A0" label="Disabled state" disabled />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
