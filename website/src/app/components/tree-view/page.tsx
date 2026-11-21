"use client";

import React from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { TreeView, type TreeViewNode } from "rift-ds/components/TreeView/TreeView";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { Kbd } from "rift-ds/components/Kbd/Kbd";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

/* ============================================
   DEMO DATA
   ============================================ */

const fileTree: TreeViewNode[] = [
  {
    id: "src",
    label: "src",
    children: [
      {
        id: "components",
        label: "components",
        children: [
          { id: "button-tsx", label: "Button.tsx" },
          { id: "button-css", label: "Button.css" },
          { id: "badge-tsx", label: "Badge.tsx" },
        ],
      },
      {
        id: "tokens",
        label: "tokens",
        children: [
          { id: "tokens-light", label: "tokens-light.css" },
          { id: "tokens-dark", label: "tokens-dark.css" },
        ],
      },
      { id: "index-ts", label: "index.ts" },
    ],
  },
  { id: "package-json", label: "package.json" },
  { id: "readme", label: "README.md" },
];

const customIconTree: TreeViewNode[] = [
  {
    id: "assets",
    label: "Assets",
    icon: "perm_media",
    children: [
      { id: "hero-png", label: "hero.png", icon: "image" },
      { id: "intro-mp4", label: "intro.mp4", icon: "movie" },
      { id: "theme-json", label: "theme.json", icon: "data_object" },
    ],
  },
  {
    id: "database",
    label: "Database",
    icon: "database",
    children: [
      { id: "users-table", label: "users", icon: "table" },
      { id: "orders-table", label: "orders", icon: "table" },
    ],
  },
  { id: "settings", label: "Settings", icon: "settings" },
];

const deepTree: TreeViewNode[] = [
  {
    id: "level-1",
    label: "Level 1",
    children: [
      {
        id: "level-2",
        label: "Level 2",
        children: [
          {
            id: "level-3",
            label: "Level 3",
            children: [
              {
                id: "level-4",
                label: "Level 4",
                children: [{ id: "leaf", label: "Deepest leaf" }],
              },
            ],
          },
        ],
      },
      { id: "level-2-sibling", label: "Level 2 sibling" },
    ],
  },
];

const keyboardRows = [
  { keys: ["Right"], effect: "On an open branch, steps into its first child" },
  { keys: ["Left"], effect: "On a leaf or a closed branch, moves to the parent" },
  { keys: ["Enter", "Space"], effect: "Select the focused row" },
];

/* ============================================
   PAGE
   ============================================ */

export default function TreeViewPage() {
  const [selected, setSelected] = React.useState<string>("button-tsx");

  return (
    <div className={styles.dsContent}>
      <PageBreadcrumb />
      {/* Page Title */}
      <div className={`${styles.pageHeader} animate-in`}>
        <h1 className={styles.pageTitle}>Tree view</h1>
        <PageLinks storybookPath="/?path=/docs/components-treeview--docs" />
      </div>

      {/* Intro */}
      <div className={`${styles.introSection} animate-in animate-delay-1`}>
        <p className={styles.subDisplay}>Nested structure, one tab stop</p>
        <p className={styles.introBody}>
          TreeView renders files, folders, and other nested structures as an
          accessible tree. Branches expand and collapse, one row can be
          selected, and the whole tree is a single tab stop: arrow keys walk
          the visible rows. Expansion and selection each work controlled or
          uncontrolled.
        </p>
      </div>

      {/* Default */}
      <section className={styles.demoBlock}>
        <SectionTitle title="File tree" />
        <p className={styles.introBody}>
          Branches default to the <code>folder</code> icon and leaves to{" "}
          <code>draft</code>. Clicking a branch row toggles it; clicking any
          row selects it. Seed the open branches with{" "}
          <code>defaultExpandedIds</code>.
        </p>
        <div className={styles.demoContainer}>
          <TreeView
            aria-label="Project files"
            nodes={fileTree}
            defaultExpandedIds={["src"]}
          />
        </div>
      </section>

      {/* Selection */}
      <section className={styles.demoBlock}>
        <SectionTitle title="Selection" />
        <p className={styles.introBody}>
          Pass <code>selectedId</code> with <code>onSelect</code> for
          controlled selection, or <code>defaultSelectedId</code> to leave
          the component in charge. This demo is controlled and echoes the
          selected id below the tree.
        </p>
        <div className={styles.demoContainer}>
          <TreeView
            aria-label="Selectable project files"
            nodes={fileTree}
            defaultExpandedIds={["src", "components"]}
            selectedId={selected}
            onSelect={setSelected}
          />
          <p className={styles.demoReadout}>
            Selected: <code>{selected}</code>
          </p>
        </div>
      </section>

      {/* Custom icons */}
      <section className={styles.demoBlock}>
        <SectionTitle title="Custom icons" />
        <p className={styles.introBody}>
          Any node can name its own Material Symbol via <code>icon</code>,
          so a tree can hold media, tables, or settings rather than files.
        </p>
        <div className={styles.demoContainer}>
          <TreeView
            aria-label="Workspace"
            nodes={customIconTree}
            defaultExpandedIds={["assets", "database"]}
          />
        </div>
      </section>

      {/* Deep nesting */}
      <section className={styles.demoBlock}>
        <SectionTitle title="Deep nesting" />
        <p className={styles.introBody}>
          Each level indents by one step of the spacing scale. Depth is a
          CSS custom property, so the indent stays on tokens however deep
          the data goes.
        </p>
        <div className={styles.demoContainer}>
          <TreeView
            aria-label="Deeply nested structure"
            nodes={deepTree}
            defaultExpandedIds={[
              "level-1",
              "level-2",
              "level-3",
              "level-4",
            ]}
          />
        </div>
      </section>

      {/* Keyboard */}
      <section className={styles.demoBlock}>
        <SectionTitle title="Keyboard" />
        <p className={styles.introBody}>
          The tree has a roving tabindex: Tab enters and leaves it once, and
          everything else happens on the arrows. These keys are the tree’s own,
          on top of the pattern’s under Tested keys.
        </p>
        <div className={styles.keyboardList}>
          {keyboardRows.map((row) => (
            <div key={row.effect} className={styles.keyboardRow}>
              <span className={styles.keyboardKeys}>
                {row.keys.map((key) => (
                  <Kbd key={key} size="compact">
                    {key}
                  </Kbd>
                ))}
              </span>
              <span className={styles.keyboardEffect}>{row.effect}</span>
            </div>
          ))}
        </div>
      </section>

      <ComponentInstallStrip slug="tree-view" />
    </div>
  );
}
