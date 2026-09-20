'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_SHADER_BLOBS,
  DEFAULT_SHADER_PARAMS,
  useShaderField,
  type ShaderBlob,
  type ShaderParams,
} from './useShaderField';
import './ShaderField.css';

export type {
  ShaderBlob,
  ShaderParams,
  ShaderFieldParams,
  ShaderFieldState,
} from './useShaderField';
/* The barrel is generated from the .tsx modules in each component folder, so a
   hook that only ever lived in a .ts file could never be imported from the
   package root — and the headless hook is a documented escape hatch, not an
   implementation detail. Re-exporting it here is what puts it in the barrel.
   Fast-refresh granularity is the price, and it is not one a published
   library pays: the .ts modules underneath are where the code actually lives. */
/* eslint-disable react-refresh/only-export-components */
export { useShaderField, DEFAULT_SHADER_BLOBS, DEFAULT_SHADER_PARAMS } from './useShaderField';
export { BLOB_COUNT } from './field.glsl';
/* eslint-enable react-refresh/only-export-components */

/**
 * How the renderer has resolved.
 *
 * `pending` is the one that matters to a caller: the context is still coming
 * up, so neither the field nor a fallback should be painted yet — showing a
 * fallback here and swapping it a frame later reads as two backgrounds loading
 * in sequence.
 */
export type ShaderFieldStatus = 'pending' | 'active' | 'unavailable';

/**
 * Bound on `pending`, and it is load-bearing.
 *
 * A caller that paints nothing while the renderer resolves has no background
 * at all if resolution never arrives — a context lost before the first frame
 * and never restored does exactly that. This is generous next to a normal
 * start, which lands within a frame of mount, so a healthy field never trips
 * it; the point is only that the unresolved state can never be terminal.
 */
const WATCHDOG_MS = 1500;

/** Props owned by ShaderField itself — everything else falls through to the canvas. */
type ShaderFieldOwnProps = {
  /**
   * Field parameters, merged over the shipped defaults, so passing one
   * property changes one thing. Changing them never rebuilds the GL state.
   */
  params?: Partial<ShaderParams>;
  /**
   * The light sources. Defaults to an eight-source composition on the core
   * accent tokens. Fewer than `BLOB_COUNT` entries is fine — unused slots park
   * off-field; more are ignored, because the shader's uniform arrays are
   * fixed-size.
   */
  blobs?: readonly ShaderBlob[];
  /**
   * False keeps WebGL entirely unmounted and reports `unavailable`, so the
   * caller's fallback is the whole background. This is the kill switch: a
   * config lever, or an A/B against the fallback.
   */
  enabled?: boolean;
  /**
   * Called whenever the renderer's status changes. Drive the fallback layer's
   * visibility from this — the component deliberately does not own one, since
   * what to paint instead is a design decision, not a rendering one.
   */
  onStatusChange?: (status: ShaderFieldStatus) => void;
  /** Additional CSS classes */
  className?: string;
};

export interface ShaderFieldProps
  extends ShaderFieldOwnProps,
    Omit<React.ComponentPropsWithoutRef<'canvas'>, keyof ShaderFieldOwnProps> {}

/**
 * ShaderField paints an ambient WebGL2 field of soft Gaussian light sources,
 * each sampling a semantic colour token at runtime — so the whole thing
 * re-themes with `data-theme`, and with any scoped custom-property override,
 * without the caller wiring anything up.
 *
 * It is scenery, not interface: nothing about it is a signal, so its motion
 * cannot be mistaken for feedback. Two consequences follow, and both are
 * handled here rather than left to the caller.
 *
 * It honours reduced motion in JavaScript. The system's motion tokens collapse
 * under `prefers-reduced-motion`, but that guard is CSS-only and cannot see a
 * `requestAnimationFrame` loop; a GPU-driven surface has to check the query
 * itself. This one renders a single static frame and never starts its loop.
 *
 * And it always reports how it resolved. No WebGL2, a blocked or lost GPU
 * context, a renderer that stalls before its first frame, or `enabled={false}`
 * all arrive at `unavailable` through `onStatusChange`, so the caller can keep
 * a plain CSS fallback painted underneath. The canvas fills its positioned
 * ancestor and is inert to pointer events; give that ancestor the placement,
 * the clipping and any mask.
 */
export const ShaderField = React.forwardRef<HTMLCanvasElement, ShaderFieldProps>(
  (
    {
      params,
      blobs = DEFAULT_SHADER_BLOBS,
      enabled = true,
      onStatusChange,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // Merge with the internal ref rather than replacing it — the hook owns the
    // canvas, and the caller still gets a handle on it.
    React.useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement);

    const fieldParams = useMemo(
      () => ({ ...DEFAULT_SHADER_PARAMS, ...params, blobs }),
      [params, blobs],
    );

    const { supported, active } = useShaderField(canvasRef, fieldParams, enabled);

    const [gaveUp, setGaveUp] = useState(false);
    useEffect(() => {
      if (!enabled || active || !supported) return;
      const timer = window.setTimeout(() => setGaveUp(true), WATCHDOG_MS);
      return () => window.clearTimeout(timer);
    }, [enabled, active, supported]);

    /* active is tested before gaveUp, so a restore that lands after the
       watchdog fired still wins — the field fades in over the fallback. */
    const status: ShaderFieldStatus = !enabled || !supported
      ? 'unavailable'
      : active
        ? 'active'
        : gaveUp
          ? 'unavailable'
          : 'pending';

    const notify = useRef(onStatusChange);
    notify.current = onStatusChange;
    useEffect(() => {
      notify.current?.(status);
    }, [status]);

    if (!enabled) return null;

    const classes = ['ds-shader-field', className].filter(Boolean).join(' ');

    return (
      <canvas
        {...rest}
        ref={canvasRef}
        className={classes}
        data-status={status}
        aria-hidden="true"
      />
    );
  },
);

ShaderField.displayName = 'ShaderField';
