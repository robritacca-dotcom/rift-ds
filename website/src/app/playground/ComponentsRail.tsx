"use client";

import { InspectorSection } from "rift-ds/components/Inspector/InspectorSection";
import { InspectorSegmentedControl } from "rift-ds/components/Inspector/InspectorSegmentedControl";
import { InspectorToggleSwitch } from "rift-ds/components/Inspector/InspectorToggleSwitch";
import { FloatingRail } from "./FloatingRail";
import layout from "./page.module.css";

/* ============================================
   The components rail: the Components view's own panel. Which sections
   the showcase shows, and what they sit on. Viewing choices only: none of
   it reaches the theme or the export.
   ============================================ */

/** The showcase's sections, in stage order. The page renders each by id,
    so this list is the one place their order and names live. */
export const COMPONENT_SECTIONS = [
  { id: "charts", label: "Charts" },
  { id: "maps", label: "Maps" },
  { id: "data-display", label: "Data display" },
  { id: "product-header", label: "Product header" },
  { id: "actions", label: "Actions" },
  { id: "ai", label: "AI" },
  { id: "forms", label: "Forms and inputs" },
  { id: "navigation", label: "Navigation" },
  { id: "overlays", label: "Overlays" },
  { id: "feedback", label: "Feedback and status" },
] as const;

export type ComponentSectionId = (typeof COMPONENT_SECTIONS)[number]["id"];

/** A section's element id, so switching one on can scroll to it. */
export const sectionAnchor = (id: string) => `components-${id}`;

/** What the sections sit on: the dotted page itself, or a container card,
    since a theme can read well on one and badly on the other. */
export type ComponentsSurface = "page" | "card";

export interface ComponentsRailState {
  hidden: ReadonlySet<string>;
  surface: ComponentsSurface;
}

export default function ComponentsRail({
  variant,
  state,
  onChange,
  collapsed = false,
  onCollapsedChange,
}: {
  /** The right rail on desktop, or bare content inside the compact Drawer. */
  variant: "panel" | "drawer";
  state: ComponentsRailState;
  onChange: (next: ComponentsRailState) => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}) {
  const toggle = (id: string, shown: boolean) => {
    const hidden = new Set(state.hidden);
    if (shown) hidden.delete(id);
    else hidden.add(id);
    onChange({ ...state, hidden });
    /* Switching a section on takes you to it. */
    if (shown) {
      requestAnimationFrame(() =>
        document.getElementById(sectionAnchor(id))?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    }
  };

  const content = (
    <>
      <InspectorSection title="Surface" defaultOpen>
        <InspectorSegmentedControl
          size="compact"
          label="Sit on"
          value={state.surface}
          options={[
            { value: "page", label: "Page" },
            { value: "card", label: "Card" },
          ]}
          onValueChange={(surface) => onChange({ ...state, surface: surface as ComponentsSurface })}
        />
      </InspectorSection>
      <InspectorSection title="Show" defaultOpen>
        {COMPONENT_SECTIONS.map((section) => (
          <InspectorToggleSwitch
            size="compact"
            key={section.id}
            label={section.label}
            checked={!state.hidden.has(section.id)}
            onCheckedChange={(shown) => toggle(section.id, shown)}
          />
        ))}
      </InspectorSection>
    </>
  );

  if (variant === "drawer") {
    return <div className={layout.drawerControls}>{content}</div>;
  }

  return (
    <FloatingRail
      side="right"
      label="Components controls"
      title="Components"
      collapsed={collapsed}
      onCollapsedChange={onCollapsedChange ?? (() => {})}
      onReset={() => onChange({ hidden: new Set(), surface: "page" })}
      resetLabel="Show every section"
      resetDisabled={state.hidden.size === 0 && state.surface === "page"}
    >
      {content}
    </FloatingRail>
  );
}
