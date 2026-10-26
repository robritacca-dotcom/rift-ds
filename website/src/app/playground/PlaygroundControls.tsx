"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./page.module.css";
import { FloatingRail } from "./FloatingRail";
import { Button } from "rift-ds/components/Button/Button";
import { SplitButton } from "rift-ds/components/SplitButton/SplitButton";
import { MOTION_FEEDBACK_RESET_MS } from "rift-ds/tokens/motion";
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import { Swatch } from "rift-ds/components/Swatch/Swatch";
import {
  ACTION_COLOR_PRESETS,
  ICON_WEIGHT_RANGE,
  LEVER_RANGES,
  TEXT_TONES,
  LOGO_END_TONES,
  LOGO_TONES,
  TEXT_TONE_LABELS,
  TYPE_WEIGHT_RANGE,
  leverWord,
  motionScaleFromSpeed,
  motionSpeedPercent,
  type ElevationVariant,
  type LogoEndTone,
  type LogoTone,
  type TextTone,
  type ToneRole,
} from "@/lib/theme/theme-overrides";
import { RichDropdown } from "rift-ds/components/RichDropdown/RichDropdown";
import { InspectorColorPicker } from "rift-ds/components/Inspector/InspectorColorPicker";
import { InspectorDropdown } from "rift-ds/components/Inspector/InspectorDropdown";
import { InspectorInput } from "rift-ds/components/Inspector/InspectorInput";
import { InspectorSection } from "rift-ds/components/Inspector/InspectorSection";
import { InspectorSegmentedControl } from "rift-ds/components/Inspector/InspectorSegmentedControl";
import { InspectorSlider } from "rift-ds/components/Inspector/InspectorSlider";
import { InspectorToggleSwitch } from "rift-ds/components/Inspector/InspectorToggleSwitch";
import { fontPickerOptions, presetPickerOptions } from "@/lib/theme/presets";

/** What each tone choice's swatch shows: the role's default as it stands
    (the action fill, or the logo's own first colour), the ink of the mode
    in view, and each family at its key, live with any re-keyed ramp. */
const toneSwatchColour = (tone: LogoTone | LogoEndTone): string =>
  tone === "action"
    ? "var(--color-action-primary-bg)"
    : tone === "matched"
      ? "var(--color-brand-mark)"
      : tone === "ink"
        ? "var(--color-bg-page-inverse)"
        : `var(--primitive-${tone}-07)`;

const toneOptions = <T extends LogoTone | LogoEndTone>(tones: readonly T[]) =>
  tones.map((tone) => ({ value: tone, label: TEXT_TONE_LABELS[tone], colour: toneSwatchColour(tone) }));

const TONE_OPTIONS = toneOptions(TEXT_TONES);
const LOGO_TONE_OPTIONS = toneOptions(LOGO_TONES);
const LOGO_END_TONE_OPTIONS = toneOptions(LOGO_END_TONES);

/**
 * One colour role's picker, laid out like the action colour's: a swatch per
 * choice, then a custom colour, which re-keys the family nearest it (see
 * pickToneHex on the page). The step each mode shows is still picked to
 * hold the role's contrast (tierToneOverrides).
 */
function TonePicker<T extends string>({
  heading,
  ariaLabel,
  value,
  options,
  customHex,
  customActive,
  onValueChange,
  onCustom,
}: {
  heading: string;
  ariaLabel: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string; colour: string }>;
  customHex: string;
  customActive: boolean;
  onValueChange: (value: T) => void;
  onCustom: (hex: string) => void;
}) {
  return (
    <div className={styles.controlGroup}>
      <span className={styles.controlHeading}>{heading}</span>
      <div className={styles.swatchGrid} role="group" aria-label={ariaLabel}>
        {options.map((o) => (
          <Swatch
            key={o.value}
            value={o.colour}
            label={o.label}
            selected={value === o.value}
            onClick={() => onValueChange(o.value)}
          />
        ))}
      </div>
      <InspectorColorPicker
        size="compact"
        label="Custom colour"
        value={customHex}
        onValueChange={onCustom}
        className={customActive ? styles.customPickerActive : ""}
      />
    </div>
  );
}

export interface PlaygroundControlsProps {
  preset: string;
  /** The action colour being previewed (theme-resolved). */
  brand: string;
  /** Active site theme — resolves the theme-dependent neutral swatches
      (the flip itself lives in the stage's bottom control bar). */
  theme: string;
  tintOn: boolean;
  tintSeed: string;
  tintStrength: number;
  radiusScale: number;
  pill: boolean;
  /** Spacing-ladder scale in percent; 100 is the shipped grid. */
  density: number;
  /** Type-ladder scale in percent; 100 is the shipped scale. */
  typeScale: number;
  /** Schedule-duration scale in percent; under 100 is snappier. */
  motionScale: number;
  elevation: ElevationVariant;
  /** Display-tier weight (Mega, Display, Sub Display). */
  displayWeight: number;
  /** Heading-tier weight (Headings 1 to 3, Title Body). */
  headingWeight: number;
  /** Body-tier weight: the paragraph's, with emphasis and labels shifted
      by the same amount. */
  bodyWeight: number;
  /** Letter-spacing offset in percent of an em; 0 is the shipped tracking. */
  tracking: number;
  /** Icon stroke weight on the icon font's weight axis. */
  iconWeight: number;
  iconFill: boolean;
  logoTone: LogoTone;
  logoEndTone: LogoEndTone;
  displayTone: TextTone;
  headingTone: TextTone;
  textTone: TextTone;
  fontLabel: string;
  headingFontLabel: string;
  productName: string;
  isPristine: boolean;
  cssSnippet: string;
  /** The themed AGENTS.md: the agent starter with this theme and its CSS
      set in, the one file a coding agent needs. */
  agentsMd: string;
  /** The same theme as separate pieces, for whoever wants one on its own:
      THEME.md (the look in words) and a setup prompt for a coding agent. */
  themeMd: string;
  agentPrompt: string;
  /** View-specific control groups (e.g. the chat view's transport picker),
      slotted after the shared levers so those never shift between views —
      the rail stays consistent where the views agree and contextual where
      they differ. */
  contextual?: ReactNode;
  /** How the controls are hosted: the desktop floating panel (default), or
      bare content for the mobile Drawer, which brings its own shell,
      scroll, and title. Render one host at a time — two at once would
      collide on the radio group names. */
  variant?: "panel" | "drawer";
  onPreset: (value: string) => void;
  /** `darkValue` rides along for the theme-dependent neutral swatches. */
  onBrand: (value: string, darkValue?: string) => void;
  onTintOn: (value: boolean) => void;
  onTintSeed: (value: string) => void;
  onTintStrength: (value: number) => void;
  onRadiusScale: (value: number) => void;
  onPill: (value: boolean) => void;
  onDensity: (value: number) => void;
  onTypeScale: (value: number) => void;
  onMotionScale: (value: number) => void;
  onElevation: (value: ElevationVariant) => void;
  onDisplayWeight: (value: number) => void;
  onHeadingWeight: (value: number) => void;
  onBodyWeight: (value: number) => void;
  onTracking: (value: number) => void;
  onIconWeight: (value: number) => void;
  onIconFill: (value: boolean) => void;
  onLogoTone: (value: LogoTone) => void;
  onLogoEndTone: (value: LogoEndTone) => void;
  onDisplayTone: (value: TextTone) => void;
  onHeadingTone: (value: TextTone) => void;
  onTextTone: (value: TextTone) => void;
  /** Each tone role's custom colour as the picker shows it, and whether a
      custom colour is what the role currently wears. */
  toneCustom: Record<ToneRole | "logoEnd", { hex: string; active: boolean }>;
  /** A custom colour for one role: re-keys the nearest family and takes it. */
  onToneCustom: (role: ToneRole | "logoEnd", hex: string) => void;
  onFontLabel: (value: string) => void;
  onHeadingFontLabel: (value: string) => void;
  onProductName: (value: string) => void;
  /** File name of the image or DESIGN.md the theme was read from, when
      there is one. */
  imageName?: string;
  /** True while a dropped or chosen file is being read. */
  imageBusy?: boolean;
  /** Why the last file could not be used, if it could not. */
  imageError?: string;
  /** Opens the file picker for the theme source, picture or DESIGN.md. */
  onPickImage: () => void;
  /** Drops the source file. The levers it moved stay where they are. */
  onClearImage: () => void;
  onReset: () => void;
  /** Opens the advanced-mode dialog (every primitive ramp). */
  onOpenAdvanced: () => void;
  /** Opens the export dialog on the themed AGENTS.md. */
  onExport: () => void;
  /** The floating panel is folded into its toggle (panel variant only). */
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

/** The sticky theme-control rail — presentational; all state lives in the page. */
export default function PlaygroundControls({
  preset,
  brand,
  theme,
  tintOn,
  tintSeed,
  tintStrength,
  radiusScale,
  pill,
  density,
  typeScale,
  motionScale,
  elevation,
  displayWeight,
  headingWeight,
  bodyWeight,
  tracking,
  iconWeight,
  iconFill,
  logoTone,
  logoEndTone,
  displayTone,
  headingTone,
  textTone,
  fontLabel,
  headingFontLabel,
  productName,
  isPristine,
  cssSnippet,
  agentsMd,
  themeMd,
  agentPrompt,
  contextual,
  variant = "panel",
  onPreset,
  onBrand,
  onTintOn,
  onTintSeed,
  onTintStrength,
  onRadiusScale,
  onPill,
  onDensity,
  onTypeScale,
  onMotionScale,
  onElevation,
  onDisplayWeight,
  onHeadingWeight,
  onBodyWeight,
  onTracking,
  onIconWeight,
  onIconFill,
  onLogoTone,
  onLogoEndTone,
  onDisplayTone,
  onHeadingTone,
  onTextTone,
  toneCustom,
  onToneCustom,
  onFontLabel,
  onHeadingFontLabel,
  onProductName,
  imageName,
  imageBusy = false,
  imageError,
  onPickImage,
  onClearImage,
  onReset,
  onOpenAdvanced,
  onExport,
  collapsed = false,
  onCollapsedChange = () => {},
}: PlaygroundControlsProps) {
  /* Theme-dependent entries (the neutrals) show and match their dark-mode
     counterpart while dark mode is active. */
  const dark = theme === "dark";
  const presetHex = (p: (typeof ACTION_COLOR_PRESETS)[number]) =>
    dark && p.hexDark ? p.hexDark : p.hex;
  const presetLabel = (p: (typeof ACTION_COLOR_PRESETS)[number]) =>
    dark && p.labelDark ? p.labelDark : p.label;

  const isCustomBrand = !ACTION_COLOR_PRESETS.some(
    (p) => presetHex(p) === brand.toUpperCase()
  );

  /* Every option is a self-portrait: the preset's own faces and key colour,
     resolved for the active theme. "Custom" is a state you land in by
     touching a lever, not a look you pick — it only appears in the list
     while it is the active value, drawn from the live levers. */
  const allPresetOptions = presetPickerOptions({
    theme: dark ? "dark" : "light",
    custom: { brand, fontLabel, headingFontLabel, radiusScale, pill },
  });
  const presetOptions =
    preset === "custom"
      ? allPresetOptions
      : allPresetOptions.filter((o) => o.value !== "custom");

  type CopyWhat = "css" | "agents" | "theme" | "prompt";
  const [copied, setCopied] = useState<CopyWhat | null>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    };
  }, []);

  const copyText: Record<CopyWhat, string> = {
    css: cssSnippet,
    agents: agentsMd,
    theme: themeMd,
    prompt: agentPrompt,
  };
  const copiedLabel: Record<CopyWhat, string> = {
    css: "Copied",
    agents: "Copied AGENTS.md",
    theme: "Copied THEME.md",
    prompt: "Copied prompt",
  };
  const copy = async (what: CopyWhat) => {
    try {
      await navigator.clipboard.writeText(copyText[what]);
      setCopied(what);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(null), MOTION_FEEDBACK_RESET_MS);
    } catch {
      // Clipboard unavailable (permissions): the export dialog's code
      // blocks still offer their own copy and download.
    }
  };

  const content = (
    <>
      <InspectorSection title="Theme" defaultOpen>
        <div className={styles.controlGroup}>
          <RichDropdown
            aria-label="Theme preset"
            value={preset}
            options={presetOptions}
            onValueChange={onPreset}
          />
        </div>

        <div className={styles.controlGroup}>
          <InspectorInput
            size="compact"
            label="Product name"
            placeholder="Acme Corp"
            value={productName}
            onValueChange={onProductName}
          />
        </div>
      </InspectorSection>

      <InspectorSection title="Colour" defaultOpen>
        {/* Colour sits high and every shared lever keeps one fixed slot in
            all views — the contextual sections render at the bottom, so
            nothing above them ever shifts. */}
        <div className={styles.controlGroup}>
          <span className={styles.controlHeading}>Action colour</span>
          <div
            className={styles.swatchGrid}
            role="group"
            aria-label="Action colour"
          >
            {ACTION_COLOR_PRESETS.map((p) => (
              <Swatch
                key={p.hex}
                value={presetHex(p)}
                label={presetLabel(p)}
                selected={brand.toUpperCase() === presetHex(p)}
                onClick={() => onBrand(p.hex, p.hexDark)}
              />
            ))}
          </div>
          <InspectorColorPicker
            size="compact"
            label="Custom colour"
            value={brand}
            onValueChange={onBrand}
            className={isCustomBrand ? styles.customPickerActive : ""}
          />
          <Button
            size="compact"
            label="All colour ramps"
            variant="primary"
            tone="neutral"
            iconLeft="palette"
            onClick={onOpenAdvanced}
          />
        </div>

        {/* Theming from a picture or a DESIGN.md: the same levers, moved all
            at once. The drop target is the whole tool, so this button is the
            keyboard and touch route to the same thing. */}
        <div className={styles.controlGroup}>
          <Button
            size="compact"
            label={imageBusy ? "Reading the file" : "Upload image or DESIGN.md"}
            variant="primary"
            tone="neutral"
            iconLeft={imageBusy ? "progress_activity" : "add_photo_alternate"}
            disabled={imageBusy}
            onClick={onPickImage}
          />
          {imageName ? (
            <div className={styles.imageSourceRow}>
              <span className={styles.imageSourceName} title={imageName}>
                {imageName}
              </span>
              <CircularButton
                icon="close"
                variant="primary"
                tone="neutral"
                size="compact"
                ariaLabel="Remove the theme source file"
                onClick={onClearImage}
              />
            </div>
          ) : (
            /* No standing instruction under the button: the whole page is
               the drop target, and a note explaining that earns less than
               the space it takes. Only a failure has something to say. */
            imageError && <p className={styles.controlNote}>{imageError}</p>
          )}
        </div>

        <div className={styles.controlGroup}>
          <InspectorToggleSwitch
            size="compact"
            label="Tint neutrals"
            checked={tintOn}
            onCheckedChange={onTintOn}
          />
          {tintOn && (
            <>
              <InspectorColorPicker
                size="compact"
                label="Tint colour"
                value={tintSeed}
                onValueChange={onTintSeed}
              />
              <InspectorSlider
                size="compact"
                label="Tint strength"
                value={tintStrength}
                min={0}
                max={16}
                step={1}
                onValueChange={onTintStrength}
                format={(v) => `${v}%`}
              />
            </>
          )}
        </div>
      </InspectorSection>

      <InspectorSection title="Shape, space and motion" defaultOpen>
        {/* Sliders in percent of the shipped ladders. */}
        <div className={styles.controlGroup}>
          <InspectorSlider
            size="compact"
            label="Corner radius"
            value={radiusScale}
            {...LEVER_RANGES.radius}
            onValueChange={onRadiusScale}
            format={(v) => `${leverWord("radius", v)} ${v}%`}
          />
          <InspectorToggleSwitch
            size="compact"
            label="Pill buttons"
            checked={pill}
            onCheckedChange={onPill}
          />
        </div>

        <div className={styles.controlGroup}>
          <InspectorSegmentedControl
            size="compact"
            label="Elevation"
            value={elevation}
            options={[
              { value: "default", label: "Default" },
              { value: "flat", label: "Flat" },
              { value: "soft", label: "Soft" },
            ]}
            onValueChange={(value) => onElevation(value as ElevationVariant)}
          />
        </div>

        <div className={styles.controlGroup}>
          <InspectorSlider
            size="compact"
            label="Density"
            value={density}
            {...LEVER_RANGES.density}
            onValueChange={onDensity}
            format={(v) => `${leverWord("density", v)} ${v}%`}
          />
          {/* Presented as speed, so right means faster; the conversion's
              doc block in theme-overrides owns why. */}
          <InspectorSlider
            size="compact"
            label="Motion"
            value={motionSpeedPercent(motionScale)}
            {...LEVER_RANGES.motion}
            onValueChange={(speed) => onMotionScale(motionScaleFromSpeed(speed))}
            format={(v) => `${leverWord("motion", v)} ${v}%`}
          />
        </div>
      </InspectorSection>

      <InspectorSection title="Icons" defaultOpen>
        <div className={styles.controlGroup}>
          <InspectorSlider
            size="compact"
            label="Icon weight"
            value={iconWeight}
            {...ICON_WEIGHT_RANGE}
            onValueChange={onIconWeight}
          />
          <InspectorToggleSwitch
            size="compact"
            label="Filled icons"
            checked={iconFill}
            onCheckedChange={onIconFill}
          />
        </div>
      </InspectorSection>

      {/* The logo apart from the action colour: its mark is a gradient, so
          it takes a first colour and, for a two-tone mark, an end one. */}
      <InspectorSection title="Logo" defaultOpen>
        <TonePicker
          heading="Logo colour"
          ariaLabel="Logo colour"
          value={logoTone}
          options={LOGO_TONE_OPTIONS}
          customHex={toneCustom.logo.hex}
          customActive={toneCustom.logo.active}
          onValueChange={onLogoTone}
          onCustom={(hex) => onToneCustom("logo", hex)}
        />
        <TonePicker
          heading="Logo gradient end"
          ariaLabel="Logo end colour"
          value={logoEndTone}
          options={LOGO_END_TONE_OPTIONS}
          customHex={toneCustom.logoEnd.hex}
          customActive={toneCustom.logoEnd.active}
          onValueChange={onLogoEndTone}
          onCustom={(hex) => onToneCustom("logoEnd", hex)}
        />
      </InspectorSection>

      {/* Type in its three tiers, each with its colour and weight, then the
          levers every tier shares. The heading face also sets the display
          tier, which has no face of its own. */}
      <InspectorSection title="Display" defaultOpen>
        <TonePicker
          heading="Display colour"
          ariaLabel="Display colour"
          value={displayTone}
          options={TONE_OPTIONS}
          customHex={toneCustom.display.hex}
          customActive={toneCustom.display.active}
          onValueChange={onDisplayTone}
          onCustom={(hex) => onToneCustom("display", hex)}
        />
        <div className={styles.controlGroup}>
          <InspectorSlider
            size="compact"
            label="Weight"
            value={displayWeight}
            {...TYPE_WEIGHT_RANGE}
            onValueChange={onDisplayWeight}
          />
        </div>
      </InspectorSection>

      <InspectorSection title="Headings" defaultOpen>
        <div className={`${styles.controlGroup} ${styles.dropUp}`}>
          <InspectorDropdown
            size="compact"
            label="Typeface"
            value={headingFontLabel}
            options={fontPickerOptions("heading", fontLabel)}
            onValueChange={onHeadingFontLabel}
          />
          <p className={styles.controlNote}>Display type uses this face too.</p>
        </div>
        <TonePicker
          heading="Heading colour"
          ariaLabel="Heading colour"
          value={headingTone}
          options={TONE_OPTIONS}
          customHex={toneCustom.heading.hex}
          customActive={toneCustom.heading.active}
          onValueChange={onHeadingTone}
          onCustom={(hex) => onToneCustom("heading", hex)}
        />
        <div className={styles.controlGroup}>
          <InspectorSlider
            size="compact"
            label="Weight"
            value={headingWeight}
            {...TYPE_WEIGHT_RANGE}
            onValueChange={onHeadingWeight}
          />
        </div>
      </InspectorSection>

      <InspectorSection title="Body" defaultOpen>
        <div className={`${styles.controlGroup} ${styles.dropUp}`}>
          <InspectorDropdown
            size="compact"
            label="Typeface"
            value={fontLabel}
            options={fontPickerOptions("body", fontLabel)}
            onValueChange={onFontLabel}
          />
        </div>
        <TonePicker
          heading="Text colour"
          ariaLabel="Text colour"
          value={textTone}
          options={TONE_OPTIONS}
          customHex={toneCustom.text.hex}
          customActive={toneCustom.text.active}
          onValueChange={onTextTone}
          onCustom={(hex) => onToneCustom("text", hex)}
        />
        <div className={styles.controlGroup}>
          <InspectorSlider
            size="compact"
            label="Weight"
            value={bodyWeight}
            {...TYPE_WEIGHT_RANGE}
            onValueChange={onBodyWeight}
          />
        </div>
      </InspectorSection>

      <InspectorSection title="General" defaultOpen>
        <div className={styles.controlGroup}>
          <InspectorSlider
            size="compact"
            label="Type scale"
            value={typeScale}
            {...LEVER_RANGES.typeScale}
            onValueChange={onTypeScale}
            format={(v) => `${leverWord("typeScale", v)} ${v}%`}
          />
          {/* Percent of an em, added to each style's shipped tracking. */}
          <InspectorSlider
            size="compact"
            label="Tracking"
            value={tracking}
            {...LEVER_RANGES.tracking}
            onValueChange={onTracking}
            format={(v) => `${leverWord("tracking", v)} ${v > 0 ? "+" : ""}${v}%`}
          />
        </div>
      </InspectorSection>

      {contextual}
    </>
  );

  const footer = (
    <div className={styles.railFooter}>
          <SplitButton
            size="compact"
            className={styles.railSplit}
            label={copied ? copiedLabel[copied] : "Copy CSS"}
            /* Secondary: the theme's one-file export below is the primary
               way to take it away; the CSS and the separate pieces are for
               whoever wants just one. */
            variant="secondary"
            iconLeft={copied ? "check" : "content_copy"}
            disabled={isPristine}
            onClick={() => copy("css")}
            menuLabel="More ways to copy the theme"
            items={[
              {
                label: "Copy AGENTS.md",
                icon: "smart_toy",
                onClick: () => copy("agents"),
              },
              {
                label: "Copy THEME.md",
                icon: "description",
                onClick: () => copy("theme"),
              },
              {
                label: "Copy agent prompt",
                icon: "chat",
                onClick: () => copy("prompt"),
              },
            ]}
          />
          <Button
            size="compact"
            label="Export theme"
            variant="primary"
            iconLeft="ios_share"
            onClick={onExport}
          />
          {/* The floating panel carries its reset in the header; the Drawer
              has no header of ours, so its reset stays down here. */}
          {variant === "drawer" && (
            <Button
              size="compact"
              label="Reset everything"
              variant="secondary"
              iconLeft="restart_alt"
              disabled={isPristine}
              onClick={onReset}
            />
          )}
        </div>
  );

  if (variant === "drawer") {
    return (
      <div className={styles.drawerControls}>
        {content}
        {footer}
      </div>
    );
  }

  return (
    /* No animate-in here: the panel is fixed and the entrance animation's
       transform would fight the layout. The inner wrapper scrolls; the
       shell owns the clipping (see the CSS). */
    <FloatingRail
      side="left"
      label="Theme controls"
      title="Theme"
      collapsed={collapsed}
      onCollapsedChange={onCollapsedChange}
      onReset={onReset}
      resetLabel="Reset everything"
      resetDisabled={isPristine}
      footer={footer}
    >
      {content}
    </FloatingRail>
  );
}
