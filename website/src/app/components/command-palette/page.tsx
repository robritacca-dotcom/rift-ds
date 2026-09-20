"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { CommandPalette } from "@robr0/design-system/components/CommandPalette/CommandPalette";
import type { CommandPaletteGroup } from "@robr0/design-system/components/CommandPalette/CommandPalette";
import { Badge } from "@robr0/design-system/components/Badge/Badge";
import { Button } from "@robr0/design-system/components/Button/Button";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";


const groups: CommandPaletteGroup[] = [
  {
    label: "Navigation",
    commands: [
      { id: "home", label: "Go to Home", icon: "home", shortcut: ["G", "H"] },
      { id: "components", label: "Go to Components", icon: "widgets", shortcut: ["G", "C"] },
      {
        id: "foundations",
        label: "Go to Foundations",
        description: "Tokens, colour, typography, spacing",
        icon: "palette",
      },
      {
        id: "journal",
        label: "Go to Project Journal",
        icon: "timeline",
        keywords: ["updates", "changelog", "history"],
      },
    ],
  },
  {
    label: "Actions",
    commands: [
      {
        id: "new",
        label: "New component",
        icon: "add",
        shortcut: ["⌘", "N"],
        trailing: <Badge label="Beta" variant="info" />,
      },
      { id: "search", label: "Search documentation", icon: "search", shortcut: ["⌘", "F"] },
      {
        id: "theme",
        label: "Toggle dark mode",
        description: "Switch between the light and dark themes",
        icon: "dark_mode",
        keywords: ["theme", "light", "appearance"],
      },
      { id: "export", label: "Export tokens", icon: "download", disabled: true },
    ],
  },
  {
    label: "Help",
    commands: [
      { id: "docs", label: "Read the docs", icon: "menu_book" },
      { id: "shortcuts", label: "Keyboard shortcuts", icon: "keyboard", shortcut: ["?"] },
    ],
  },
];

export default function CommandPalettePage() {
  const [defaultOpen, setDefaultOpen] = useState(false);
  const [noHotkeyOpen, setNoHotkeyOpen] = useState(false);
  const [emptyOpen, setEmptyOpen] = useState(false);
  const [loadingOpen, setLoadingOpen] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Command palette</h1>
            <PageLinks storybookPath="/?path=/docs/components-commandpalette--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>Search and run commands from the keyboard</p>
            <p className={styles.introBody}>
              A modal launcher that searches a grouped command list. Filtering
              matches labels, descriptions, and hidden keywords, so “changelog”
              can find a command named “Project Journal”. The arrow keys wrap
              through results, Enter runs the highlighted command, and{" "}
              <kbd className={styles.kbd}>⌘</kbd>{" "}
              <kbd className={styles.kbd}>K</kbd> toggles the palette from
              anywhere on the page.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <p className={styles.demoCaption}>
              Try the hotkey. This demo owns it here; everywhere else it opens
              the site’s own palette.
            </p>
            <div className={styles.demoRow}>
              <Button
                label="Open palette"
                variant="secondary"
                iconLeft="search"
                onClick={() => setDefaultOpen(true)}
              />
              {lastRun && <span className={styles.demoText}>Last command: {lastRun}</span>}
            </div>
            <CommandPalette
              open={defaultOpen}
              onOpenChange={setDefaultOpen}
              groups={groups}
              onSelect={(command) => setLastRun(command.label)}
            />
          </section>

          {/* Anatomy */}
          <section className={styles.section}>
            <SectionTitle title="Anatomy" />
            <p className={styles.introBody}>
              Commands carry an optional icon, a label, a description line, a{" "}
              <code>shortcut</code> array rendered as key chips on the right,
              and an optional <code>trailing</code> node after the keycaps, a
              non-interactive badge or mark at the row&apos;s right edge (the
              Beta badge on “New component” in these examples; the site&apos;s
              own palette wears its AI-ring chip there).
              Disabled commands stay visible for discoverability but are skipped
              by the keyboard highlight (“Export tokens” in these examples).
              Group headings are quiet by design; the labels do the work.
            </p>
          </section>

          {/* Without the hotkey */}
          <section className={styles.section}>
            <SectionTitle title="Without the hotkey" />
            <p className={styles.demoCaption}>
              Set <code>hotkey=&#123;false&#125;</code> when the host app already
              owns ⌘K and wants to open the palette itself.
            </p>
            <div className={styles.demoRow}>
              <Button
                label="Open without hotkey"
                variant="secondary"
                onClick={() => setNoHotkeyOpen(true)}
              />
            </div>
            <CommandPalette
              open={noHotkeyOpen}
              onOpenChange={setNoHotkeyOpen}
              groups={groups}
              hotkey={false}
            />
          </section>

          {/* Empty and loading */}
          <section className={styles.section}>
            <SectionTitle title="Empty and loading" />
            <p className={styles.demoCaption}>
              Both states replace the list with a single centred status row.
              Pair <code>loading</code> with <code>onSearchChange</code> and{" "}
              <code>manualFiltering</code> for server-backed search.
            </p>
            <div className={styles.demoRow}>
              <Button
                label="No results"
                variant="secondary"
                onClick={() => setEmptyOpen(true)}
              />
              <Button
                label="Loading"
                variant="secondary"
                onClick={() => setLoadingOpen(true)}
              />
            </div>
            <CommandPalette
              open={emptyOpen}
              onOpenChange={setEmptyOpen}
              groups={[]}
              hotkey={false}
              emptyMessage="Nothing matched. Try a different term."
            />
            <CommandPalette
              open={loadingOpen}
              onOpenChange={setLoadingOpen}
              groups={groups}
              hotkey={false}
              loading
            />
          </section>

          {/* Keyboard */}
          <section className={styles.section}>
            <SectionTitle title="Keyboard" />
            <p className={styles.introBody}>
              <kbd className={styles.kbd}>↑</kbd>{" "}
              <kbd className={styles.kbd}>↓</kbd> move through results and wrap
              at the ends · <kbd className={styles.kbd}>Home</kbd> and{" "}
              <kbd className={styles.kbd}>End</kbd> jump to the first and last ·{" "}
              <kbd className={styles.kbd}>↵</kbd> runs the highlighted command ·{" "}
              <kbd className={styles.kbd}>esc</kbd> closes. The same hints appear
              in the palette footer, which hides on narrow screens.
            </p>
          </section>
        </main>
      </div>

    </>
  );
}
