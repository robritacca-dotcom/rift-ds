'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Field } from '../Field/Field';
import './ColorPicker.css';

/* ============================================
   Colour math — hex ↔ HSV(A)
   The working state is HSV so the saturation
   area and hue slider stay stable while the
   colour passes through greys and extremes.
   ============================================ */

/** h 0–359, s 0–100, v 0–100, a 0–100 */
type Hsva = { h: number; s: number; v: number; a: number };

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

function parseHex(input: string): Hsva | null {
  const hex = input.trim().replace(/^#/, '');
  if (!/^([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(hex)) return null;
  let r: number, g: number, b: number;
  let a = 255;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else {
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
    if (hex.length === 8) a = parseInt(hex.slice(6, 8), 16);
  }
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;
  return {
    // h stays a float — rounding it here makes the hex → HSV → hex round
    // trip drift by one on some colours.
    h: clamp(h, 0, 359.999),
    s: max === 0 ? 0 : (d / max) * 100,
    v: (max / 255) * 100,
    a: (a / 255) * 100,
  };
}

function hsvToRgb({ h, s, v }: Hsva): [number, number, number] {
  const sf = s / 100;
  const vf = v / 100;
  const c = vf * sf;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = vf - c;
  const [r, g, b] =
    h < 60 ? [c, x, 0]
    : h < 120 ? [x, c, 0]
    : h < 180 ? [0, c, x]
    : h < 240 ? [0, x, c]
    : h < 300 ? [x, 0, c]
    : [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

const channelHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();

/** '#RRGGBB', or '#RRGGBBAA' when alpha is shown and below 100%. */
function formatHex(hsva: Hsva, withAlpha: boolean): string {
  const [r, g, b] = hsvToRgb(hsva);
  const base = `#${channelHex(r)}${channelHex(g)}${channelHex(b)}`;
  if (withAlpha && hsva.a < 100) {
    return base + channelHex(Math.round((hsva.a / 100) * 255));
  }
  return base;
}

/** CSS colour for previews — rgba() so alpha renders. */
function toCssColor(hsva: Hsva): string {
  const [r, g, b] = hsvToRgb(hsva);
  return `rgba(${r}, ${g}, ${b}, ${hsva.a / 100})`;
}

/* ============================================
   Component
   ============================================ */

/** Props owned by ColorPicker itself — everything else falls through to the trigger <button>. */
type ColorPickerOwnProps = {
  /** Field label text */
  label?: string;
  /** Current colour as a hex string — 3, 6 or 8 digit, with or without `#` */
  value?: string;
  /** Initial colour for uncontrolled use */
  defaultValue?: string;
  /**
   * Convenience callback receiving the colour as an uppercase hex string
   * (`#RRGGBB`, or `#RRGGBBAA` when `showAlpha` and alpha < 100%). Fires
   * live while dragging.
   */
  onValueChange?: (value: string) => void;
  /** Show the current hex value as text inside the trigger */
  showText?: boolean;
  /** Add an alpha (opacity) slider and emit 8-digit hex when alpha < 100% */
  showAlpha?: boolean;
  /** Component size */
  size?: 'default' | 'compact';
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Error state */
  error?: boolean;
  /** Helper or error message */
  helperText?: string;
  /**
   * When set, a hidden `<input type="hidden">` carries the current hex value
   * under this name so the picker participates in native form submission.
   */
  name?: string;
  /** Additional CSS classes — applied to the wrapper, not the trigger */
  className?: string;
};

export interface ColorPickerProps
  extends ColorPickerOwnProps,
    Omit<React.ComponentPropsWithoutRef<'button'>, keyof ColorPickerOwnProps | 'type'> {}

/**
 * Colour picker: a swatch trigger that opens a panel with a
 * saturation/brightness area, hue slider, optional alpha slider and a hex
 * field. Works controlled (`value` + `onValueChange`) or uncontrolled
 * (`defaultValue`).
 *
 * Forwards a ref to the trigger `<button>` and spreads unrecognised props
 * onto it.
 */
export const ColorPicker = React.forwardRef<HTMLButtonElement, ColorPickerProps>(
  (
    {
      label,
      value,
      defaultValue = '#118AB2',
      onValueChange,
      showText = false,
      showAlpha = false,
      size = 'default',
      disabled = false,
      required = false,
      error = false,
      helperText,
      name,
      className = '',
      id,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-colorpicker';

    const [isOpen, setIsOpen] = useState(false);
    const [hsva, setHsva] = useState<Hsva>(
      () => parseHex(value ?? defaultValue) ?? { h: 0, s: 0, v: 0, a: 100 },
    );
    /** Draft text while the hex field is being edited; null → show the formatted value. */
    const [hexDraft, setHexDraft] = useState<string | null>(null);

    const rootRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const satRef = useRef<HTMLDivElement | null>(null);
    const hsvaRef = useRef(hsva);
    hsvaRef.current = hsva;
    /** Last hex we emitted — lets the controlled-value effect ignore our own echoes. */
    const lastEmitted = useRef<string | null>(null);

    const setTriggerRef = (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    // Controlled sync: adopt an external value unless it is the one we just
    // emitted (re-parsing our own hex would collapse hue at s=0 or v=0).
    useEffect(() => {
      if (value == null || value === lastEmitted.current) return;
      const parsed = parseHex(value);
      if (parsed) setHsva(parsed);
    }, [value]);

    const commit = useCallback(
      (next: Hsva) => {
        setHsva(next);
        const hex = formatHex(next, showAlpha);
        lastEmitted.current = hex;
        onValueChange?.(hex);
      },
      [onValueChange, showAlpha],
    );

    // Close on click outside
    useEffect(() => {
      if (!isOpen) return;
      const onMouseDown = (e: MouseEvent) => {
        if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
          setIsOpen(false);
          setHexDraft(null);
        }
      };
      document.addEventListener('mousedown', onMouseDown);
      return () => document.removeEventListener('mousedown', onMouseDown);
    }, [isOpen]);

    const handleRootKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.stopPropagation();
        setIsOpen(false);
        setHexDraft(null);
        triggerRef.current?.focus();
      }
    };

    /* ---------- saturation/brightness area ---------- */

    const updateFromPointer = useCallback(
      (clientX: number, clientY: number) => {
        const el = satRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const s = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
        const v = clamp((1 - (clientY - rect.top) / rect.height) * 100, 0, 100);
        commit({ ...hsvaRef.current, s, v });
      },
      [commit],
    );

    const handleSatPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.focus();
      updateFromPointer(e.clientX, e.clientY);
    };

    const handleSatPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        updateFromPointer(e.clientX, e.clientY);
      }
    };

    const handleSatKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const step = e.shiftKey ? 10 : 2;
      const { h, s, v, a } = hsvaRef.current;
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          commit({ h, s: clamp(s - step, 0, 100), v, a });
          break;
        case 'ArrowRight':
          e.preventDefault();
          commit({ h, s: clamp(s + step, 0, 100), v, a });
          break;
        case 'ArrowUp':
          e.preventDefault();
          commit({ h, s, v: clamp(v + step, 0, 100), a });
          break;
        case 'ArrowDown':
          e.preventDefault();
          commit({ h, s, v: clamp(v - step, 0, 100), a });
          break;
        // The slider pattern requires Home/End; they act on the horizontal
        // (saturation) axis, matching the arrow keys above.
        case 'Home':
          e.preventDefault();
          commit({ h, s: 0, v, a });
          break;
        case 'End':
          e.preventDefault();
          commit({ h, s: 100, v, a });
          break;
      }
    };

    /* ---------- hex field ---------- */

    const displayHex = formatHex(hsva, showAlpha);

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value;
      setHexDraft(text);
      const parsed = parseHex(text);
      if (parsed) {
        // A 6-digit entry keeps the current alpha; an 8-digit entry brings its own.
        const keepAlpha = text.replace(/^#/, '').length < 8;
        commit(keepAlpha ? { ...parsed, a: hsvaRef.current.a } : parsed);
      }
    };

    /* ---------- render ---------- */

    const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-');
    const cssColor = toCssColor(hsva);
    const solidHex = formatHex({ ...hsva, a: 100 }, false);

    const classes = [
      baseClass,
      size === 'compact' ? `${baseClass}--compact` : '',
      isOpen ? `${baseClass}--open` : '',
      error ? `${baseClass}--error` : '',
      disabled ? `${baseClass}--disabled` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <Field
        ref={rootRef}
        className={classes}
        label={label}
        helperText={helperText}
        error={error}
        required={required}
        disabled={disabled}
        size={size}
        id={inputId}
        onKeyDown={handleRootKeyDown}
      >
        <button
          {...rest}
          ref={setTriggerRef}
          type="button"
          id={inputId}
          className={`${baseClass}__trigger`}
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-describedby={helperText ? `${inputId}-helper` : rest['aria-describedby']}
          aria-invalid={error || undefined}
          aria-label={rest['aria-label'] ?? (!label ? `Choose colour, ${displayHex}` : undefined)}
          onClick={() => {
            if (!disabled) setIsOpen((prev) => !prev);
          }}
        >
          <span
            className={`${baseClass}__trigger-swatch`}
            style={{ '--ds-cp-color': cssColor } as React.CSSProperties}
            aria-hidden="true"
          />
          {showText && <span className={`${baseClass}__trigger-text`}>{displayHex}</span>}
        </button>

        {name && <input type="hidden" name={name} value={displayHex} />}

        {isOpen && (
          <div
            className={`${baseClass}__panel`}
            role="dialog"
            aria-label={label ? `${label} colour picker` : 'Colour picker'}
            style={
              {
                '--ds-cp-hue': hsva.h,
                '--ds-cp-color': cssColor,
                '--ds-cp-solid': solidHex,
              } as React.CSSProperties
            }
          >
            <div
              ref={satRef}
              className={`${baseClass}__saturation`}
              role="slider"
              tabIndex={0}
              aria-label="Saturation and brightness"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(hsva.v)}
              aria-valuetext={`Saturation ${Math.round(hsva.s)}%, brightness ${Math.round(hsva.v)}%`}
              onPointerDown={handleSatPointerDown}
              onPointerMove={handleSatPointerMove}
              onKeyDown={handleSatKeyDown}
              style={
                {
                  '--ds-cp-x': `${hsva.s}%`,
                  '--ds-cp-y': `${100 - hsva.v}%`,
                } as React.CSSProperties
              }
            >
              <span className={`${baseClass}__handle`} />
            </div>

            <div className={`${baseClass}__controls`}>
              <div className={`${baseClass}__sliders`}>
                <input
                  type="range"
                  className={`${baseClass}__hue`}
                  min={0}
                  max={359}
                  step={1}
                  value={Math.round(hsva.h)}
                  aria-label="Hue"
                  onChange={(e) => commit({ ...hsvaRef.current, h: Number(e.target.value) })}
                />
                {showAlpha && (
                  <input
                    type="range"
                    className={`${baseClass}__alpha`}
                    min={0}
                    max={100}
                    step={1}
                    value={Math.round(hsva.a)}
                    aria-label="Alpha"
                    onChange={(e) => commit({ ...hsvaRef.current, a: Number(e.target.value) })}
                  />
                )}
              </div>
              <span className={`${baseClass}__preview`} aria-hidden="true" />
            </div>

            <div className={`${baseClass}__inputs`}>
              <span className={`${baseClass}__hash`} aria-hidden="true">
                #
              </span>
              <input
                type="text"
                className={`${baseClass}__hex-field`}
                value={(hexDraft ?? displayHex).replace(/^#/, '')}
                maxLength={8}
                spellCheck={false}
                autoComplete="off"
                aria-label="Hex colour value"
                onChange={handleHexChange}
                onFocus={() => setHexDraft(displayHex.replace(/^#/, ''))}
                onBlur={() => setHexDraft(null)}
              />
              {showAlpha && (
                <span className={`${baseClass}__alpha-value`}>{Math.round(hsva.a)}%</span>
              )}
            </div>
          </div>
        )}
      </Field>
    );
  },
);

ColorPicker.displayName = 'ColorPicker';
