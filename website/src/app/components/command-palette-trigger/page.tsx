"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { CommandPaletteTrigger } from "rift-ds/components/CommandPaletteTrigger/CommandPaletteTrigger";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";
import { openSitePalette } from "@/components/SitePalette/palette-bus";

export default function CommandPaletteTriggerPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Command palette trigger</h1>
            <PageLinks storybookPath="/?path=/docs/components-commandpalettetrigger--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>The way into a command palette</p>
            <p className={styles.introBody}>
              A button dressed as a search field, with a prompt and the
              shortcut&rsquo;s keycaps, because typing happens in the palette
              itself. It sits on the row-control height, so it lines up with the
              buttons and pickers beside it. It is the entry point in this
              site&rsquo;s header.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="Default" />
            <p className={styles.demoText}>
              The host sets its width; the keycaps sit at the far end. It is
              live: it opens this site&rsquo;s palette.
            </p>
            <div className={styles.row}>
              <CommandPaletteTrigger style={{ width: 320 }} onClick={openSitePalette} />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Sizes and the icon form" />
            <p className={styles.demoText}>
              Two sizes on the row-control scale. With iconOnly it folds to a
              circle the row height across, for a row with no room for the
              field; the prompt stays its accessible name and its tooltip.
            </p>
            <div className={styles.row}>
              <CommandPaletteTrigger size="compact" style={{ width: 260 }} onClick={openSitePalette} />
              <CommandPaletteTrigger iconOnly onClick={openSitePalette} />
              <CommandPaletteTrigger iconOnly size="compact" onClick={openSitePalette} />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Pairing with the palette" />
            <p className={styles.demoText}>
              The trigger only opens: its onClick sets CommandPalette&rsquo;s
              open state, and the palette owns the shortcut. The label and the
              shortcut are props, so the prompt can say what a product&rsquo;s
              palette does. The default keys draw ⌘ K on a Mac and Ctrl K
              elsewhere, and aria-keyshortcuts announces both, since the
              palette answers to either.
            </p>
          </section>

          <ComponentInstallStrip slug="command-palette-trigger" />
        </main>
      </div>
    </>
  );
}
