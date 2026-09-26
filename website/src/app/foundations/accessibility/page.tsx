"use client";

import { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { getSidebarLinks, foundationsSidebarLinks } from "@/config/navigation";
import styles from "./page.module.css";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { Stat } from "rift-ds/components/Stat/Stat";
import { Table } from "rift-ds/components/Table/Table";
import { Button } from "rift-ds/components/Button/Button";
import { Dialog } from "rift-ds/components/Dialog/Dialog";
import { Input } from "rift-ds/components/Input/Input";
import { COMPONENT_COUNT } from "rift-ds/components/registry";
import {
  ACCESSIBLE_NAME_COUNT,
  ARIA_COMPONENT_COUNT,
  BEHAVIOUR_MODULE_COUNT,
  STORY_COUNT,
  overlayComponents,
} from "@/data/a11y-coverage";

const { sidebarLinks } = getSidebarLinks(foundationsSidebarLinks, "/foundations/accessibility");

const gateColumns = [
  { key: "gate", header: "Gate", width: "24%" },
  { key: "runs", header: "What it proves" },
  { key: "when", header: "When", width: "22%" },
];

const gateRows = [
  {
    id: "stories",
    cells: {
      gate: "Component audit",
      runs: "axe runs against every story in headless Chromium. Every variant of every component is audited, not a sample.",
      when: "Story tests, on every change",
    },
  },
  {
    id: "pages",
    cells: {
      gate: "Page audit",
      runs: "axe runs again over the served build in both themes, on the WCAG 2.1 A and AA rule set, where landmark structure and heading order are visible for the first time. A component alone cannot show either.",
      when: "After the website build, in CI and local verify",
    },
  },
  {
    id: "presets",
    cells: {
      gate: "Theme contrast",
      runs: "Every shipped theme has its action colour and text resolved through the var() chain and held to the AA threshold.",
      when: "The validate-registry chain",
    },
  },
  {
    id: "behaviour",
    cells: {
      gate: "Behaviour assertions",
      runs: "Focus movement, Escape handling and overlay stacking, asserted as story play functions rather than described in a doc.",
      when: "Story tests, on every change",
    },
  },
];

const inheritedColumns = [
  { key: "behaviour", header: "Behaviour", width: "26%" },
  { key: "what", header: "What a consumer gets" },
];

const inheritedRows = [
  {
    id: "focus",
    cells: {
      behaviour: "Focus scope",
      what: "Tab and Shift+Tab cycle inside an open panel and nowhere else, focus returns to the element that opened it, and the background is marked inert while it is open.",
    },
  },
  {
    id: "layer",
    cells: {
      behaviour: "Layer stack",
      what: "Escape and an outside click reach only the topmost overlay, so a dialog opened over a dialog closes one at a time instead of both at once.",
    },
  },
  {
    id: "scroll",
    cells: {
      behaviour: "Counted scroll lock",
      what: "The page unlocks when the last holder releases it, so two overlays never unlock the body under each other. Published as ./behaviors/useScrollLock so host chrome joins the same lock rather than fights it.",
    },
  },
  {
    id: "focusable",
    cells: {
      behaviour: "Shared focusable query",
      what: "One definition of what counts as focusable, used by the overlays and by roving arrow-key navigation, so two components never disagree about what Tab should reach.",
    },
  },
  {
    id: "motion",
    cells: {
      behaviour: "Reduced-motion guard",
      what: "A reduced-motion preference collapses every duration token at the token layer, so a component honours the preference by using the scale rather than by remembering to check.",
    },
  },
];

const keyboardColumns = [
  { key: "key", header: "Key", width: "22%" },
  { key: "does", header: "Behaviour" },
];

const keyboardRows = [
  {
    id: "open",
    cells: {
      key: "On open",
      does: "Focus moves into the panel. In AlertDialog it lands on the cancel button, so the safe action is the one under the first keypress and the destructive one is never a stray Enter away.",
    },
  },
  {
    id: "tab",
    cells: {
      key: "Tab / Shift+Tab",
      does: "Moves through the focusable elements inside the panel, and cannot leave it while the overlay is open.",
    },
  },
  {
    id: "escape",
    cells: {
      key: "Escape",
      does: "Dismisses the topmost overlay only. In AlertDialog it cancels, never confirms.",
    },
  },
  {
    id: "arrows",
    cells: {
      key: "Arrow keys",
      does: "Move through the list in CommandPalette, and between images in Lightbox.",
    },
  },
  {
    id: "close",
    cells: {
      key: "On close",
      does: "Focus returns to the trigger, the body scroll lock releases its hold, and the background stops being inert.",
    },
  },
];

export default function AccessibilityPage() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <Sidebar links={sidebarLinks} />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />

          {/* No PageLinks: the other foundations pages link Storybook's token
              docs because they document tokens, and there is no accessibility
              story to point at. /foundations/themes omits it the same way. */}
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Accessibility</h1>
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Checked by the build, not asserted in a paragraph
            </p>
            <p className={styles.introBody}>
              Every component is audited against WCAG 2.1 Level AA on every change, and a
              violation fails the test suite. The audit runs twice: once per story, where
              a component stands alone, and once over the served site in both themes,
              where the page&apos;s landmarks and heading order exist for the first time.
              The keyboard and focus rules below are assertions, not guidance.
            </p>
          </div>

          {/* Coverage */}
          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="Coverage" divider />
            <p className={styles.sectionNote}>
              Read from the component source rather than claimed.
            </p>
            <div className={styles.statRow}>
              <Stat value={COMPONENT_COUNT} label="Components audited, all of them" />
              <Stat value={STORY_COUNT} label="Stories audited on every change" />
              <Stat
                value={ARIA_COMPONENT_COUNT}
                label="Components declaring ARIA roles and attributes"
              />
              <Stat
                value={ACCESSIBLE_NAME_COUNT}
                label="Components carrying an accessible name in source"
              />
            </div>
          </section>

          {/* Gates */}
          <section className={styles.section}>
            <SectionTitle title="What the build enforces" />
            <p className={styles.sectionNote}>
              Four gates, all in the same run as everything else. None of them is a
              separate ritual somebody has to remember.
            </p>
            <Table
              columns={gateColumns}
              rows={gateRows}
              caption="The four accessibility gates and when each one runs"
              captionHidden
              bordered
            />
          </section>

          {/* Contrast */}
          <section className={styles.section}>
            <SectionTitle title="Themes start from an AA baseline" divider />
            <p className={styles.sectionNote}>
              The shipped themes are examples, and the expectation is that you build your
              own. What travels is the baseline they are built to: an action colour and
              the text on it are resolved through the var() chain and held to the AA
              threshold in light and dark. Every shipped theme clears it, so whichever one
              you start from is a passing starting point.
            </p>
          </section>

          {/* Inherited behaviour */}
          <section className={styles.section}>
            <SectionTitle title="What every component inherits" />
            <p className={styles.sectionNote}>
              The interactive components are built on this repo&apos;s own behaviour layer
              rather than a third-party primitives library, so the keyboard and focus
              rules are written once and shared. {BEHAVIOUR_MODULE_COUNT} modules carry
              them.
            </p>
            <Table
              columns={inheritedColumns}
              rows={inheritedRows}
              caption="The shared behaviour layer and what it guarantees"
              captionHidden
              bordered
            />
          </section>

          {/* Keyboard contract + live demo */}
          <section className={styles.section}>
            <SectionTitle title="The overlay keyboard contract" />
            <p className={styles.sectionNote}>
              {overlayComponents.slice(0, -1).join(", ")} and{" "}
              {overlayComponents.at(-1)} share one contract. Story assertions hold them to
              it, so a regression in any of these rows fails the suite.
            </p>
            <Table
              columns={keyboardColumns}
              rows={keyboardRows}
              caption="Keyboard and focus behaviour shared by the modal overlays"
              captionHidden
              bordered
            />

            <div className={styles.demo}>
              <div className={styles.demoCopy}>
                <span className={styles.demoTitle}>Try it with the keyboard</span>
                <p className={styles.demoBody}>
                  Open the dialog, then press Tab a few times: focus cycles through the
                  three controls and never reaches the page behind. Press Escape and focus
                  lands back on the button you opened it with.
                </p>
              </div>
              <Button
                label="Open dialog"
                variant="secondary"
                onClick={() => setDemoOpen(true)}
              />
            </div>

            <Dialog
              open={demoOpen}
              onOpenChange={setDemoOpen}
              title="Focus is trapped here"
              description="Tab cycles these controls. Escape returns focus to the trigger."
              footer={
                <>
                  <Button
                    label="Cancel"
                    variant="tertiary"
                    onClick={() => setDemoOpen(false)}
                  />
                  <Button
                    label="Confirm"
                    variant="primary"
                    onClick={() => setDemoOpen(false)}
                  />
                </>
              }
            >
              <Input label="A field to tab through" placeholder="Type anything" />
            </Dialog>
          </section>
        </main>
      </div>
    </>
  );
}
