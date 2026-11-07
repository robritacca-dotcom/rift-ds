'use client';

import React from 'react';
import { PASSES } from './passes';
import { coloursFor, createRenderer } from './renderer';
import { SCENES } from './scenes';
import { defaultsFor, type Values } from './types';
import './ShaderScene.css';

/** The scenes ShaderScene paints. */
export type ShaderSceneId = 'horizon' | 'rift';

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

  const setRef = (node: HTMLDivElement | null) => {
    hostRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  React.useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl2', { antialias: false, alpha: false });
    if (!host || !canvas || !gl) return;
    const renderer = createRenderer(gl, definition, PASSES);
    if (!renderer) return;

    const applyColours = () => renderer.setColours(coloursFor(host, definition));
    const resize = () => {
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(host.clientWidth * ratio));
      canvas.height = Math.max(1, Math.round(host.clientHeight * ratio));
    };

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let time = 20;
    let last = performance.now();
    let frame = 0;
    const draw = (now: number) => {
      const values = liveRef?.current ?? mergedRef.current;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!still) time += dt * values.speed;
      renderer.draw(values, time, canvas.width, canvas.height);
      frame = requestAnimationFrame(draw);
    };

    applyColours();
    resize();
    frame = requestAnimationFrame(draw);

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
      cancelAnimationFrame(frame);
      sizeObserver.disconnect();
      themeObserver.disconnect();
      renderer.dispose();
    };
  }, [definition, liveRef]);

  const classes = ['ds-shader-scene', className].filter(Boolean).join(' ');

  return (
    <div {...rest} ref={setRef} className={classes} aria-hidden="true">
      <canvas ref={canvasRef} className="ds-shader-scene__canvas" />
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
