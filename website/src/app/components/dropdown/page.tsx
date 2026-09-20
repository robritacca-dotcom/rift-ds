"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Dropdown } from "@robr0/design-system/components/Dropdown/Dropdown";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
const colourOptions = [
  { label: "Red", value: "red" },
  { label: "Teal", value: "teal" },
  { label: "Purple", value: "purple" },
  { label: "Yellow", value: "yellow" },
  { label: "Green", value: "green" },
];


export default function DropdownPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Dropdown</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-dropdown--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              A select menu for choosing one option from a list
            </p>
            <p className={styles.introBody}>
              Opens a styled dropdown panel with keyboard navigation and a check mark on the selected item. Use this instead of a native select when you need consistent styling across browsers.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <Dropdown label="Placeholder" placeholder="Select a colour" options={colourOptions} onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Dropdown label="With value" value="teal" options={colourOptions} onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Dropdown label="Required" placeholder="Select..." required options={colourOptions} onChange={() => {}} />
              </div>
            </div>
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <Dropdown label="Placeholder" placeholder="Select a colour" size="compact" options={colourOptions} onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Dropdown label="With value" value="teal" size="compact" options={colourOptions} onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Dropdown label="Required" placeholder="Select..." required size="compact" options={colourOptions} onChange={() => {}} />
              </div>
            </div>
          </section>

          {/* Grouped */}
          <section className={styles.section}>
            <SectionTitle title="Grouped options" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <Dropdown
                  label="Font family"
                  placeholder="Choose a font"
                  options={[]}
                  groups={[
                    {
                      label: "Sans-serif",
                      options: [
                        { label: "Inter", value: "inter" },
                        { label: "Roboto", value: "roboto" },
                        { label: "Open Sans", value: "open-sans" },
                      ],
                    },
                    {
                      label: "Serif",
                      options: [
                        { label: "Georgia", value: "georgia" },
                        { label: "Merriweather", value: "merriweather" },
                      ],
                    },
                    {
                      label: "Monospace",
                      options: [
                        { label: "Fira Code", value: "fira-code" },
                        { label: "JetBrains Mono", value: "jetbrains-mono" },
                      ],
                    },
                  ]}
                  onChange={() => {}}
                />
              </div>
            </div>
          </section>

          {/* Font preview */}
          <section className={styles.section}>
            <SectionTitle title="Typeface preview" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <Dropdown
                  label="Typeface"
                  value="georgia"
                  options={[
                    { label: "Georgia", value: "georgia", font: "Georgia, 'Times New Roman', serif" },
                    { label: "Verdana", value: "verdana", font: "Verdana, sans-serif" },
                    { label: "Courier New", value: "courier", font: "'Courier New', monospace" },
                    { label: "Arial", value: "arial", font: "Arial, sans-serif" },
                  ]}
                  onChange={() => {}}
                />
              </div>
            </div>
          </section>

          {/* States */}
          <section className={styles.section}>
            <SectionTitle title="States" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <Dropdown label="Helper text" placeholder="Choose..." helperText="This sets the primary colour" options={colourOptions} onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Dropdown label="Error" placeholder="Select..." error helperText="Please select an option" options={colourOptions} onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Dropdown label="Disabled" value="teal" disabled options={colourOptions} onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Dropdown
                  label="Disabled option"
                  value="pro"
                  options={[
                    { label: "Free", value: "free" },
                    { label: "Pro", value: "pro" },
                    { label: "Enterprise (coming soon)", value: "enterprise", disabled: true },
                  ]}
                  onChange={() => {}}
                />
              </div>
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
