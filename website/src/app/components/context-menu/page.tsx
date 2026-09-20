"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { ContextMenu } from "@robr0/design-system/components/ContextMenu/ContextMenu";
import { DropdownMenuEntry } from "@robr0/design-system/components/DropdownMenu/DropdownMenu";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";


/* ============================================
   DEMO DATA
   ============================================ */

const fileItems: DropdownMenuEntry[] = [
  { label: "Open", icon: "open_in_new", shortcut: "⌘ O", onClick: () => {} },
  { label: "Rename", icon: "edit", shortcut: "⏎", onClick: () => {} },
  { label: "Duplicate", icon: "content_copy", shortcut: "⌘ D", onClick: () => {} },
  { type: "separator" },
  { label: "Delete", icon: "delete", shortcut: "⌘ ⌫", destructive: true, onClick: () => {} },
];

const richItems: DropdownMenuEntry[] = [
  {
    type: "group",
    label: "File",
    items: [
      { label: "Open", icon: "open_in_new", onClick: () => {} },
      { label: "Download", icon: "download", onClick: () => {} },
    ],
  },
  { type: "separator" },
  {
    label: "Share",
    icon: "share",
    children: [
      { label: "Copy link", icon: "link", onClick: () => {} },
      { label: "Email", icon: "mail", onClick: () => {} },
      { label: "Message", icon: "chat", onClick: () => {} },
    ],
  },
  { label: "Archive", icon: "archive", disabled: true },
  { type: "separator" },
  { label: "Delete", icon: "delete", destructive: true, onClick: () => {} },
];

export default function ContextMenuPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Context menu</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-contextmenu--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              A menu that opens where you click
            </p>
            <p className={styles.introBody}>
              Right-click (or press the keyboard menu key) on the wrapped area
              and the panel opens at the pointer, clamped to the viewport. It
              shares its entry model and styling with the dropdown menu:
              items, sections, shortcut hints, destructive and disabled states,
              and sub-menus. Use a dropdown menu when the menu opens from a
              visible trigger; a context menu when it belongs to the content
              itself.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <ContextMenu items={fileItems} ariaLabel="File actions">
                  <div className={styles.demoTarget}>Right-click here</div>
                </ContextMenu>
              </div>
            </div>
          </section>

          {/* Groups and sub-menus */}
          <section className={styles.section}>
            <SectionTitle title="Groups and sub-menus" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <ContextMenu items={richItems} ariaLabel="Document actions">
                  <div className={styles.demoTarget}>Right-click for grouped actions</div>
                </ContextMenu>
              </div>
            </div>
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <ContextMenu items={fileItems} size="compact" ariaLabel="File actions">
                  <div className={styles.demoTarget}>Right-click for the compact menu</div>
                </ContextMenu>
              </div>
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
