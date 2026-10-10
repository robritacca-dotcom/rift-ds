"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { DropdownMenu, DropdownMenuEntry } from "rift-ds/components/DropdownMenu/DropdownMenu";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { Button } from "rift-ds/components/Button/Button";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";


/* ============================================
   DEMO DATA
   ============================================ */

const DENSITY_OPTIONS = [
  { id: "compact", label: "Compact", icon: "density_small" },
  { id: "comfortable", label: "Comfortable", icon: "density_medium" },
  { id: "spacious", label: "Spacious", icon: "density_large" },
];

/* A choice set needs somewhere to keep the choice, so this demo holds state. */
function SelectedStateDemo() {
  const [density, setDensity] = React.useState("comfortable");
  return (
    <DropdownMenu
      trigger={<Button label="Density" variant="secondary" state="default" />}
      items={[
        {
          type: "group",
          label: "Row density",
          items: DENSITY_OPTIONS.map((option) => ({
            label: option.label,
            icon: option.icon,
            selected: density === option.id,
            onClick: () => setDensity(option.id),
          })),
        },
      ]}
    />
  );
}

const simpleItems: DropdownMenuEntry[] = [
  { label: "New file", icon: "note_add", onClick: () => {} },
  { label: "Open", icon: "folder_open", onClick: () => {} },
  { label: "Save", icon: "save", onClick: () => {} },
  { type: "separator" },
  { label: "Delete", icon: "delete", destructive: true, onClick: () => {} },
];

const groupedItems: DropdownMenuEntry[] = [
  {
    type: "group",
    label: "My Account",
    items: [
      { label: "Profile", icon: "person", shortcut: "⇧ ⌘ P", onClick: () => {} },
      { label: "Billing", icon: "credit_card", shortcut: "⌘ B", onClick: () => {} },
      { label: "Settings", icon: "settings", shortcut: "⌘ S", onClick: () => {} },
    ],
  },
  { type: "separator" },
  {
    type: "group",
    label: "Team",
    items: [
      { label: "Invite users", icon: "person_add", onClick: () => {} },
      { label: "New Team", icon: "group_add", shortcut: "⌘ T", onClick: () => {} },
    ],
  },
  { type: "separator" },
  { label: "GitHub", icon: "code", onClick: () => {} },
  { label: "Support", icon: "help", onClick: () => {} },
  { label: "API", icon: "terminal", disabled: true },
  { type: "separator" },
  { label: "Log out", icon: "logout", shortcut: "⇧ ⌘ Q", destructive: true, onClick: () => {} },
];

const subMenuItems: DropdownMenuEntry[] = [
  { label: "Back", icon: "arrow_back", shortcut: "⌘ [", onClick: () => {} },
  { label: "Forward", icon: "arrow_forward", shortcut: "⌘ ]", disabled: true },
  { type: "separator" },
  {
    label: "Invite users",
    icon: "person_add",
    children: [
      { label: "Email", icon: "mail", onClick: () => {} },
      { label: "Message", icon: "chat", onClick: () => {} },
      { type: "separator" },
      {
        label: "More…",
        icon: "more_horiz",
        children: [
          { label: "Slack", onClick: () => {} },
          { label: "Discord", onClick: () => {} },
          { label: "Teams", onClick: () => {} },
        ],
      },
    ],
  },
  { type: "separator" },
  { label: "New team", icon: "group_add", onClick: () => {} },
];

const shortcutItems: DropdownMenuEntry[] = [
  { label: "Undo", shortcut: "⌘ Z", onClick: () => {} },
  { label: "Redo", shortcut: "⇧ ⌘ Z", onClick: () => {} },
  { type: "separator" },
  { label: "Cut", shortcut: "⌘ X", onClick: () => {} },
  { label: "Copy", shortcut: "⌘ C", onClick: () => {} },
  { label: "Paste", shortcut: "⌘ V", onClick: () => {} },
  { type: "separator" },
  { label: "Select all", shortcut: "⌘ A", onClick: () => {} },
];

export default function DropdownMenuPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Dropdown menu</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-dropdownmenu--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              A contextual menu for actions and navigation
            </p>
            <p className={styles.introBody}>
              Triggered by a button or element, the dropdown menu displays a floating panel with items, sections, keyboard shortcuts, and nested sub-menus. Hover fills are inset from the panel edge for a refined look.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <DropdownMenu
                  trigger={<Button label="Open menu" variant="secondary" state="default" />}
                  items={simpleItems}
                />
              </div>
            </div>
          </section>

          {/* Sections and groups */}
          <section className={styles.section}>
            <SectionTitle title="Sections and groups" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <DropdownMenu
                  trigger={<Button label="My account" variant="secondary" state="default" />}
                  items={groupedItems}
                />
              </div>
            </div>
          </section>

          {/* Sub-menus */}
          <section className={styles.section}>
            <SectionTitle title="Sub-menus" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <DropdownMenu
                  trigger={<Button label="Actions" variant="secondary" state="default" />}
                  items={subMenuItems}
                />
              </div>
            </div>
          </section>

          {/* With shortcuts */}
          <section className={styles.section}>
            <SectionTitle title="With shortcuts" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <DropdownMenu
                  trigger={<Button label="Edit" variant="secondary" state="default" />}
                  items={shortcutItems}
                />
              </div>
            </div>
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <DropdownMenu
                  trigger={<Button label="Compact" variant="secondary" state="default" size="compact" />}
                  items={simpleItems}
                  size="compact"
                />
              </div>
            </div>
          </section>

          {/* Selected state */}
          <section className={styles.section}>
            <SectionTitle title="Selected state" />
            <p className={styles.introBody}>
              When a menu picks one option from a set, give every member a selected value. The current choice holds a quiet fill and a check, and assistive technology hears the rows as radio items.
            </p>
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <SelectedStateDemo />
              </div>
            </div>
          </section>

          <ComponentInstallStrip slug="dropdown-menu" />
        </main>
      </div>

    </>
  );
}
