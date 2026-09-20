"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./page.module.css";
import { Button } from "@robr0/design-system/components/Button/Button";
import { ColorPicker } from "@robr0/design-system/components/ColorPicker/ColorPicker";
import { Swatch } from "@robr0/design-system/components/Swatch/Swatch";
import { Input } from "@robr0/design-system/components/Input/Input";
import { Slider } from "@robr0/design-system/components/Slider/Slider";
import { ToggleSwitch } from "@robr0/design-system/components/ToggleSwitch/ToggleSwitch";
import { ACTION_COLOR_PRESETS } from "@/lib/theme/theme-overrides";
import { Dropdown } from "@robr0/design-system/components/Dropdown/Dropdown";
import { RichDropdown } from "@robr0/design-system/components/RichDropdown/RichDropdown";
import { fontPickerOptions, presetPickerOptions } from "@/lib/theme/presets";

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
  fontLabel: string;
  headingFontLabel: string;
  productName: string;
  isPristine: boolean;
  cssSnippet: string;
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
  onFontLabel: (value: string) => void;
  onHeadingFontLabel: (value: string) => void;
  onProductName: (value: string) => void;
  onReset: () => void;
  /** Opens the advanced-mode dialog (every primitive ramp). */
  onOpenAdvanced: () => void;
  /** Opens the generated-CSS dialog (the Copy button's contents, visible). */
  onViewCss: () => void;
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
  fontLabel,
  headingFontLabel,
  productName,
  isPristine,
  cssSnippet,
  contextual,
  variant = "panel",
  onPreset,
  onBrand,
  onTintOn,
  onTintSeed,
  onTintStrength,
  onRadiusScale,
  onPill,
  onFontLabel,
  onHeadingFontLabel,
  onProductName,
  onReset,
  onOpenAdvanced,
  onViewCss,
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

  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    };
  }, []);

  const copyCss = async () => {
    try {
      await navigator.clipboard.writeText(cssSnippet);
      setCopied(true);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (permissions) — the end-of-page CodeBlock
      // still offers its own copy affordance.
    }
  };

  const content = (
    <>
        <div className={styles.controlGroup}>
          <RichDropdown
            label="Theme preset"
            value={preset}
            options={presetOptions}
            onValueChange={onPreset}
          />
        </div>

        {/* Colour sits high and every shared lever keeps one fixed slot in
            all views — the contextual groups render at the bottom, so
            nothing above them ever shifts. */}
        <div className={styles.controlGroup}>
          <h4 className={styles.controlHeading}>Action colour</h4>
          <div className={styles.swatchGrid}>
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
          <ColorPicker
            value={brand}
            onValueChange={onBrand}
            showText
            aria-label="Custom brand colour"
            className={isCustomBrand ? styles.customPickerActive : ""}
          />
          <Button
            label="All colour ramps"
            variant="neutral"
            iconLeft="palette"
            onClick={onOpenAdvanced}
          />
        </div>

        <div className={styles.controlGroup}>
          <Input
            label="Product name"
            placeholder="Acme Corp"
            value={productName}
            onValueChange={onProductName}
          />
        </div>

        <div className={styles.controlGroup}>
          <ToggleSwitch
            className={styles.tintTitleToggle}
            label="Tint neutrals"
            checked={tintOn}
            onChange={onTintOn}
          />
          {tintOn && (
            <>
              <ColorPicker
                value={tintSeed}
                onValueChange={onTintSeed}
                showText
                aria-label="Neutral tint seed colour"
              />
              <div className={styles.sliderRow}>
                <Slider
                  value={tintStrength}
                  min={0}
                  max={16}
                  step={1}
                  onValueChange={onTintStrength}
                  ariaLabel="Tint strength"
                />
                <span className={styles.sliderValue}>{tintStrength}%</span>
              </div>
            </>
          )}
        </div>

        <div className={styles.controlGroup}>
          <h4 className={styles.controlHeading}>Corner radius</h4>
          <div className={styles.sliderRow}>
            <Slider
              value={radiusScale}
              min={0}
              max={200}
              step={10}
              onValueChange={onRadiusScale}
              ariaLabel="Radius scale"
            />
            <span className={styles.sliderValue}>{radiusScale}%</span>
          </div>
          <ToggleSwitch label="Pill buttons" checked={pill} onChange={onPill} />
        </div>

        <div className={`${styles.controlGroup} ${styles.dropUp}`}>
          <Dropdown
            label="Headings"
            value={headingFontLabel}
            options={fontPickerOptions("heading", fontLabel)}
            onValueChange={onHeadingFontLabel}
          />
          <Dropdown
            label="Body"
            value={fontLabel}
            options={fontPickerOptions("body", fontLabel)}
            onValueChange={onFontLabel}
          />
        </div>

        {contextual}

        <div className={styles.railFooter}>
          <Button
            label={copied ? "Copied" : "Copy CSS"}
            variant="primary"
            iconLeft={copied ? "check" : "content_copy"}
            state={isPristine ? "disabled" : "default"}
            onClick={copyCss}
          />
          <Button
            label="View CSS"
            variant="neutral"
            iconLeft="code"
            onClick={onViewCss}
          />
          <Button
            label="Reset everything"
            variant="secondary"
            iconLeft="restart_alt"
            state={isPristine ? "disabled" : "default"}
            onClick={onReset}
          />
        </div>
    </>
  );

  if (variant === "drawer") {
    return <div className={styles.drawerControls}>{content}</div>;
  }

  return (
    /* No animate-in here: the panel is fixed and the entrance animation's
       transform would fight the layout. The inner wrapper scrolls; the
       shell owns the clipping (see the CSS). */
    <aside className={styles.controlRail} aria-label="Theme controls">
      <div className={styles.railScroll}>{content}</div>
    </aside>
  );
}
