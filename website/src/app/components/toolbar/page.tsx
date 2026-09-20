"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Toolbar, ToolbarSeparator } from "@robr0/design-system/components/Toolbar/Toolbar";
import { Button } from "@robr0/design-system/components/Button/Button";
import { CircularButton } from "@robr0/design-system/components/CircularButton/CircularButton";
import { SegmentedControl } from "@robr0/design-system/components/SegmentedControl/SegmentedControl";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function ToolbarPage() {
  const [zoom, setZoom] = useState(100);
  const [mode, setMode] = useState("select");

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Toolbar</h1>
            <PageLinks storybookPath="/?path=/docs/components-toolbar--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Controls that share one shell
            </p>
            <p className={styles.introBody}>
              A grouped strip for an instrument&apos;s controls: buttons, toggles, and segmented controls in clusters, separated by hairlines. Arrow keys walk the controls, and the floating variant is the glass pill this site hangs its own stage controls in.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <p className={styles.sectionNote}>
              The attached bar, on the container fill. Try the arrow keys once a control has focus; Home and End jump to the ends.
            </p>
            <div className={styles.variantRow}>
              <Toolbar label="Zoom controls">
                <CircularButton
                  icon="remove"
                  variant="tertiary"
                  ariaLabel="Zoom out"
                  onClick={() => setZoom((z) => Math.max(z - 25, 25))}
                />
                <Button label={`${zoom}%`} variant="tertiary" size="compact" onClick={() => setZoom(100)} />
                <CircularButton
                  icon="add"
                  variant="tertiary"
                  ariaLabel="Zoom in"
                  onClick={() => setZoom((z) => Math.min(z + 25, 400))}
                />
                <ToolbarSeparator />
                <CircularButton icon="fit_screen" variant="tertiary" ariaLabel="Fit to screen" onClick={() => setZoom(100)} />
                <CircularButton icon="open_in_full" variant="tertiary" ariaLabel="Expand" />
              </Toolbar>
            </div>
          </section>

          {/* Floating */}
          <section className={styles.section}>
            <SectionTitle title="Floating" />
            <p className={styles.sectionNote}>
              The glass pill for controls hovering over content. The shell is deliberately unpositioned: the consumer&apos;s layout decides where it floats, the way this site fixes its stage controls to the bottom of the viewport.
            </p>
            <div className={styles.stage}>
              <Toolbar label="Canvas controls" variant="floating">
                <CircularButton icon="undo" variant="tertiary" ariaLabel="Undo" />
                <CircularButton icon="redo" variant="tertiary" ariaLabel="Redo" />
                <ToolbarSeparator />
                <SegmentedControl
                  size="compact"
                  ariaLabel="Canvas mode"
                  segments={[
                    { label: "Select", value: "select" },
                    { label: "Pan", value: "pan" },
                  ]}
                  activeSegment={mode}
                  onSegmentChange={setMode}
                />
                <ToolbarSeparator />
                <CircularButton icon="delete" variant="tertiary" ariaLabel="Delete selection" />
              </Toolbar>
            </div>
          </section>

          {/* Vertical */}
          <section className={styles.section}>
            <SectionTitle title="Vertical" />
            <div className={styles.variantRow}>
              <Toolbar label="Drawing tools" orientation="vertical">
                <CircularButton icon="near_me" variant="tertiary" ariaLabel="Select tool" />
                <CircularButton icon="edit" variant="tertiary" ariaLabel="Draw tool" />
                <CircularButton icon="crop_square" variant="tertiary" ariaLabel="Shape tool" />
                <ToolbarSeparator />
                <CircularButton icon="delete" variant="tertiary" ariaLabel="Delete" />
              </Toolbar>
            </div>
          </section>

          {/* Mixed controls */}
          <section className={styles.section}>
            <SectionTitle title="Mixed controls" />
            <p className={styles.sectionNote}>
              Any control that belongs to the same instrument can share the shell; a primary action keeps its full weight.
            </p>
            <div className={styles.variantRow}>
              <Toolbar label="Editor actions">
                <Button label="Share" variant="primary" size="compact" />
                <Button label="Preview" variant="tertiary" size="compact" />
                <ToolbarSeparator />
                <CircularButton icon="more_horiz" variant="tertiary" ariaLabel="More actions" />
              </Toolbar>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
