"use client";

import React, { useState } from "react";
import Link from "next/link";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { InspectorSection } from "rift-ds/components/Inspector/InspectorSection";
import { InspectorSlider } from "rift-ds/components/Inspector/InspectorSlider";
import { InspectorInput } from "rift-ds/components/Inspector/InspectorInput";
import { InspectorToggleSwitch } from "rift-ds/components/Inspector/InspectorToggleSwitch";
import { InspectorSegmentedControl } from "rift-ds/components/Inspector/InspectorSegmentedControl";
import { InspectorDropdown } from "rift-ds/components/Inspector/InspectorDropdown";
import { Button } from "rift-ds/components/Button/Button";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";
import styles from "./page.module.css";

const percent = (v: number) => `${v}%`;

export default function InspectorSectionPage() {
  const [shapeOpen, setShapeOpen] = useState(true);

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Inspector section</h1>
            <PageLinks storybookPath="/?path=/docs/components-inspectorsection--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>A titled run of panel controls</p>
            <p className={styles.introBody}>
              The section groups the inspector controls of a tool panel or settings rail under a header that collapses them. Stacked sections are divided by a hairline, and the body stacks its controls one rhythm apart. The section is the home of the{" "}
              <Link href="/components/inspector-slider">inspector slider</Link>,{" "}
              <Link href="/components/inspector-input">input</Link>,{" "}
              <Link href="/components/inspector-toggle-switch">toggle switch</Link>,{" "}
              <Link href="/components/inspector-segmented-control">segmented control</Link> and{" "}
              <Link href="/components/inspector-dropdown">dropdown</Link>, each a one-row control with its name inside the bar.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="A composed panel" />
            <p className={styles.introBody}>
              A rail of stacked sections using every control in the family at the compact size, beside a compact Button, which shares the bars’ height and shape. Open the headings dropdown to see its menu open past the section’s edge.
            </p>
            <div className={styles.panelStage}>
              <InspectorSection title="Theme" defaultOpen>
                <InspectorInput size="compact" label="Product name" placeholder="Acme Corp" />
                <InspectorDropdown
                  size="compact"
                  label="Headings"
                  value="match"
                  options={[
                    { value: "match", label: "Match body" },
                    { value: "serif", label: "Serif", font: "Georgia, serif" },
                  ]}
                />
                <Button size="compact" variant="neutral" label="All colour ramps" iconLeft="palette" />
              </InspectorSection>
              <InspectorSection title="Shape and depth" defaultOpen>
                <InspectorSlider
                  size="compact"
                  label="Corner radius"
                  defaultValue={100}
                  min={0}
                  max={200}
                  step={10}
                  format={percent}
                />
                <InspectorToggleSwitch size="compact" label="Pill buttons" defaultChecked />
                <InspectorSegmentedControl
                  size="compact"
                  label="Elevation"
                  defaultValue="default"
                  options={[
                    { value: "default", label: "Default" },
                    { value: "flat", label: "Flat" },
                    { value: "soft", label: "Soft" },
                  ]}
                />
              </InspectorSection>
              <InspectorSection title="Space and motion">
                <InspectorSlider size="compact" label="Density" defaultValue={100} min={70} max={130} step={5} format={percent} />
                <InspectorSlider size="compact" label="Motion" defaultValue={100} min={50} max={150} step={10} format={percent} />
              </InspectorSection>
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Open and closed" />
            <p className={styles.introBody}>
              Use <code>defaultOpen</code> to seed an uncontrolled section, or <code>open</code> with <code>onOpenChange</code> to control it. A closed body is inert, so its controls leave the tab order rather than sitting focusable at zero height.
            </p>
            <div className={styles.sizeRow}>
              <div className={styles.demoColumn}>
                <span className={styles.demoCaption}>Controlled, {shapeOpen ? "open" : "closed"}</span>
                <InspectorSection title="Shape and depth" open={shapeOpen} onOpenChange={setShapeOpen}>
                  <InspectorSlider size="compact" label="Corner radius" defaultValue={100} min={0} max={200} step={10} format={percent} />
                  <InspectorToggleSwitch size="compact" label="Pill buttons" defaultChecked />
                </InspectorSection>
              </div>
              <div className={styles.demoColumn}>
                <span className={styles.demoCaption}>Uncontrolled, closed</span>
                <InspectorSection title="Typography">
                  <InspectorToggleSwitch size="compact" label="Tight headings" />
                </InspectorSection>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Default size controls" />
            <p className={styles.introBody}>
              Every control takes the same <code>size</code> prop as Button. Compact suits a narrow rail; the default size suits a wider panel or a touch screen.
            </p>
            <div className={styles.panelStage}>
              <InspectorSection title="Canvas" defaultOpen>
                <InspectorInput label="Title" placeholder="Untitled" />
                <InspectorSlider label="Zoom" defaultValue={100} min={25} max={400} step={25} format={percent} />
                <InspectorToggleSwitch label="Show grid" defaultChecked />
              </InspectorSection>
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="When to use it" />
            <p className={styles.introBody}>
              Use the inspector section to group the controls of a dense settings panel. Unlike{" "}
              <Link href="/components/accordion">Accordion</Link>, its open body does not clip, so a dropdown menu inside can open past the section’s edge. For bordered panels of general content, such as an FAQ, use Accordion instead.
            </p>
          </section>

          <ComponentInstallStrip slug="inspector-section" />
        </main>
      </div>
    </>
  );
}
