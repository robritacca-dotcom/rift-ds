"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./page.module.css";
import { Button } from "@robr0/design-system/components/Button/Button";
import { CircularButton } from "@robr0/design-system/components/CircularButton/CircularButton";
import { ColorPicker } from "@robr0/design-system/components/ColorPicker/ColorPicker";
import { Swatch } from "@robr0/design-system/components/Swatch/Swatch";
import { Input } from "@robr0/design-system/components/Input/Input";
import { SegmentedControl } from "@robr0/design-system/components/SegmentedControl/SegmentedControl";
import { Slider } from "@robr0/design-system/components/Slider/Slider";
import { ToggleSwitch } from "@robr0/design-system/components/ToggleSwitch/ToggleSwitch";
import { ACTION_COLOR_PRESETS, type ElevationVariant } from "@/lib/theme/theme-overrides";
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
  /** Spacing-ladder scale in percent; 100 is the shipped grid. */
  density: number;
  /** Type-ladder scale in percent; 100 is the shipped scale. */
  typeScale: number;
  /** Schedule-duration scale in percent; under 100 is snappier. */
  motionScale: number;
  elevation: ElevationVariant;
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
  onDensity: (value: number) => void;
  onTypeScale: (value: number) => void;
  onMotionScale: (value: number) => void;
  onElevation: (value: ElevationVariant) => void;
  onFontLabel: (value: string) => void;
  onHeadingFontLabel: (value: string) => void;
  onProductName: (value: string) => void;
  /** File name of the image the theme was read from, when there is one. */
  imageName?: string;
  /** True while a dropped or chosen image is being decoded and sampled. */
  imageBusy?: boolean;
  /** Why the last image could not be used, if it could not. */
  imageError?: string;
  /** Opens the file picker for the theme source image. */
  onPickImage: () => void;
  /** Drops the source image. The levers it moved stay where they are. */
  onClearImage: () => void;
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
  density,
  typeScale,
  motionScale,
  elevation,
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
  onDensity,
  onTypeScale,
  onMotionScale,
  onElevation,
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

        {/* Theming from a picture: the same colour levers, moved all at
            once. The drop target is the whole tool, so this button is the
            keyboard and touch route to the same thing. */}
        <div className={styles.controlGroup}>
          <h4 className={styles.controlHeading}>From an image</h4>
          <Button
            label={imageBusy ? "Reading the image" : "Upload an image"}
            variant="neutral"
            iconLeft={imageBusy ? "progress_activity" : "add_photo_alternate"}
            state={imageBusy ? "disabled" : "default"}
            onClick={onPickImage}
          />
          {imageName ? (
            <div className={styles.imageSourceRow}>
              <span className={styles.imageSourceName} title={imageName}>
                {imageName}
              </span>
              <CircularButton
                icon="close"
                variant="neutral"
                size="compact"
                ariaLabel="Remove the theme source image"
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

        {/* The remaining preset levers, in the composer's own order:
            spacing, type, motion, then the elevation variant. Sliders in
            percent of the shipped ladders, like the radius above. */}
        <div className={styles.controlGroup}>
          <h4 className={styles.controlHeading}>Density</h4>
          <div className={styles.sliderRow}>
            <Slider
              value={density}
              min={70}
              max={130}
              step={5}
              onValueChange={onDensity}
              ariaLabel="Density scale"
            />
            <span className={styles.sliderValue}>{density}%</span>
          </div>
        </div>

        <div className={styles.controlGroup}>
          <h4 className={styles.controlHeading}>Type scale</h4>
          <div className={styles.sliderRow}>
            <Slider
              value={typeScale}
              min={80}
              max={120}
              step={5}
              onValueChange={onTypeScale}
              ariaLabel="Type scale"
            />
            <span className={styles.sliderValue}>{typeScale}%</span>
          </div>
        </div>

        <div className={styles.controlGroup}>
          <h4 className={styles.controlHeading}>Motion</h4>
          <div className={styles.sliderRow}>
            <Slider
              value={motionScale}
              min={50}
              max={150}
              step={10}
              onValueChange={onMotionScale}
              ariaLabel="Motion duration scale"
            />
            <span className={styles.sliderValue}>{motionScale}%</span>
          </div>
        </div>

        <div className={styles.controlGroup}>
          <h4 className={styles.controlHeading}>Elevation</h4>
          <SegmentedControl
            segments={[
              { value: "default", label: "Default" },
              { value: "flat", label: "Flat" },
              { value: "soft", label: "Soft" },
            ]}
            activeSegment={elevation}
            onSegmentChange={(value) => onElevation(value as ElevationVariant)}
            size="compact"
            ariaLabel="Elevation"
          />
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
