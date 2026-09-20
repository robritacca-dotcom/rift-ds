"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Combobox } from "@robr0/design-system/components/Combobox/Combobox";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";


const countries = [
  { label: "Australia", value: "au" },
  { label: "Brazil", value: "br" },
  { label: "Canada", value: "ca" },
  { label: "Denmark", value: "dk" },
  { label: "France", value: "fr" },
  { label: "Germany", value: "de" },
  { label: "Ireland", value: "ie" },
  { label: "Japan", value: "jp" },
  { label: "Netherlands", value: "nl" },
  { label: "New Zealand", value: "nz" },
  { label: "Portugal", value: "pt" },
  { label: "Spain", value: "es" },
  { label: "Sweden", value: "se" },
  { label: "United Kingdom", value: "gb" },
  { label: "United States", value: "us" },
];

const teammates = [
  { label: "Ada Lovelace", value: "ada", description: "Engineering" },
  { label: "Grace Hopper", value: "grace", description: "Engineering" },
  { label: "Katherine Johnson", value: "katherine", description: "Research" },
  { label: "Mary Jackson", value: "mary", description: "Research" },
  { label: "Radia Perlman", value: "radia", description: "Networking" },
];

const regionGroups = [
  {
    label: "Europe",
    options: [
      { label: "France", value: "fr" },
      { label: "Germany", value: "de" },
      { label: "Portugal", value: "pt" },
      { label: "Spain", value: "es" },
    ],
  },
  {
    label: "Americas",
    options: [
      { label: "Brazil", value: "br" },
      { label: "Canada", value: "ca" },
      { label: "United States", value: "us" },
    ],
  },
  {
    label: "Asia Pacific",
    options: [
      { label: "Australia", value: "au" },
      { label: "Japan", value: "jp" },
      { label: "New Zealand", value: "nz" },
    ],
  },
];

export default function ComboboxPage() {
  const [basic, setBasic] = useState<string | string[]>("");
  const [clearable, setClearable] = useState<string | string[]>("ca");
  const [multi, setMulti] = useState<string | string[]>(["ca", "jp"]);
  const [grouped, setGrouped] = useState<string | string[]>("");
  const [described, setDescribed] = useState<string | string[]>("");
  const [compact, setCompact] = useState<string | string[]>("");
  const [errored, setErrored] = useState<string | string[]>("");

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Combobox</h1>
            <PageLinks storybookPath="/?path=/docs/components-combobox--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>A select you can type into</p>
            <p className={styles.introBody}>
              Combobox pairs a text field with a listbox that narrows as you
              type. Reach for it when the option list is long, searchable, or
              loaded from a server, and for anything that needs multiple
              selections. Dropdown stays the right choice for short, static
              lists.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.demoBox}>
              <Combobox
                label="Country"
                placeholder="Search countries…"
                options={countries}
                value={basic}
                onChange={setBasic}
                helperText="Start typing to narrow the list."
              />
            </div>
          </section>

          {/* Clearable */}
          <section className={styles.section}>
            <SectionTitle title="Clearable" />
            <div className={styles.demoBox}>
              <p className={styles.demoCaption}>
                A clear button appears once something is selected.
              </p>
              <Combobox
                label="Country"
                placeholder="Search countries…"
                options={countries}
                value={clearable}
                onChange={setClearable}
                clearable
              />
            </div>
          </section>

          {/* Multiple */}
          <section className={styles.section}>
            <SectionTitle title="Multiple" />
            <div className={styles.demoBox}>
              <p className={styles.demoCaption}>
                Selections become removable chips inside the control. Backspace
                on an empty query pops the last one.
              </p>
              <Combobox
                label="Countries"
                placeholder="Search countries…"
                options={countries}
                value={multi}
                onChange={setMulti}
                multiple
                clearable
              />
            </div>
          </section>

          {/* Grouped */}
          <section className={styles.section}>
            <SectionTitle title="Grouped" />
            <div className={styles.demoBox}>
              <p className={styles.demoCaption}>
                Groups keep their headings while filtering; empty groups drop
                out of the list.
              </p>
              <Combobox
                label="Region"
                placeholder="Search regions…"
                options={[]}
                groups={regionGroups}
                value={grouped}
                onChange={setGrouped}
              />
            </div>
          </section>

          {/* With descriptions */}
          <section className={styles.section}>
            <SectionTitle title="With descriptions" />
            <div className={styles.demoBox}>
              <p className={styles.demoCaption}>
                A second line disambiguates similar labels.
              </p>
              <Combobox
                label="Assign to"
                placeholder="Search teammates…"
                options={teammates}
                value={described}
                onChange={setDescribed}
              />
            </div>
          </section>

          {/* States */}
          <section className={styles.section}>
            <SectionTitle title="States" />
            <div className={styles.demoRow}>
              <div className={styles.demoBox}>
                <p className={styles.demoCaption}>Error</p>
                <Combobox
                  label="Country"
                  placeholder="Search countries…"
                  options={countries}
                  value={errored}
                  onChange={setErrored}
                  error
                  required
                  helperText="Please choose a country."
                />
              </div>
              <div className={styles.demoBox}>
                <p className={styles.demoCaption}>Disabled</p>
                <Combobox
                  label="Country"
                  placeholder="Search countries…"
                  options={countries}
                  disabled
                  helperText="Locked for this account."
                />
              </div>
            </div>
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <div className={styles.demoBox}>
              <Combobox
                label="Country"
                placeholder="Search countries…"
                options={countries}
                value={compact}
                onChange={setCompact}
                size="compact"
              />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
