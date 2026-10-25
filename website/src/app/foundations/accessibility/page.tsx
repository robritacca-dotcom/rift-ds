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
  BEHAVIOUR_MODULE_COUNT,
  STORIED_COMPONENT_COUNT,
  STORY_COUNT,
  modalOverlays,
  layerComponents,
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
      runs: "Every action fill in every shipped theme, at rest, on hover and when pressed, is resolved through the var() chain and held against the label or icon drawn on it: 4.5:1 for text, 3:1 for icons, in light and dark.",
      when: "The validate-registry chain",
    },
  },
  {
    id: "behaviour",
    cells: {
      gate: "Behaviour assertions",
      runs: "Focus movement, Escape handling and overlay stacking, including a popover, a menu and a tooltip open inside a modal, asserted as story play functions rather than described in a doc.",
      when: "Story tests, on every change",
    },
  },
  {
    id: "names",
    cells: {
      gate: "Names and attributes",
      runs: "Every name a component announces, and every word it writes on screen, is a prop with an English default, so a product in another language can translate what a screen reader reads. The build fails on English written into the markup itself. Every component also passes a consumer's own aria-* attributes and a ref through to its element, proven by rendering each one.",
      when: "The validate-registry chain, and story tests",
    },
  },
];

const reviewColumns = [
  { key: "area", header: "What", width: "24%" },
  { key: "why", header: "Why the build cannot judge it" },
];

const reviewRows = [
  {
    id: "order",
    cells: {
      area: "Tab order on a page",
      why: "The stories prove focus is held inside a dialog and handed back after. Whether Tab moves through a whole page in an order that makes sense is a reading, not a rule.",
    },
  },
  {
    id: "alt",
    cells: {
      area: "Alt text",
      why: "A missing alt fails the audit. One that says nothing useful passes it.",
    },
  },
  {
    id: "contrast",
    cells: {
      area: "Contrast beyond the actions",
      why: "The theme gate holds every action fill against what is drawn on it. Text on surfaces, status colours and chart series are checked by eye, because the colour belongs to whoever owns the theme.",
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
      what: "Tab and Shift+Tab cycle inside an open panel and nowhere else, and the background is marked inert while it is open, except a live region such as the toast stack, which keeps announcing. On close, focus returns to the element that opened it, or to the nearest visible control when that element was hidden in the meantime.",
    },
  },
  {
    id: "layer",
    cells: {
      behaviour: "Layer stack",
      what: "Escape reaches only the topmost overlay, modal or not, so a dialog opened over a dialog, or a menu open inside one, closes one at a time. An outside press closes the popovers and menus above it and stops at the first layer that contains it, so a press on a dialog's backdrop with a menu open closes only the menu.",
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
    id: "anchored",
    cells: {
      behaviour: "Anchored position",
      what: "Every menu, listbox, picker, popover and tooltip is placed against its control so it shows whole: it flips to the other side when one has no room, stays inside the screen, and follows its control on scroll, so content inside a scrolling table or a narrow sidebar is never cut off where a keyboard or magnifier user cannot reach it.",
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
      does: "Dismisses the topmost overlay only, including a popover, menu or visible tooltip open inside the dialog, which closes before the dialog does. In AlertDialog it cancels, never confirms.",
    },
  },
  {
    id: "arrows",
    cells: {
      key: "Arrow keys",
      does: "Move through the list in CommandPalette, and between files in Lightbox and AttachmentViewer.",
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
              Built for whoever reaches it, however they reach it
            </p>
            <p className={styles.introBody}>
              Some people tab through a page. Others hear it read aloud, zoom it to twice
              its size, or switch it to dark at midnight. A component that only works with
              a mouse and perfect eyesight shuts all of them out, and every product built
              from it inherits the same wall. So here accessibility is part of what a
              component is, settled once in the library instead of remembered screen by
              screen.
            </p>
            <p className={styles.introBody}>
              The build holds the line. Every component is audited against WCAG 2.1 Level
              AA on every change, alone and again inside the pages it sits in, and a
              failure stops the change. The rest of this page is what that covers, and
              what still needs a person.
            </p>
          </div>

          {/* Coverage */}
          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="Coverage" divider />
            <div className={styles.statRow}>
              <Stat
                value={`${Math.floor((STORIED_COMPONENT_COUNT / COMPONENT_COUNT) * 100)}%`}
                label="Of components audited against WCAG 2.1 AA"
              />
              <Stat
                value={STORY_COUNT.toLocaleString("en-US")}
                label="Stories rendered and checked on every change"
              />
              <Stat value="4.5:1" label="Contrast every action holds, in every theme" />
              <Stat
                value={layerComponents.length}
                label="Overlays that close one layer at a time"
              />
            </div>
          </section>

          {/* Gates */}
          <section className={styles.section}>
            <SectionTitle title="What the build enforces" />
            <p className={styles.sectionNote}>
              Every gate runs in the same run as everything else. None of them is a
              separate ritual somebody has to remember.
            </p>
            <Table
              columns={gateColumns}
              rows={gateRows}
              caption="The accessibility gates and when each one runs"
              captionHidden
              bordered
            />
          </section>

          {/* Contrast */}
          <section className={styles.section}>
            <SectionTitle title="Themes start from an AA baseline" divider />
            <p className={styles.sectionNote}>
              The shipped themes are examples, and the expectation is that you build your
              own. What travels is the baseline they are built to: every action fill, at
              rest, on hover and when pressed, is resolved through the var() chain and
              held against the label or icon drawn on it, AA for text and 3:1 for icons,
              in light and dark. Every shipped theme clears it, so whichever one
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
              {modalOverlays.slice(0, -1).join(", ")} and{" "}
              {modalOverlays.at(-1)} share one contract, because they share the code
              behind it: the dialog stories assert every row below, so a regression in
              the shared layer fails the suite for all of them. The popovers,
              menus, pickers and tooltips do not hold focus, but they dismiss through the
              same stack, so Escape and an outside press reach them first:{" "}
              {layerComponents.length} components in all answer to it.
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
                  dialog’s controls and never reaches the page behind. Press Escape and focus
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

          {/* What the build leaves to a person */}
          <section className={styles.section}>
            <SectionTitle title="What still needs a person" />
            <p className={styles.sectionNote}>
              axe finds roughly a third of WCAG failures. These are the ones that need
              someone reading the page.
            </p>
            <Table
              columns={reviewColumns}
              rows={reviewRows}
              caption="Accessibility checks the build leaves to human review"
              captionHidden
              bordered
            />
          </section>
        </main>
      </div>
    </>
  );
}
