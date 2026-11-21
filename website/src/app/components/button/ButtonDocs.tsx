"use client";

import React from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { Button } from "rift-ds/components/Button/Button";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

/* ============================================
   BUTTON STATES & VARIANTS
   ============================================ */

/* `state` draws a static hover or active look for the docs; disabled is the
   real `disabled` prop, and the resting look takes neither. */
const states: { label: string; value: string; state?: "hover" | "active"; disabled?: boolean }[] = [
  { label: "Disabled", value: "disabled", disabled: true },
  { label: "Default", value: "default" },
  { label: "Hover", value: "hover", state: "hover" },
  { label: "Active", value: "active", state: "active" },
];

/* Every emphasis × tone cell the Button draws. Tertiary is already grey,
   so it has no separate neutral cell, and a tertiary destructive takes the
   outlined look. */
const variants = [
  { key: "primary", variant: "primary", tone: "default", label: "Primary" },
  { key: "secondary", variant: "secondary", tone: "default", label: "Secondary" },
  { key: "tertiary", variant: "tertiary", tone: "default", label: "Tertiary" },
  { key: "primary-neutral", variant: "primary", tone: "neutral", label: "Primary, neutral" },
  { key: "secondary-neutral", variant: "secondary", tone: "neutral", label: "Secondary, neutral" },
  { key: "primary-destructive", variant: "primary", tone: "destructive", label: "Primary, destructive" },
  { key: "destructive", variant: "secondary", tone: "destructive", label: "Secondary, destructive" },
] as const;

type ButtonCell = (typeof variants)[number];

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

/* ============================================
   BUTTON GRID — 5-column layout per variant
   col 1: state label
   cols 2–5: icon variants (no icon / left / right / both)
   One grid per variant × size combination, stacked vertically.
   ============================================ */

function ButtonGrid({
  cell,
  size,
}: {
  cell: ButtonCell;
  size: "default" | "compact";
}) {
  const heading = `${cell.label}${size === "compact" ? ", compact" : ""}`;

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
                  variant={cell.variant}
                  tone={cell.tone}
                  state={st.state}
                  disabled={st.disabled}
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
   ARTICLE
   ============================================ */

/**
 * The Button page's article, everything inside the page's main region: the
 * breadcrumb, the title, the sections and the install strip. The page wraps
 * it in the site's frame; /labs/site-frame wraps the same article in the
 * library's SiteLayout, to test that frame on a real page.
 */
export default function ButtonDocs() {
  return (
    <>
      <PageBreadcrumb />
      {/* Page Title */}
      <div className={`${styles.pageHeader} animate-in`}>
        <h1 className={styles.pageTitle}>Button</h1>
        <PageLinks
          storybookPath="/?path=/docs/components-button--docs"
        />
      </div>

      {/* Intro */}
      <div className={`${styles.introSection} animate-in animate-delay-1`}>
        <p className={styles.subDisplay}>
          The main action element
        </p>
        <p className={styles.introBody}>
          Two props set a button&apos;s look. <code>variant</code> is the emphasis: primary buttons are solid-filled for the highest-emphasis actions, secondary buttons have a border and fill on hover, and tertiary buttons are transparent and blend into the surface for lower-priority options. <code>tone</code> is the colour: the default carries the action colour, neutral moves the same shape into quiet grey for actions that deserve a button&apos;s full shape without the accent, and destructive signals dangerous or irreversible actions like delete and remove. Every combination comes in default and compact sizes.
        </p>
      </div>

      {/* Variant grids — one per variant × size */}
      {sizes.map((sz) =>
        variants.map((cell) => (
          <ButtonGrid key={`${cell.key}-${sz.value}`} cell={cell} size={sz.value} />
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
          {variants.map((cell) => (
            <span key={cell.key} className={styles.gridColHeader}>
              {cell.label}
            </span>
          ))}
          {sizes.map((sz) => (
            <React.Fragment key={sz.value}>
              <span className={styles.gridRowHeader}>{sz.label}</span>
              {variants.map((cell) => (
                <div key={`${sz.value}-${cell.key}`} className={styles.gridCell}>
                  <Button
                    label="Saving…"
                    variant={cell.variant}
                    tone={cell.tone}
                    size={sz.value}
                    loading
                  />
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Glass: every cell over a busy ground */}
      <section className={styles.variantBlock}>
        <SectionTitle title="Glass" />
        <p className={styles.introBody}>
          Set <code>glass</code> when a button sits on a busy ground, such
          as a shader scene or a photo. The ground behind it is blurred,
          an outlined or ghost button takes the glass fill at rest, and a
          filled one lets a little of the ground through its colour.
          Hover and press are each variant’s own.
        </p>
        <div className={styles.glassGround}>
          {variants.map((cell) => (
            <Button
              key={cell.key}
              label={cell.label}
              variant={cell.variant}
              tone={cell.tone}
              glass
            />
          ))}
        </div>
      </section>
    </>
  );
}
