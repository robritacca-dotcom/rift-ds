"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { RichDropdown } from "@robr0/design-system/components/RichDropdown/RichDropdown";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

/* System-available faces, so the cells preview real typographic contrast
   without loading webfonts for a demo. */
const themePresets = [
  {
    label: "House default",
    value: "default",
    color: "#0E6E8F",
    description: "One face for everything",
  },
  {
    label: "Editorial serif",
    value: "editorial",
    headingFont: "Georgia, 'Times New Roman', serif",
    bodyFont: "Verdana, sans-serif",
    color: "#D97757",
    description: "Georgia over Verdana",
  },
  {
    label: "Terminal mono",
    value: "terminal",
    headingFont: "'Courier New', monospace",
    bodyFont: "'Courier New', monospace",
    color: "#05A67C",
    swatchRadius: "0px",
    description: "Courier through and through",
  },
  {
    label: "Ink and paper",
    value: "mono",
    headingFont: "'Arial Black', Arial, sans-serif",
    bodyFont: "Arial, sans-serif",
    color: "#232323",
    swatchRadius: "4px",
    description: "Arial Black over Arial",
  },
];

export default function RichDropdownPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Rich dropdown</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-richdropdown--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              A select where every option previews its own look
            </p>
            <p className={styles.introBody}>
              Each option is a small self-portrait: the name in its heading face, a detail line in its body face, and a dot of its key colour. The closed trigger shows the selected option the same way. Use it for theme presets, brand kits, or any choice where the whole look is the point; when the label alone is enough, Dropdown covers it, including a per-option font for typeface pickers.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <RichDropdown
                  label="Theme preset"
                  defaultValue="editorial"
                  options={themePresets}
                />
              </div>
              <div className={styles.variantItem}>
                <RichDropdown
                  label="Placeholder"
                  placeholder="Choose a look"
                  options={themePresets}
                />
              </div>
            </div>
          </section>

          {/* Without the full portrait */}
          <section className={styles.section}>
            <SectionTitle title="Partial previews" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <RichDropdown
                  label="Colour only"
                  defaultValue="ocean"
                  options={[
                    { label: "Ocean", value: "ocean", color: "#0E6E8F" },
                    { label: "Ember", value: "ember", color: "#C65E33" },
                    { label: "Moss", value: "moss", color: "#05A67C" },
                  ]}
                />
              </div>
              <div className={styles.variantItem}>
                <RichDropdown
                  label="Fonts only"
                  defaultValue="serif"
                  options={[
                    {
                      label: "Serif",
                      value: "serif",
                      headingFont: "Georgia, serif",
                      bodyFont: "Georgia, serif",
                      description: "Georgia",
                    },
                    {
                      label: "Mono",
                      value: "mono",
                      headingFont: "'Courier New', monospace",
                      bodyFont: "'Courier New', monospace",
                      description: "Courier New",
                    },
                  ]}
                />
              </div>
            </div>
          </section>

          {/* States */}
          <section className={styles.section}>
            <SectionTitle title="States" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <RichDropdown
                  label="Helper text"
                  placeholder="Choose a look"
                  helperText="Each option previews the look it selects."
                  options={themePresets}
                />
              </div>
              <div className={styles.variantItem}>
                <RichDropdown
                  label="Error"
                  placeholder="Choose a look"
                  error
                  helperText="Pick a preset to continue."
                  options={themePresets}
                />
              </div>
              <div className={styles.variantItem}>
                <RichDropdown
                  label="Disabled"
                  defaultValue="terminal"
                  disabled
                  options={themePresets}
                />
              </div>
              <div className={styles.variantItem}>
                <RichDropdown
                  label="Disabled option"
                  defaultValue="default"
                  options={[
                    ...themePresets.slice(0, 3),
                    { ...themePresets[3], disabled: true },
                  ]}
                />
              </div>
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
