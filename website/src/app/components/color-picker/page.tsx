"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { ColorPicker } from "@robr0/design-system/components/ColorPicker/ColorPicker";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function ColorPickerPage() {
  const [controlled, setControlled] = useState("#EF476F");

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Colour picker</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-colorpicker--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Any colour, one control
            </p>
            <p className={styles.introBody}>
              A swatch trigger that opens a panel with a saturation and brightness area, a hue
              slider, an optional alpha slider, and a hex field. Emits uppercase hex live while
              dragging, works controlled or uncontrolled, and the saturation area is fully
              keyboard-operable with the arrow keys.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.variantStack}>
              <ColorPicker defaultValue="#118AB2" aria-label="Default colour picker" />
            </div>
          </section>

          {/* With text */}
          <section className={styles.section}>
            <SectionTitle title="With hex text" />
            <div className={styles.variantStack}>
              <ColorPicker defaultValue="#118AB2" showText aria-label="Colour picker with text" />
            </div>
          </section>

          {/* With label */}
          <section className={styles.section}>
            <SectionTitle title="With label and helper" />
            <div className={styles.variantStack}>
              <ColorPicker
                label="Brand colour"
                helperText="Drives the whole action ramp."
                defaultValue="#118AB2"
                showText
              />
            </div>
          </section>

          {/* Alpha */}
          <section className={styles.section}>
            <SectionTitle title="Alpha" />
            <div className={styles.variantStack}>
              <ColorPicker
                defaultValue="#9E47EFCC"
                showText
                showAlpha
                aria-label="Colour picker with alpha"
              />
            </div>
          </section>

          {/* Controlled */}
          <section className={styles.section}>
            <SectionTitle title="Controlled" />
            <div style={{ display: "flex", alignItems: "center", gap: "var(--gap-sm-md)" }}>
              <ColorPicker
                value={controlled}
                onValueChange={setControlled}
                showText
                aria-label="Controlled colour picker"
              />
              <code>{controlled}</code>
            </div>
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <div className={styles.variantStack}>
              <ColorPicker
                defaultValue="#06D6A0"
                size="compact"
                showText
                aria-label="Compact colour picker"
              />
            </div>
          </section>

          {/* States */}
          <section className={styles.section}>
            <SectionTitle title="States" />
            <div className={styles.variantStack}>
              <ColorPicker
                defaultValue="#118AB2"
                showText
                disabled
                aria-label="Disabled colour picker"
              />
              <ColorPicker
                label="Accent colour"
                error
                helperText="This colour fails the contrast requirement."
                defaultValue="#FFD166"
                showText
              />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
