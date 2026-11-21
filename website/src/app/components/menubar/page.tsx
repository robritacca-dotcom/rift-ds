"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";
import { Menubar, type MenubarMenu } from "rift-ds/components/Menubar/Menubar";

const MENUS: MenubarMenu[] = [
  {
    label: "File",
    items: [
      { label: "New tab", keys: "mod+t" },
      { label: "New window", keys: "mod+n" },
      { type: "separator" },
      { label: "Share", children: [{ label: "Email link" }, { label: "Copy link" }] },
      { type: "separator" },
      { label: "Print", keys: "mod+p" },
    ],
  },
  {
    label: "Edit",
    items: [
      { label: "Undo", keys: "mod+z" },
      { label: "Redo", keys: "mod+shift+z" },
      { type: "separator" },
      { label: "Cut" },
      { label: "Copy" },
      { label: "Paste" },
    ],
  },
  {
    label: "View",
    items: [
      { label: "Show sidebar", checked: true },
      { label: "Show status bar", checked: false },
      { type: "separator" },
      { label: "Zoom in", keys: "mod+=" },
      { label: "Zoom out", keys: "mod+-" },
    ],
  },
  { label: "Help", items: [{ label: "Documentation" }, { label: "Keyboard shortcuts" }] },
];

export default function MenubarPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Menu bar</h1>
            <PageLinks storybookPath="/?path=/docs/components-menubar--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>A persistent row of menus</p>
            <p className={styles.introBody}>
              The menus along the top of a desktop app: File, Edit, View. Each menu is a Dropdown menu, so its items, groups, sub-menus, checkboxes and shortcuts work exactly as they do there. The bar is one tab stop, the arrow keys move along it, and once a menu is open, moving along the bar opens the next one.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.demoRow}>
              <Menubar menus={MENUS} />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <div className={styles.demoRow}>
              <Menubar menus={MENUS} size="compact" />
            </div>
            <p className={styles.demoText}>
              For a dense toolbar row or an editor&apos;s chrome.
            </p>
          </section>

          <ComponentInstallStrip slug="menubar" />
        </main>
      </div>
    </>
  );
}
