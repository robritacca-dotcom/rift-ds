"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Button } from "@robr0/design-system/components/Button/Button";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
/* ============================================
   BUTTON STATES & VARIANTS
   ============================================ */

const states = [
  { label: "Disabled", value: "disabled" as const },
  { label: "Default", value: "default" as const },
  { label: "Hover", value: "hover" as const },
  { label: "Active", value: "active" as const },
];

const variants = ["primary", "secondary", "tertiary", "neutral", "destructive"] as const;

const sizes = [
  { label: "Default", value: "default" as const },
  { label: "Compact", value: "compact" as const },
];

const iconVariants = [
  { label: "No icon", iconLeft: undefined, iconRight: undefined },
  { label: "Icon, left", iconLeft: "grid_view", iconRight: undefined },
  { label: "Icon, right", iconLeft: undefined, iconRight: "arrow_forward" },
  { label: "Both icons", iconLeft: "grid_view", iconRight: "arrow_forward" },
] as const;

const variantLabels: Record<string, string> = {
  primary: "Primary",
  secondary: "Secondary",
  tertiary: "Tertiary",
  neutral: "Neutral",
  destructive: "Destructive",
};

/* ============================================
   BUTTON GRID — 5-column layout per variant
   col 1: state label
   cols 2–5: icon variants (no icon / left / right / both)
   One grid per variant × size combination, stacked vertically.
   ============================================ */

function ButtonGrid({
  variant,
  size,
}: {
  variant: "primary" | "secondary" | "tertiary" | "neutral" | "destructive";
  size: "default" | "compact";
}) {
  const heading = `${variantLabels[variant]}${size === "compact" ? ", compact" : ""}`;

  return (
    <section className={styles.variantBlock}>
      <SectionTitle title={heading} />

      <div className={styles.buttonGrid}>
        {/* Column headers */}
        <div className={styles.gridCorner} />
        {iconVariants.map((iv) => (
          <span key={iv.label} className={styles.gridColHeader}>
            {iv.label}
          </span>
        ))}

        {/* State rows */}
        {states.map((st) => (
          <React.Fragment key={st.value}>
            <span className={styles.gridRowHeader}>{st.label}</span>
            {iconVariants.map((iv) => (
              <div key={`${st.value}-${iv.label}`} className={styles.gridCell}>
                <Button
                  label="Button"
                  variant={variant}
                  state={st.value}
                  size={size}
                  iconLeft={iv.iconLeft}
                  iconRight={iv.iconRight}
                />
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

/* ============================================
   PAGE
   ============================================ */


export default function ButtonPage() {
  return (
    <>

      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          {/* Page Title */}
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Button</h1>
            <PageLinks
              figmaUrl="https://www.figma.com/design/8NzqDS8iRsBTFPbNGj3Woj/robr0-ds26?node-id=113-5392"
              storybookPath="/?path=/docs/components-button--docs"
            />
          </div>

          {/* Intro */}
          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The main action element
            </p>
            <p className={styles.introBody}>
              Primary buttons are solid-filled for the highest-emphasis actions. Secondary buttons have a border and fill on hover. Tertiary buttons are transparent and blend into the surface for lower-priority options. Neutral buttons keep the solid fill in quiet grey, for actions that deserve a button&apos;s full shape without the accent colour. Destructive buttons signal dangerous or irreversible actions like delete and remove. All variants come in default and compact sizes.
            </p>
          </div>

          {/* Variant grids — one per variant × size */}
          {sizes.map((sz) =>
            variants.map((p) => (
              <ButtonGrid key={`${p}-${sz.value}`} variant={p} size={sz.value} />
            ))
          )}

          {/* Loading state — spinner takes the left icon slot, interaction is blocked */}
          <section className={styles.variantBlock}>
            <SectionTitle title="Loading" />
            <p className={styles.introBody}>
              Set <code>loading</code> while an async action runs. The spinner
              takes the left icon slot in the variant’s own colour, the
              label stays put, and clicks are blocked, without the dimmed
              look of <code>disabled</code>.
            </p>
            <div className={`${styles.buttonGrid} ${styles.loadingGrid}`}>
              <div className={styles.gridCorner} />
              {variants.map((p) => (
                <span key={p} className={styles.gridColHeader}>
                  {variantLabels[p]}
                </span>
              ))}
              {sizes.map((sz) => (
                <React.Fragment key={sz.value}>
                  <span className={styles.gridRowHeader}>{sz.label}</span>
                  {variants.map((p) => (
                    <div key={`${sz.value}-${p}`} className={styles.gridCell}>
                      <Button
                        label="Saving…"
                        variant={p}
                        size={sz.value}
                        loading
                      />
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
