"use client";

import { Button } from "rift-ds/components/Button/Button";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import ThemeToggle from "../../ThemeToggle/ThemeToggle";
import BrandSwitcher from "../../BrandSwitcher/BrandSwitcher";
import type { ChatBackdrop } from "rift-ds/chat";
import {
  CHAT_BACKDROPS,
  TEMPLATE_LAYOUTS,
  setChatBackdrop,
  setTemplateLayout,
  type TemplateLayout,
  type TemplateLayoutScope,
} from "@/lib/templateLayout";
import { useChatBackdrop, useTemplateLayout } from "../TemplateShell/useTemplateLayout";
import { useIsStaged } from "../useStagedProductName";
import styles from "./SidebarSwitchers.module.css";

/**
 * The template shells' footer controls. Without the layout switch they
 * share one row: the theme (preset) switcher beside the light/dark
 * toggle, the same pair the site header carries. With it (`showLayout`,
 * only where TemplateShell lays the screen out; elsewhere it would switch
 * nothing) they stack one per row, because a three-way shell strip beside
 * the pair runs past the rail's width: the theme, the colour mode, the
 * shell (flush, floating or inset, shared by every template), and on the
 * chat home in flush the backdrop (blur or solid) under it: blur says a
 * chat rests above something, so a template, always the floor, has none. The strips are icon-only,
 * their labels tooltips (SegmentedControl's icon-only form). The menu opens
 * upward and left-aligned, because these sit at the sidebar's floor. One
 * component so every template's rows stay identical, including the sign-in
 * screen, which has no sidebar and carries it on the form pane's floor
 * instead. `backLink` stacks the way back to the templates index above
 * them, for screens whose controls sit in a column of their own. `scope`
 * names whose choice the switches write: every template's (the default),
 * or the chat home's, which keeps its own.
 */
export default function SidebarSwitchers({
  showLayout = false,
  backLink = false,
  scope = "templates",
}: {
  showLayout?: boolean;
  backLink?: boolean;
  scope?: TemplateLayoutScope;
}) {
  const layout = useTemplateLayout(scope);
  const backdrop = useChatBackdrop();
  const controls = showLayout ? (
    <div className={styles.column}>
      <BrandSwitcher placement="up" align="left" />
      <ThemeToggle />
      {/* Below the mobile breakpoint every mode gives way to the plain
          page, so the shell switch would change nothing there; it hides. */}
      <div className={styles.shellSwitch}>
        <SegmentedControl
          segments={[...TEMPLATE_LAYOUTS]}
          value={layout}
          onValueChange={(value) => setTemplateLayout(value as TemplateLayout, scope)}
          aria-label="Layout"
          showLabels={false}
        />
      </div>
      {scope === "chat" && layout === "flush" && (
        <SegmentedControl
          segments={[...CHAT_BACKDROPS]}
          value={backdrop}
          onValueChange={(value) => setChatBackdrop(value as ChatBackdrop)}
          aria-label="Backdrop"
          showLabels={false}
        />
      )}
    </div>
  ) : (
    <div className={styles.row}>
      <BrandSwitcher placement="up" align="left" />
      <ThemeToggle />
    </div>
  );
  if (!backLink) return controls;
  return (
    <div className={styles.stack}>
      <TemplatesBackLink />
      {controls}
    </div>
  );
}

/**
 * The footer row's collapsed form, for AppSidebar's `collapsedFooterSlot`:
 * the same controls in the same order, each at its smallest, the way the
 * site header seats them in its condensed bar (SiteHeader's
 * `condensedActions`): the compact theme trigger, then the colour mode
 * toggle and the layout switch as `cycle` circles, SegmentedControl's
 * one-circle form that steps through the set. The rail stacks and centres
 * them. `showLayout` follows the row's: the layout circle shows only where
 * the strip would.
 */
export function CollapsedSidebarSwitchers({
  showLayout = false,
  scope = "templates",
}: {
  showLayout?: boolean;
  scope?: TemplateLayoutScope;
}) {
  const layout = useTemplateLayout(scope);
  const backdrop = useChatBackdrop();
  return (
    <>
      <BrandSwitcher placement="up" align="left" size="compact" />
      <ThemeToggle size="compact" cycle />
      {showLayout && (
        <SegmentedControl
          segments={[...TEMPLATE_LAYOUTS]}
          value={layout}
          onValueChange={(value) => setTemplateLayout(value as TemplateLayout, scope)}
          aria-label="Layout"
          size="compact"
          cycle
        />
      )}
      {showLayout && scope === "chat" && layout === "flush" && (
        <SegmentedControl
          segments={[...CHAT_BACKDROPS]}
          value={backdrop}
          onValueChange={(value) => setChatBackdrop(value as ChatBackdrop)}
          aria-label="Backdrop"
          size="compact"
          cycle
        />
      )}
    </>
  );
}

/**
 * The way back to the templates index from a template at its own route.
 * Staged in the playground, the screen is a stranger's product in a frame,
 * so the link is not drawn.
 */
export function TemplatesBackLink() {
  const staged = useIsStaged();
  if (staged) return null;
  return (
    <Button
      href="/templates"
      label="Templates"
      iconLeft="arrow_back"
      variant="tertiary"
      size="compact"
    />
  );
}
