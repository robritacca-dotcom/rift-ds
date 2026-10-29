"use client";

import { Button } from "rift-ds/components/Button/Button";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import ThemeToggle from "../../ThemeToggle/ThemeToggle";
import BrandSwitcher from "../../BrandSwitcher/BrandSwitcher";
import { TEMPLATE_LAYOUTS, setTemplateLayout, type TemplateLayout } from "@/lib/templateLayout";
import { useTemplateLayout } from "../TemplateShell/useTemplateLayout";
import { useIsStaged } from "../useStagedProductName";
import styles from "./SidebarSwitchers.module.css";

/**
 * The template shells' footer controls, on one row: the theme (preset)
 * switcher beside the light/dark toggle, the same pair the site header
 * carries, then the shell layout switch (floating rail or inset surface,
 * shared by every template through TemplateShell) as an icon strip whose
 * labels become tooltips (SegmentedControl's icon-only form). The menu opens upward and
 * left-aligned, because this row sits at the sidebar's floor. One component
 * so every template's rows stay identical, including the sign-in screen,
 * which has no sidebar and carries it on the form pane's floor instead. The
 * layout row shows only where TemplateShell lays the screen out
 * (`showLayout`); elsewhere it would switch nothing. `backLink` stacks the
 * way back to the templates index above the row, for screens whose
 * controls sit in a column of their own.
 */
export default function SidebarSwitchers({
  showLayout = false,
  backLink = false,
}: {
  showLayout?: boolean;
  backLink?: boolean;
}) {
  const layout = useTemplateLayout();
  const row = (
    <div className={`${styles.row} ${showLayout ? styles.rowTight : ""}`}>
      {/* Three controls share the rail's width, so all three go compact
          when the layout switch joins the row. */}
      <BrandSwitcher placement="up" align="left" size={showLayout ? "compact" : "default"} />
      <ThemeToggle size={showLayout ? "compact" : "default"} />
      {showLayout && (
        <SegmentedControl
          segments={[...TEMPLATE_LAYOUTS]}
          value={layout}
          onValueChange={(value) => setTemplateLayout(value as TemplateLayout)}
          aria-label="Layout"
          showLabels={false}
          size="compact"
        />
      )}
    </div>
  );
  if (!backLink) return row;
  return (
    <div className={styles.stack}>
      <TemplatesBackLink />
      {row}
    </div>
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
