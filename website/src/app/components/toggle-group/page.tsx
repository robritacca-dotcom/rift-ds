"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { ToggleGroup } from "@robr0/design-system/components/ToggleGroup/ToggleGroup";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function ToggleGroupPage() {
  const [align, setAlign] = useState<string>("center");
  const [formats, setFormats] = useState<string[]>(["bold"]);
  const [view, setView] = useState<string>("grid");
  const [density, setDensity] = useState<string>("cozy");

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Toggle group</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-togglegroup--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Grouped toggle buttons
            </p>
            <p className={styles.introBody}>
              A set of two-state buttons that can be toggled on or off. Supports single or multiple selection, text or icon items, default or compact sizing, and a neutral variant that fills active items grey.
            </p>
          </div>

          {/* Text items */}
          <section className={styles.section}>
            <SectionTitle title="Text items" />
            <div>
              <ToggleGroup
                items={[
                  { value: "left", label: "Left" },
                  { value: "center", label: "Center" },
                  { value: "right", label: "Right" },
                ]}
                value={align}
                onChange={(v) => setAlign(v as string)}
              />
            </div>
          </section>

          {/* Icon items — multiple */}
          <section className={styles.section}>
            <SectionTitle title="Icon items (multiple)" />
            <div>
              <ToggleGroup
                items={[
                  { value: "bold", label: "format_bold", icon: true },
                  { value: "italic", label: "format_italic", icon: true },
                  { value: "underline", label: "format_underlined", icon: true },
                ]}
                value={formats}
                multiple
                onChange={(v) => setFormats(v as string[])}
              />
            </div>
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <div>
              <ToggleGroup
                items={[
                  { value: "grid", label: "grid_view", icon: true },
                  { value: "list", label: "view_list", icon: true },
                ]}
                value={view}
                size="compact"
                onChange={(v) => setView(v as string)}
              />
            </div>
          </section>

          {/* Neutral */}
          <section className={styles.section}>
            <SectionTitle title="Neutral" />
            <p className={styles.introBody}>
              The neutral variant fills active items with a solid grey instead
              of the primary colour, for toggles that should read quietly.
            </p>
            <div>
              <ToggleGroup
                variant="neutral"
                items={[
                  { value: "compact", label: "Compact" },
                  { value: "cozy", label: "Cozy" },
                  { value: "comfortable", label: "Comfortable" },
                ]}
                value={density}
                onChange={(v) => setDensity(v as string)}
              />
            </div>
          </section>

          {/* Disabled */}
          <section className={styles.section}>
            <SectionTitle title="Disabled" />
            <div>
              <ToggleGroup
                items={[
                  { value: "a", label: "Option A" },
                  { value: "b", label: "Option B" },
                  { value: "c", label: "Option C" },
                ]}
                value="a"
                disabled
              />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
