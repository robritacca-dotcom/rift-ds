"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { SplitButton } from "@robr0/design-system/components/SplitButton/SplitButton";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

/* ============================================
   SPLIT BUTTON STATES & VARIANTS
   Mirrors the Button page's grid presentation,
   scoped to the states a consumer can set —
   hover and active come from the segments' own
   pseudo-classes, so they show live.
   ============================================ */

const saveItems = [
  { label: "Save as draft", icon: "draft" },
  { label: "Save as template", icon: "dashboard_customize" },
  { type: "separator" as const },
  { label: "Discard changes", icon: "delete", destructive: true },
];

const states = [
  { label: "Disabled", props: { disabled: true } },
  { label: "Default", props: {} },
  { label: "Loading", props: { loading: true } },
] as const;

const variants = ["primary", "secondary", "neutral"] as const;

const sizes = [
  { label: "", value: "default" as const },
  { label: ", compact", value: "compact" as const },
];

const iconVariants = [
  { label: "No icon", iconLeft: undefined },
  { label: "Icon, left", iconLeft: "save" },
] as const;

const variantLabels: Record<string, string> = {
  primary: "Primary",
  secondary: "Secondary",
  neutral: "Neutral",
};

/* ============================================
   SPLIT BUTTON GRID — 3-column layout per variant
   col 1: state label
   cols 2–3: icon variants (no icon / left)
   One grid per variant × size combination, stacked vertically.
   ============================================ */

function SplitButtonGrid({
  variant,
  size,
  sizeLabel,
}: {
  variant: "primary" | "secondary" | "neutral";
  size: "default" | "compact";
  sizeLabel: string;
}) {
  return (
    <section className={styles.variantBlock}>
      <SectionTitle title={`${variantLabels[variant]}${sizeLabel}`} />

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
          <React.Fragment key={st.label}>
            <span className={styles.gridRowHeader}>{st.label}</span>
            {iconVariants.map((iv) => (
              <div key={`${st.label}-${iv.label}`} className={styles.gridCell}>
                <SplitButton
                  label={st.label === "Loading" ? "Saving" : "Save"}
                  variant={variant}
                  size={size}
                  iconLeft={iv.iconLeft}
                  items={saveItems}
                  {...st.props}
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

export default function SplitButtonPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Split button</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-splitbutton--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              One default action, with the alternatives attached
            </p>
            <p className={styles.introBody}>
              The label fires the primary action directly; the chevron opens a menu of variants. One pill silhouette, two segments, so the common case stays one click away while the rest stays discoverable. All three variants come in default and compact sizes; hover and press the segments to see their interactive states, and the loading rows keep full colour while blocking clicks.
            </p>
          </div>

          {/* Variant grids — one per variant × size, like the Button page */}
          {sizes.map((sz) =>
            variants.map((v) => (
              <SplitButtonGrid
                key={`${v}-${sz.value}`}
                variant={v}
                size={sz.value}
                sizeLabel={sz.label}
              />
            ))
          )}
        </main>
      </div>

    </>
  );
}
