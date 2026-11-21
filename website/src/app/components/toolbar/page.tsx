"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { Toolbar, ToolbarSeparator } from "rift-ds/components/Toolbar/Toolbar";
import { Button } from "rift-ds/components/Button/Button";
import { IconButton } from "rift-ds/components/IconButton/IconButton";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

export default function ToolbarPage() {
  const [zoom, setZoom] = useState(100);
  const [mode, setMode] = useState("select");

  return (
    <div className={styles.dsContent}>
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
            <IconButton
              icon="remove"
              variant="tertiary"
              label="Zoom out"
              onClick={() => setZoom((z) => Math.max(z - 25, 25))}
            />
            <Button label={`${zoom}%`} variant="tertiary" size="compact" onClick={() => setZoom(100)} />
            <IconButton
              icon="add"
              variant="tertiary"
              label="Zoom in"
              onClick={() => setZoom((z) => Math.min(z + 25, 400))}
            />
            <ToolbarSeparator />
            <IconButton icon="fit_screen" variant="tertiary" label="Fit to screen" onClick={() => setZoom(100)} />
            <IconButton icon="open_in_full" variant="tertiary" label="Expand" />
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
            <IconButton icon="undo" variant="tertiary" label="Undo" />
            <IconButton icon="redo" variant="tertiary" label="Redo" />
            <ToolbarSeparator />
            <SegmentedControl
              size="compact"
              aria-label="Canvas mode"
              segments={[
                { label: "Select", value: "select" },
                { label: "Pan", value: "pan" },
              ]}
              value={mode}
              onValueChange={setMode}
            />
            <ToolbarSeparator />
            <IconButton icon="delete" variant="tertiary" label="Delete selection" />
          </Toolbar>
        </div>
      </section>

      {/* Vertical */}
      <section className={styles.section}>
        <SectionTitle title="Vertical" />
        <div className={styles.variantRow}>
          <Toolbar label="Drawing tools" orientation="vertical">
            <IconButton icon="near_me" variant="tertiary" label="Select tool" />
            <IconButton icon="edit" variant="tertiary" label="Draw tool" />
            <IconButton icon="crop_square" variant="tertiary" label="Shape tool" />
            <ToolbarSeparator />
            <IconButton icon="delete" variant="tertiary" label="Delete" />
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
            <IconButton icon="more_horiz" variant="tertiary" label="More actions" />
          </Toolbar>
        </div>
      </section>

      <ComponentInstallStrip slug="toolbar" />
    </div>
  );
}
