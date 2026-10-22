"use client";

import { InspectorDropdown } from "rift-ds/components/Inspector/InspectorDropdown";
import { InspectorInput } from "rift-ds/components/Inspector/InspectorInput";
import { InspectorSection } from "rift-ds/components/Inspector/InspectorSection";
import { InspectorToggleSwitch } from "rift-ds/components/Inspector/InspectorToggleSwitch";
import { FloatingRail } from "./FloatingRail";
import { RENDERED_TIERS, tierAnchor } from "./views/TypeView";
import layout from "./page.module.css";

/* ============================================
   The type rail: the Type view's own panel. What the specimen sets, and
   which tiers it shows. The text is the reviewer's, not the theme's: none
   of it reaches the export.
   ============================================ */

/** Ready-made specimens, each picked to stress something the default does
    not: interface copy reads at working sizes, figures show the numerals,
    and the accented and non-Latin lines show where a face runs out of
    glyphs (a DESIGN.md import often lands on a face that does). */
export const TYPE_SAMPLES = [
  {
    value: "story",
    label: "Story",
    heading: "Almost before we knew it, we had left the ground.",
    body: "Almost before we knew it, we had left the ground.",
  },
  {
    value: "interface",
    label: "Interface",
    heading: "Billing and plans",
    body: "Your plan renews on 1 November. Change seats or cancel any time from Billing.",
  },
  {
    value: "figures",
    label: "Figures",
    heading: "$24,380 up 8.4% on 1,286",
    body: "Invoice 0418 for $1,240.50 is due on 01/11/2026, with 3 of 12 seats unused.",
  },
  {
    value: "accents",
    label: "Accents and scripts",
    heading: "Façade, naïve, Ångström",
    body: "Zürich, Łódź, São Paulo, Đà Nẵng, Αθήνα, Москва",
  },
] as const;

export type TypeSampleId = (typeof TYPE_SAMPLES)[number]["value"] | "custom";

export const DEFAULT_TYPE_SAMPLE = TYPE_SAMPLES[0];

const SAMPLE_OPTIONS = [
  ...TYPE_SAMPLES.map(({ value, label }) => ({ value, label })),
  { value: "custom", label: "Your own" },
];

export interface TypeRailState {
  sample: TypeSampleId;
  heading: string;
  body: string;
  hiddenTiers: ReadonlySet<string>;
}

export default function TypeRail({
  variant,
  state,
  onChange,
  collapsed = false,
  onCollapsedChange,
}: {
  /** The right rail on desktop, or bare content inside the compact Drawer. */
  variant: "panel" | "drawer";
  state: TypeRailState;
  onChange: (next: TypeRailState) => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}) {
  const pickSample = (value: string) => {
    const preset = TYPE_SAMPLES.find((sample) => sample.value === value);
    /* "Your own" keeps whatever is in the fields; a preset fills them. */
    onChange(
      preset
        ? { ...state, sample: preset.value, heading: preset.heading, body: preset.body }
        : { ...state, sample: "custom" },
    );
  };

  const toggleTier = (title: string, shown: boolean) => {
    const hidden = new Set(state.hiddenTiers);
    if (shown) hidden.delete(title);
    else hidden.add(title);
    onChange({ ...state, hiddenTiers: hidden });
    /* Switching a tier on takes you to it. */
    if (shown) {
      requestAnimationFrame(() =>
        document.getElementById(tierAnchor(title))?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    }
  };

  const content = (
    <>
      <InspectorSection title="Sample text" defaultOpen>
        <InspectorDropdown
          size="compact"
          label="Specimen"
          value={state.sample}
          options={SAMPLE_OPTIONS}
          onValueChange={pickSample}
        />
        {/* Typing makes the text your own, whatever preset it started as. */}
        <InspectorInput
          size="compact"
          label="Headings"
          value={state.heading}
          onValueChange={(heading) => onChange({ ...state, sample: "custom", heading })}
        />
        <InspectorInput
          size="compact"
          label="Body"
          value={state.body}
          onValueChange={(body) => onChange({ ...state, sample: "custom", body })}
        />
      </InspectorSection>
      <InspectorSection title="Show" defaultOpen>
        {RENDERED_TIERS.map((tier) => (
          <InspectorToggleSwitch
            size="compact"
            key={tier.title}
            label={tier.title}
            checked={!state.hiddenTiers.has(tier.title)}
            onCheckedChange={(shown) => toggleTier(tier.title, shown)}
          />
        ))}
      </InspectorSection>
    </>
  );

  if (variant === "drawer") {
    return <div className={layout.drawerControls}>{content}</div>;
  }

  const atDefault =
    state.sample === DEFAULT_TYPE_SAMPLE.value && state.hiddenTiers.size === 0;

  return (
    <FloatingRail
      side="right"
      label="Type controls"
      title="Typography"
      collapsed={collapsed}
      onCollapsedChange={onCollapsedChange ?? (() => {})}
      onReset={() =>
        onChange({
          sample: DEFAULT_TYPE_SAMPLE.value,
          heading: DEFAULT_TYPE_SAMPLE.heading,
          body: DEFAULT_TYPE_SAMPLE.body,
          hiddenTiers: new Set(),
        })
      }
      resetLabel="Reset the specimen"
      resetDisabled={atDefault}
    >
      {content}
    </FloatingRail>
  );
}
