"use client";

import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import ThemeToggle from "../../ThemeToggle/ThemeToggle";
import BrandSwitcher from "../../BrandSwitcher/BrandSwitcher";
import { TEMPLATE_LAYOUTS, setTemplateLayout, type TemplateLayout } from "@/lib/templateLayout";
import { useTemplateLayout } from "../TemplateShell/useTemplateLayout";
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
 * (`showLayout`); elsewhere it would switch nothing.
 */
export default function SidebarSwitchers({ showLayout = false }: { showLayout?: boolean }) {
  const layout = useTemplateLayout();
  return (
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
}
