"use client";

import styles from "./page.module.css";
import { Button } from "@robr0/design-system/components/Button/Button";
import { ColorPicker } from "@robr0/design-system/components/ColorPicker/ColorPicker";
import { Dialog } from "@robr0/design-system/components/Dialog/Dialog";
import { Slider } from "@robr0/design-system/components/Slider/Slider";
import {
  CHROMATIC_RAMPS,
  isAdvancedPristine,
  type AdvancedColorState,
  type Overrides,
} from "@/lib/theme/theme-overrides";

export interface AdvancedColorsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The advanced-mode levers (hue/saturation + per-ramp bases). */
  state: AdvancedColorState;
  /** Every override currently applied — paints the mini ramps live. */
  overrides: Overrides;
  onChange: (next: AdvancedColorState) => void;
  onResetColors: () => void;
}

/**
 * Advanced mode: every chromatic primitive ramp up front, small. Two
 * all-ramps levers on top; each row's picker rebases that ramp from a new
 * 07. The mini swatches read from the applied overrides, so they show the
 * same values the page behind the dialog is rendering.
 */
export default function AdvancedColorsDialog({
  open,
  onOpenChange,
  state,
  overrides,
  onChange,
  onResetColors,
}: AdvancedColorsDialogProps) {
  const currentHex = (ramp: string, step: string, shipped: string) =>
    (overrides[`--primitive-${ramp}-${step}`] ?? shipped).toUpperCase();

  const setBase = (ramp: string, hex: string) =>
    onChange({ ...state, bases: { ...state.bases, [ramp]: hex } });

  const clearBase = (ramp: string) => {
    const bases = { ...state.bases };
    delete bases[ramp];
    onChange({ ...state, bases });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Advanced colours"
      description="Every chromatic primitive ramp, live. Each ramp's key colour is step 07. Set it to any hex and the ramp rebuilds around it."
      size="lg"
      footer={
        <>
          <Button
            label="Reset colours"
            variant="secondary"
            iconLeft="restart_alt"
            disabled={isAdvancedPristine(state)}
            onClick={onResetColors}
          />
          <Button label="Done" variant="primary" onClick={() => onOpenChange(false)} />
        </>
      }
    >
      <div className={styles.advBody}>
        <div className={styles.advGlobal}>
          <h4 className={styles.controlHeading}>All ramps</h4>
          <div className={styles.sliderRow}>
            {/* ±20° keeps every hue inside its family — reds stay reds.
                Bigger moves belong to the per-ramp key colours below. */}
            <span className={styles.advSliderLabel}>Hue</span>
            <Slider
              value={state.hueShift}
              min={-20}
              max={20}
              step={1}
              onValueChange={(v) => onChange({ ...state, hueShift: v })}
              ariaLabel="Hue nudge, all ramps"
            />
            <span className={styles.sliderValue}>{state.hueShift}°</span>
          </div>
          <div className={styles.sliderRow}>
            <span className={styles.advSliderLabel}>Saturation</span>
            <Slider
              value={state.satScale}
              min={0}
              max={200}
              step={5}
              onValueChange={(v) => onChange({ ...state, satScale: v })}
              ariaLabel="Saturation, all ramps"
            />
            <span className={styles.sliderValue}>{state.satScale}%</span>
          </div>
        </div>

        <div className={styles.advRamps}>
          {CHROMATIC_RAMPS.map((ramp) => {
            const rebased = ramp.name in state.bases;
            const shippedBase = ramp.steps.find(([s]) => s === "07")![1];
            return (
              <div className={styles.advRampRow} key={ramp.name}>
                <span className={styles.advRampLabel}>{ramp.label}</span>
                <div
                  className={styles.advRamp}
                  role="img"
                  aria-label={`${ramp.label} ramp, steps 01 to 10`}
                >
                  {ramp.steps.map(([step, shipped]) => {
                    const hex = currentHex(ramp.name, step, shipped);
                    const key = step === "07";
                    return (
                      <span
                        key={step}
                        className={`${styles.advCell} ${key ? styles.advCellKey : ""}`}
                        style={{ background: hex }}
                        title={`${ramp.label} ${step}${key ? " (key)" : ""} · ${hex}`}
                      />
                    );
                  })}
                </div>
                <ColorPicker
                  size="compact"
                  value={
                    state.bases[ramp.name] ?? currentHex(ramp.name, "07", shippedBase)
                  }
                  onValueChange={(v) => setBase(ramp.name, v)}
                  aria-label={`${ramp.label} ramp base colour`}
                  className={`${styles.advRampPicker} ${
                    rebased ? styles.customPickerActive : ""
                  }`}
                />
                <button
                  type="button"
                  className={styles.advRampReset}
                  onClick={() => clearBase(ramp.name)}
                  disabled={!rebased}
                  aria-label={`Reset ${ramp.label} ramp`}
                  title={`Reset ${ramp.label} ramp`}
                >
                  <span className="material-symbols-rounded" aria-hidden="true">
                    restart_alt
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        <p className={styles.controlNote}>
          Teal is the action ramp: rebasing it moves every primary button and focus
          ring, same as the action colour picker.
        </p>
      </div>
    </Dialog>
  );
}
