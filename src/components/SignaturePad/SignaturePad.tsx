'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { Field } from '../Field/Field';
import { Input } from '../Input/Input';
import { Button } from '../Button/Button';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl';
import '../../behaviors/visually-hidden.css';
import {
  drawnSvg,
  strokePath,
  svgToPng,
  typedSvg,
  type SignatureStroke,
  type SignatureValue,
} from './signature';
import './SignaturePad.css';

/** Props owned by SignaturePad itself; everything else falls through to the wrapper. */
type SignaturePadOwnProps = {
  /** Label text above the pad. */
  label?: string;
  /** `draw` takes a drawn signature, `type` a typed name, `both` lets the reader choose. Defaults to `both`, since typing is the way in for anyone who cannot draw with a pointer. */
  mode?: 'draw' | 'type' | 'both';
  /** The signature (controlled). A drawn one cannot be loaded back for editing: pass `null` to clear the pad, or keep the value the pad last handed over. */
  value?: SignatureValue | null;
  /** The typed name the pad starts with (uncontrolled), which also starts it on the type tab. */
  defaultValue?: { kind: 'typed'; text: string } | null;
  /** Called with the signature after each stroke, each change to the typed name, and each clear (with `null`). */
  onValueChange?: (value: SignatureValue | null) => void;
  /** The pad's height: `default`, or `tall` for a wider hand or a touch screen. */
  height?: 'default' | 'tall';
  /** Component size */
  size?: 'default' | 'compact';
  /** Whether the pad is disabled */
  disabled?: boolean;
  /** Error state without a message of its own. */
  error?: boolean;
  /** The error message under the pad; setting it marks the pad invalid. */
  errorText?: React.ReactNode;
  /** Helper text below the pad. */
  helperText?: string;
  /** Marks the pad required. */
  required?: boolean;
  /** The form field name: the form receives the signature's SVG through a hidden input. */
  name?: string;
  /** Text on the baseline before anything is drawn. Defaults to "Sign here". */
  placeholderLabel?: string;
  /** The drawing surface's accessible name. Defaults to "Signature drawing area". */
  padLabel?: string;
  /** Accessible name of the draw and type choice. Defaults to "Signature method". */
  modeLabel?: string;
  /** The draw tab's text. Defaults to "Draw". */
  drawLabel?: string;
  /** The type tab's text. Defaults to "Type". */
  typeLabel?: string;
  /** The typed name's field label. Defaults to "Type your full name". */
  nameLabel?: string;
  /** The clear button's text. Defaults to "Clear". */
  clearLabel?: string;
  /** The undo button's text. Defaults to "Undo". */
  undoLabel?: string;
  /** Announced politely after a stroke is drawn. Defaults to "Signature added". */
  addedLabel?: string;
  /** Announced politely after the pad is cleared. Defaults to "Signature cleared". */
  clearedLabel?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface SignaturePadProps
  extends SignaturePadOwnProps,
    Omit<React.ComponentPropsWithRef<'div'>, keyof SignaturePadOwnProps | 'children'> {}

/** The pad's drawing units when it has not been measured yet. */
const FALLBACK_SIZE = { width: 600, height: 200 };

/**
 * A signature, drawn with a pointer or typed. Drawn strokes are smoothed and
 * kept as SVG path data, so the signature scales and prints; a PNG is made
 * on demand. Undo takes back the last stroke and Clear empties the pad. The
 * typed name is the way in for a reader who cannot draw, so the pad offers
 * both by default.
 */
export function SignaturePad({
  label,
  mode = 'both',
  value: valueProp,
  defaultValue = null,
  onValueChange,
  height = 'default',
  size = 'default',
  disabled = false,
  error,
  errorText,
  helperText,
  required,
  name,
  placeholderLabel = 'Sign here',
  padLabel = 'Signature drawing area',
  modeLabel = 'Signature method',
  drawLabel = 'Draw',
  typeLabel = 'Type',
  nameLabel = 'Type your full name',
  clearLabel = 'Clear',
  undoLabel = 'Undo',
  addedLabel = 'Signature added',
  clearedLabel = 'Signature cleared',
  className = '',
  id,
  ref,
  ...rest
}: SignaturePadProps) {
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const [tab, setTab] = useState<'draw' | 'type'>(
    mode === 'type' || (mode === 'both' && defaultValue?.kind === 'typed') ? 'type' : 'draw',
  );
  const activeTab = mode === 'both' ? tab : mode;
  const [strokes, setStrokes] = useState<SignatureStroke[]>([]);
  const [typed, setTyped] = useState(defaultValue?.kind === 'typed' ? defaultValue.text : '');
  const [announcement, setAnnouncement] = useState('');
  const [svgValue, setSvgValue] = useState('');

  const svgRef = useRef<SVGSVGElement | null>(null);
  const liveRef = useRef<SVGGElement | null>(null);
  const previewRef = useRef<HTMLSpanElement | null>(null);
  const [box, setBox] = useState(FALLBACK_SIZE);
  const drawing = useRef<{ stroke: SignatureStroke; path: SVGPathElement; pressures: number[] } | null>(null);

  // The pad's drawing units follow its size until the first stroke lands;
  // after that they hold, and the drawing scales with the pad.
  const padEmpty = strokes.length === 0;
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      if (drawing.current) return;
      const { width, height: h } = entry.contentRect;
      if (width > 0 && h > 0) setBox({ width, height: h });
    });
    // Measured only while the pad is empty; a drawing keeps the units it was drawn in.
    if (padEmpty) observer.observe(svg);
    return () => observer.disconnect();
  }, [activeTab, padEmpty]);

  // A controlled value of null clears the pad.
  const [lastValue, setLastValue] = useState(valueProp);
  if (valueProp !== lastValue) {
    setLastValue(valueProp);
    if (valueProp === null) {
      setStrokes([]);
      setTyped('');
      setSvgValue('');
    }
  }

  const emitDrawn = (next: SignatureStroke[]) => {
    if (next.length === 0) {
      setSvgValue('');
      onValueChange?.(null);
      return;
    }
    const svg = drawnSvg(next, box.width, box.height);
    setSvgValue(svg);
    onValueChange?.({ kind: 'drawn', svg, png: () => svgToPng(svg, box.width, box.height) });
  };

  const emitTyped = (text: string) => {
    if (text.trim() === '') {
      setSvgValue('');
      onValueChange?.(null);
      return;
    }
    const preview = previewRef.current;
    const style = preview ? getComputedStyle(preview) : null;
    const fontSize = style ? Number.parseFloat(style.fontSize) : 32;
    const svg = typedSvg(text, box.width, box.height, style?.fontFamily ?? 'serif', fontSize);
    setSvgValue(svg);
    onValueChange?.({ kind: 'typed', svg, text, png: () => svgToPng(svg, box.width, box.height) });
  };

  /** A pointer position in the pad's own units. */
  const pointOf = (event: { clientX: number; clientY: number }): [number, number] => {
    const rect = svgRef.current!.getBoundingClientRect();
    return [((event.clientX - rect.left) / rect.width) * box.width, ((event.clientY - rect.top) / rect.height) * box.height];
  };

  const baseWidth = size === 'compact' ? 2 : 2.5;

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if (disabled || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'ds-signature-pad__stroke');
    path.setAttribute('stroke-width', String(baseWidth));
    liveRef.current?.appendChild(path);
    const stroke: SignatureStroke = { points: [pointOf(event)], width: baseWidth };
    drawing.current = { stroke, path, pressures: [event.pressure || 0.5] };
    path.setAttribute('d', strokePath(stroke.points));
  };

  /* Per frame, the stroke is written straight to its path; React hears of
     it once, when the pointer lets go (the drag rule). */
  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const current = drawing.current;
    if (!current) return;
    const events = event.nativeEvent.getCoalescedEvents?.() ?? [event.nativeEvent];
    for (const e of events.length ? events : [event.nativeEvent]) {
      current.stroke.points.push(pointOf(e));
      if (e.pointerType !== 'mouse') current.pressures.push(e.pressure || 0.5);
    }
    current.path.setAttribute('d', strokePath(current.stroke.points));
  };

  const finishStroke = () => {
    const current = drawing.current;
    if (!current) return;
    drawing.current = null;
    current.path.remove();
    const average = current.pressures.reduce((a, b) => a + b, 0) / current.pressures.length;
    // A pen or a finger that reports pressure thickens or thins the line
    // around the base width; a mouse reports a flat half and draws at base.
    current.stroke.width = baseWidth * (0.5 + average);
    const next = [...strokes, current.stroke];
    setStrokes(next);
    emitDrawn(next);
    setAnnouncement(addedLabel);
  };

  const undo = () => {
    const next = strokes.slice(0, -1);
    setStrokes(next);
    emitDrawn(next);
  };

  const clear = () => {
    if (activeTab === 'draw') {
      setStrokes([]);
      emitDrawn([]);
    } else {
      setTyped('');
      emitTyped('');
    }
    setAnnouncement(clearedLabel);
  };

  const switchTab = (next: string) => {
    const target = next === 'type' ? 'type' : 'draw';
    setTab(target);
    // Switching hands over what the other method holds, so the value is
    // always the signature on show.
    if (target === 'type') emitTyped(typed);
    else emitDrawn(strokes);
  };

  const empty = activeTab === 'draw' ? strokes.length === 0 : typed.trim() === '';
  const invalid = Boolean(error) || (errorText != null && errorText !== false && errorText !== '');
  const classes = [
    'ds-signature-pad',
    `ds-signature-pad--${size}`,
    `ds-signature-pad--height-${height}`,
    invalid && 'ds-signature-pad--error',
    disabled && 'ds-signature-pad--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const drawPanelId = `${baseId}-draw`;
  const typePanelId = `${baseId}-type`;

  return (
    <Field
      {...rest}
      ref={ref}
      id={baseId}
      className={classes}
      label={label}
      helperText={helperText}
      errorText={errorText}
      error={error}
      required={required}
      disabled={disabled}
      size={size}
      group
    >
      <div className="ds-signature-pad__body" role="group" aria-labelledby={label ? `${baseId}-label` : undefined}>
        {mode === 'both' && (
          <SegmentedControl
            className="ds-signature-pad__mode"
            aria-label={modeLabel}
            size="compact"
            segments={[
              { value: 'draw', label: drawLabel, panelId: drawPanelId, disabled },
              { value: 'type', label: typeLabel, panelId: typePanelId, disabled },
            ]}
            value={activeTab}
            onValueChange={switchTab}
          />
        )}

        {activeTab === 'draw' ? (
          <div
            className="ds-signature-pad__surface"
            id={drawPanelId}
            role={mode === 'both' ? 'tabpanel' : undefined}
            aria-label={mode === 'both' ? drawLabel : undefined}
          >
            <div className="ds-signature-pad__baseline" aria-hidden="true">
              {empty && <span className="ds-signature-pad__placeholder">{placeholderLabel}</span>}
            </div>
            <svg
              ref={svgRef}
              className="ds-signature-pad__canvas"
              viewBox={`0 0 ${box.width} ${box.height}`}
              role="img"
              aria-label={padLabel}
              aria-disabled={disabled || undefined}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={finishStroke}
              onPointerCancel={finishStroke}
              onLostPointerCapture={finishStroke}
            >
              {strokes.map((stroke, index) => (
                <path key={index} className="ds-signature-pad__stroke" d={strokePath(stroke.points)} strokeWidth={stroke.width} />
              ))}
              <g ref={liveRef} />
            </svg>
          </div>
        ) : (
          <div
            className="ds-signature-pad__typed"
            id={typePanelId}
            role={mode === 'both' ? 'tabpanel' : undefined}
            aria-label={mode === 'both' ? typeLabel : undefined}
          >
            <Input
              // In type-only mode the pad's own label names the field, so it
              // is not labelled twice.
              label={mode === 'type' && label ? undefined : nameLabel}
              aria-label={mode === 'type' && label ? label : undefined}
              size={size}
              value={typed}
              disabled={disabled}
              autoComplete="name"
              onValueChange={(text) => {
                setTyped(text);
                emitTyped(text);
              }}
            />
            <div className="ds-signature-pad__surface ds-signature-pad__surface--typed" aria-hidden="true">
              <div className="ds-signature-pad__baseline">
                {empty && <span className="ds-signature-pad__placeholder">{placeholderLabel}</span>}
              </div>
              <span ref={previewRef} className="ds-signature-pad__preview">
                {typed}
              </span>
            </div>
          </div>
        )}

        <div className="ds-signature-pad__actions">
          {activeTab === 'draw' && (
            <Button
              variant="tertiary"
              size="compact"
              iconLeft="undo"
              label={undoLabel}
              disabled={disabled || strokes.length === 0}
              onClick={undo}
            />
          )}
          <Button variant="tertiary" size="compact" label={clearLabel} disabled={disabled || empty} onClick={clear} />
        </div>

        <span className="ds-visually-hidden" aria-live="polite">
          {announcement}
        </span>
        {name && <input type="hidden" name={name} value={svgValue} disabled={disabled} />}
      </div>
    </Field>
  );
}

// The signature helpers are plain functions beside the component, not
// components, so the Fast Refresh rule that wants a component module to
// export only components does not apply to them.
// eslint-disable-next-line react-refresh/only-export-components
export { strokePath, svgToPng } from './signature';
export type { SignatureStroke, SignatureValue } from './signature';
