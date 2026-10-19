"use client";

/**
 * The home page's before-and-after: the payroll console template beside the
 * same screen as a coding agent writes it with no design system to read.
 * Both halves carry the same content, so the only difference a visitor can
 * drag across is everything the system decides.
 *
 * The four images are screenshots, re-shot by hand with
 * scripts/capture-compare-shots.mjs (the vibecoded page lives beside it and
 * is never shipped). A screenshot cannot follow the theme, so there is one
 * pair per mode: both comparisons render and CSS shows the one matching
 * data-theme, sharing one divider position so a theme switch never jumps.
 */

import { useState } from "react";
import { Button } from "rift-ds/components/Button/Button";
import { ImageCompare } from "rift-ds/components/ImageCompare/ImageCompare";
import styles from "./HomeCompare.module.css";

const SHOTS = "/images/compare";
const BEFORE_ALT =
  "A payroll console written without a design system: emoji icons, gradient buttons, a coloured stripe on every card and a purple chat header.";
const AFTER_ALT =
  "The same payroll console built from Rift: quiet icons, one action colour, stat cards, a stepper, the run table and the docked chat.";

export default function HomeCompare() {
  const [position, setPosition] = useState(50);

  return (
    <section className={styles.section} aria-labelledby="home-compare-title">
      <h2 id="home-compare-title" className={styles.statement}>
        One screen, built twice.{" "}
        <span>
          The same payroll run, once as a coding agent writes it from scratch
          and once from the system. Same data, same chat questions. Drag to
          see what nobody thinks to prompt for.
        </span>
      </h2>

      {(["light", "dark"] as const).map((mode) => (
        <ImageCompare
          key={mode}
          className={`${styles.frame} ${styles[mode]}`}
          beforeSrc={`${SHOTS}/vibecoded-${mode}.webp`}
          afterSrc={`${SHOTS}/rift-${mode}.webp`}
          beforeAlt={BEFORE_ALT}
          afterAlt={AFTER_ALT}
          beforeLabel="Vibecoded"
          afterLabel="With Rift"
          aspectRatio="16 / 10"
          position={position}
          onPositionChange={setPosition}
        />
      ))}

      <Button
        variant="secondary"
        tone="neutral"
        href="/templates/payroll-console"
        iconRight="arrow_forward"
        label="Open the payroll console"
      />
    </section>
  );
}
