'use client';

import React from 'react';
import { MOTION_RENDERER_WATCHDOG_MS } from '../../tokens/motion';
import { PASSES } from './passes';
import { coloursFor, createRenderer } from './renderer';
import { SCENES } from './scenes';
import { defaultsFor, type Values } from './types';
import './ShaderScene.css';

/* At most one drawing-buffer pixel per CSS pixel. Both scenes are soft
   light, layered noise with no edge finer than a CSS pixel, so a 2x
   screen's extra pixels were invisible and quadrupled the fill: the scene
   runs fourteen layered noise lookups per pixel, and a full-width band at
   2x was six million pixels a frame. */
const MAX_PIXEL_RATIO = 1;
/* 30fps, as ShaderField holds at rest: the scenes drift on cycles of
   tens of seconds, too slowly for 60fps to be visible, and every frame
   skipped is a whole scene's fill the GPU gives back to the page. */
const FRAME_MS = 1000 / 30;

/** The scenes ShaderScene paints. */
export type ShaderSceneId = 'horizon' | 'rift';

/**
 * How the scene resolved, the same three states ShaderField reports.
 * `pending` while the GL context comes up (bounded by a watchdog), `active`
 * once a frame has painted, `unavailable` when it is disabled or WebGL2
 * cannot run it.
 */
export type ShaderSceneStatus = 'pending' | 'active' | 'unavailable';

/** One finishing pass's setting: whether it runs, and its own settings. */
export type ShaderScenePassSetting = {
  /** Run the pass. Each pass has its own default. */
  on?: boolean;
  /** The pass's settings, merged over its defaults. */
  params?: Partial<Record<string, number>>;
};

/** Props owned by ShaderScene itself; everything else falls through to the root. */
type ShaderSceneOwnProps = {
  /** The scene to paint: `horizon`, a planet's limb at night, or `rift`, a glowing tear. */
  scene?: ShaderSceneId;
  /**
   * The scene's settings, merged over its defaults (`SHADER_SCENES` lists each
   * scene's keys and ranges), so passing one changes one thing. Changing them
   * never rebuilds the GL state.
   */
  params?: Partial<Record<string, number>>;
  /**
   * The finishing passes (`scrim`, `vignette`, `fadeTop`, `fadeBottom`,
   * `grain`), each merged over its defaults.
   */
  passes?: Partial<Record<string, ShaderScenePassSetting>>;
  /** Scene seconds per second: how fast it moves. 0 holds it still. */
  speed?: number;
  /**
   * A ref the scene reads every frame in place of `params`, `passes` and
   * `speed`, for a host that tunes it by drag: writing the ref moves the
   * scene and renders nothing. Empty falls back to the props.
   */
  liveRef?: React.RefObject<Values | null>;
  /**
   * False never starts WebGL and reports `unavailable`, leaving the page
   * ground: the kill switch, as on ShaderField.
   */
  enabled?: boolean;
  /**
   * Called whenever the status changes. Drive a fallback from this: the scene
   * paints only the page ground when it cannot run, and what to show instead
   * is the caller's design decision.
   */
  onStatusChange?: (status: ShaderSceneStatus) => void;
  /** Additional CSS classes */
  className?: string;
};

export interface ShaderSceneProps
  extends ShaderSceneOwnProps,
    Omit<React.ComponentPropsWithRef<'div'>, keyof ShaderSceneOwnProps> {}

const DEFAULT_SPEED = 1.6;

/**
 * ShaderScene paints one of the system's shader scenes, a horizon or a rift,
 * in WebGL2, with finishing passes over it (a scrim, a vignette, top and
 * bottom fades to the page, film grain). Its colours are the background
 * field's roles (`--color-ambient-*`) read from the live cascade at the
 * scene, so it re-themes with `data-theme`, a preset or any scoped override,
 * and its fades melt into the page ground.
 *
 * Both scenes are night scenes: they add light over a dark ground. On a light
 * page each computes its light against a dark ground of its own and lays it
 * onto the page as a pale tint, so it reads as a soft dawn rather than a dark
 * block. Nothing here sets `data-theme`, which would hide a preset's colours.
 *
 * It is scenery, not interface. It fills its positioned ancestor and is inert
 * to pointer events and to assistive tech; give the ancestor the placement and
 * the clipping. It honours reduced motion in JavaScript, holding a still frame
 * that still answers its settings, and paints the page ground alone where
 * WebGL2 is unavailable.
 */
export function ShaderScene({
  scene = 'horizon',
  params,
  passes,
  speed = DEFAULT_SPEED,
  liveRef,
  enabled = true,
  onStatusChange,
  className = '',
  ref,
  ...rest
}: ShaderSceneProps) {
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const definition = SCENES.find((s) => s.id === scene) ?? SCENES[0];

  /* The props merged over the defaults, kept in a ref the frame loop reads,
     so a new prop moves the scene without rebuilding the program. */
  const merged = React.useMemo<Values>(
    () => ({
      speed,
      scene: { ...defaultsFor(definition.params), ...params } as Record<string, number>,
      passes: Object.fromEntries(
        PASSES.map((pass) => {
          const setting = passes?.[pass.id];
          return [
            pass.id,
            {
              on: setting?.on ?? pass.on,
              params: { ...defaultsFor(pass.params), ...setting?.params } as Record<string, number>,
            },
          ];
        })
      ),
    }),
    [definition, params, passes, speed]
  );
  const mergedRef = React.useRef(merged);
  React.useEffect(() => {
    mergedRef.current = merged;
  }, [merged]);

  /* 'failed' and 'painted' come from the GL effect; the watchdog bounds a
     context that never paints, so pending can never be terminal. */
  const [gl, setGl] = React.useState<'pending' | 'failed' | 'painted'>('pending');
  const [gaveUp, setGaveUp] = React.useState(false);
  React.useEffect(() => {
    if (!enabled || gl !== 'pending') return;
    const timer = window.setTimeout(() => setGaveUp(true), MOTION_RENDERER_WATCHDOG_MS);
    return () => window.clearTimeout(timer);
  }, [enabled, gl]);
  const status: ShaderSceneStatus =
    !enabled || gl === 'failed'
      ? 'unavailable'
      : gl === 'painted'
        ? 'active'
        : gaveUp
          ? 'unavailable'
          : 'pending';
  const notify = React.useRef(onStatusChange);
  React.useEffect(() => {
    notify.current = onStatusChange;
  }, [onStatusChange]);
  React.useEffect(() => {
    notify.current?.(status);
  }, [status]);

  const setRef = (node: HTMLDivElement | null) => {
    hostRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  React.useEffect(() => {
    if (!enabled) return;
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('webgl2', { antialias: false, alpha: false });
    const renderer = context ? createRenderer(context, definition, PASSES) : null;
    if (!host || !canvas || !renderer) {
      /* Reported from a frame, not the effect body, so the effect never
         sets state synchronously. */
      const failed = requestAnimationFrame(() => setGl('failed'));
      return () => cancelAnimationFrame(failed);
    }

    const applyColours = () => renderer.setColours(coloursFor(host, definition));
    const resize = () => {
      const ratio = Math.min(MAX_PIXEL_RATIO, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(host.clientWidth * ratio));
      canvas.height = Math.max(1, Math.round(host.clientHeight * ratio));
    };

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let time = 20;
    let last = performance.now();
    let frame = 0;
    let painted = false;
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      if (painted && now - last < FRAME_MS - 1) return;
      const values = liveRef?.current ?? mergedRef.current;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!still) time += dt * values.speed;
      renderer.draw(values, time, canvas.width, canvas.height);
      if (!painted) {
        painted = true;
        setGl('painted');
      }
    };
    /* The loop runs only near the screen, as ShaderField's does: it stops
       when the scene scrolls away and starts again 200px before it returns,
       so a page of stages draws only the ones in view. A hidden tab stops
       requestAnimationFrame by itself. */
    const start = () => {
      if (frame) return;
      last = performance.now();
      frame = requestAnimationFrame(draw);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    applyColours();
    resize();
    start();
    const visibilityObserver =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            (entries) => (entries[entries.length - 1].isIntersecting ? start() : stop()),
            { rootMargin: '200px 0px' }
          );
    visibilityObserver?.observe(host);

    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(host);
    /* A theme flip, a preset and a live override (an inline custom property
       on the root) all re-read the colours. */
    const themeObserver = new MutationObserver(applyColours);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'data-brand', 'style'],
    });

    return () => {
      stop();
      visibilityObserver?.disconnect();
      sizeObserver.disconnect();
      themeObserver.disconnect();
      renderer.dispose();
    };
  }, [definition, liveRef, enabled]);

  const classes = ['ds-shader-scene', className].filter(Boolean).join(' ');

  return (
    <div {...rest} ref={setRef} className={classes} data-status={status} aria-hidden="true">
      {enabled && <canvas ref={canvasRef} className="ds-shader-scene__canvas" />}
    </div>
  );
}

/* The engine's data and helpers, re-exported below the component so the
   docs parser names the component after itself (see ShaderField.tsx), and
   so the barrel carries what a host needs to draw controls for a scene. */
export type {
  ParamSpec as ShaderSceneParamSpec,
  Scene as ShaderSceneDefinition,
  Pass as ShaderScenePass,
  Values as ShaderSceneValues,
  Recipe as ShaderSceneRecipe,
} from './types';
/* eslint-disable react-refresh/only-export-components */
export { SCENES as SHADER_SCENES } from './scenes';
export { PASSES as SHADER_PASSES } from './passes';
export { defaultsFor as shaderSceneDefaults } from './types';
export { bakeThumbnails as shaderSceneStills } from './renderer';
/* eslint-enable react-refresh/only-export-components */
