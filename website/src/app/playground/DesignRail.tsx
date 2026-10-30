"use client";

import { InspectorSection } from "rift-ds/components/Inspector/InspectorSection";
import { InspectorToggleSwitch } from "rift-ds/components/Inspector/InspectorToggleSwitch";
import { FloatingRail } from "./FloatingRail";
import { DESIGN_SECTIONS } from "./views/DesignView";
import layout from "./page.module.css";

/* The DESIGN.md view's own panel: which parts of the specimen show. A
   viewing choice only, so none of it reaches the theme or the export. */
export default function DesignRail({
  variant,
  hidden,
  onChange,
  collapsed = false,
  onCollapsedChange,
}: {
  /** The right rail on desktop, or bare content inside the compact Drawer. */
  variant: "panel" | "drawer";
  hidden: ReadonlySet<string>;
  onChange: (next: ReadonlySet<string>) => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}) {
  const content = (
    <InspectorSection title="Show" defaultOpen>
      {DESIGN_SECTIONS.map((section) => (
        <InspectorToggleSwitch
          size="compact"
          key={section.id}
          label={section.label}
          checked={!hidden.has(section.id)}
          onCheckedChange={(shown) => {
            const next = new Set(hidden);
            if (shown) next.delete(section.id);
            else next.add(section.id);
            onChange(next);
          }}
        />
      ))}
    </InspectorSection>
  );

  if (variant === "drawer") return <div className={layout.drawerControls}>{content}</div>;

  return (
    <FloatingRail
      side="right"
      label="Specimen controls"
      title="Specimen"
      collapsed={collapsed}
      onCollapsedChange={onCollapsedChange ?? (() => {})}
      onReset={() => onChange(new Set())}
      resetLabel="Show every part"
      resetDisabled={hidden.size === 0}
    >
      {content}
    </FloatingRail>
  );
}
