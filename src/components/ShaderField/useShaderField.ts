"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { BLOB_COUNT, fragmentSource, vertexSource } from "./field.glsl";

/** The eight tuneable properties of the field. */
export interface ShaderParams {
  /** Overall opacity of the field, 0.1–1. */
  intensity: number;
  /** Domain-warp strength: how much fbm noise bends the field, 0–0.5. */
  warp: number;
  /** Noise frequency. Higher values give finer, busier structure, 0.5–6. */
  scale: number;
  /** Drift-rate multiplier on every blob's period, 0–4. */
  speed: number;
  /** Dither/film-grain amplitude, 0–0.4. Also what kills 8-bit banding. */
  grain: number;
  /** Anisotropic stretch: 0 renders discs, 1 renders diagonal streams, 0–1. */
  streak: number;
  /**
   * Cursor-wake strength, 0–1. Defaults to 0 — the interaction is built and
   * dormant, not absent. Raising it turns on the swirl and glow trail, and
   * with them the loop's step up from 30fps to 60fps while a wake is alive.
   */
  react: number;
  /**
   * How much the composition resists shrinking with the container, 0–1.
   *
   * At 0 — the default, and the behaviour a CSS blob layer has — the whole
   * field is fitted to whatever width it is given, so a phone shows the
   * entire composition at phone scale: every source small, and more of them
   * crowded into view than the look was built for. At 1 the field holds the
   * scale it was composed at (`REFERENCE_WIDTH`) and a narrower container
   * crops into it instead. Values between blend the two geometrically,
   * keeping some of the shrink so colours still bleed together on a small
   * screen. Above the reference width it does nothing.
   *
   * Raise it for a full-viewport background, which is read on a phone as a
   * scene rather than a diagram; leave it at 0 wherever the point is to see
   * the whole composition, such as a small demo tile.
   */
  crop: number;
}

/**
 * One light source in the field.
 *
 * The coordinate space is the shader's (see field.glsl): origin at the
 * container centre, one unit = container width, y running downward. Centres
 * are constants — nothing here is recomputed on resize.
 */
export interface ShaderBlob {
  /**
   * Semantic colour token, read from the canvas's computed style at runtime,
   * so the field re-themes with `data-theme` and with any scoped custom-
   * property override. A token nothing defines resolves to no colour — an
   * invisible source, never an error.
   */
  token: string;
  /** Disc diameter in container-width units. */
  size: number;
  /** Centre offset from the container centre, width units. */
  cx: number;
  /** Centre offset from the container centre, width units. */
  cy: number;
  /** Drift cycle in seconds, before `speed` is applied. */
  period: number;
  /** Phase offset, so sources never move in lockstep. */
  phase: number;
  /**
   * Emission weight. Positive emits light; negative absorbs it, giving a
   * shadow that occludes whatever shines behind it.
   */
  weight: number;
}

/**
 * The shipped look: eight parameters tuned by eye, cursor wake off. Spread it
 * and override the one or two you want rather than restating the set.
 */
export const DEFAULT_SHADER_PARAMS: ShaderParams = {
  intensity: 0.5,
  warp: 0.14,
  scale: 2.7,
  speed: 2,
  grain: 0.1,
  streak: 0.4,
  react: 0,
  crop: 0.5,
};

/**
 * The default composition: eight sources on core accent tokens, filling
 * BLOB_COUNT exactly.
 *
 * `--color-action-primary-bg` is deliberately absent. The action colour is
 * reserved for CTAs and focus rings, and a full-viewport decorative field is
 * precisely the use that would stop it meaning "click here" — so the last
 * source takes `--color-core-ui-secondary` instead.
 */
export const DEFAULT_SHADER_BLOBS: readonly ShaderBlob[] = [
  { token: "--color-core-accent-gold", size: 0.45, cx: 0.175, cy: 0.125, period: 18, phase: 0, weight: 1 },
  { token: "--color-core-accent-mint", size: 0.55, cx: 0.125, cy: 0.125, period: 16, phase: 1, weight: 1 },
  { token: "--color-core-accent-violet", size: 0.9, cx: 0.35, cy: 0.25, period: 22, phase: 0.5, weight: 1 },
  { token: "--color-bg-container-secondary", size: 0.55, cx: 0.025, cy: 0.075, period: 14, phase: 1.5, weight: 1 },
  { token: "--color-core-accent-cobalt", size: 0.55, cx: -0.125, cy: 0.475, period: 17, phase: 0.8, weight: 1 },
  { token: "--color-core-accent-coral", size: 0.48, cx: 0.39, cy: -0.26, period: 19, phase: 0.3, weight: 1 },
  { token: "--color-core-accent-amber", size: 0.3, cx: 0.35, cy: 0.3, period: 15, phase: 1.2, weight: 1 },
  { token: "--color-core-ui-secondary", size: 0.75, cx: -0.125, cy: -0.025, period: 20, phase: 0.7, weight: 1 },
];

/**
 * Live tunables. Changing them never rebuilds the GL state — the render loop
 * reads them through a ref, and a paused field redraws one frame.
 */
export interface ShaderFieldParams extends ShaderParams {
  /** The colour-source table; swap it to change composition live. */
  blobs: readonly ShaderBlob[];
}

export interface ShaderFieldState {
  /** False once getContext('webgl2') has returned null — the caller should
   *  leave its CSS fallback painted. */
  supported: boolean;
  /** True once the first frame has been drawn. */
  active: boolean;
}

/* Half device resolution: the field is entirely low-frequency, so the CSS
   upscale is indistinguishable and fill cost roughly quarters. */
const RENDER_SCALE = 0.5;
/* The width the compositions here are framed for, in CSS pixels — a desktop
   page. `crop` measures the field against this instead of the container when
   the container is narrower, so a phone crops into the composition rather
   than shrinking all of it into 375px. Wider containers are never scaled up:
   the field is built to fill, and a 4K monitor should show more of it, not a
   magnified version of the same frame. */
const REFERENCE_WIDTH = 1440;

/**
 * Pixels per field unit for a container of this CSS width — the divisor the
 * shader's coordinate space is built on, and the same one the pointer has to
 * be mapped through or the wake would land somewhere else on the field.
 *
 * Geometric blend, so `crop` reads as a proportion of the way from "fit the
 * whole composition" to "hold its scale and crop": at 375px wide, crop 0.5
 * measures the field against 735px rather than 375px or 1440px.
 */
function fieldUnit(cssWidth: number, crop: number): number {
  if (cssWidth <= 0) return 1;
  return cssWidth * Math.pow(Math.max(REFERENCE_WIDTH / cssWidth, 1), crop);
}
/* 30fps at rest: the slowest blob cycle is 22s — nothing in the ambient
   drift moves fast enough for 60fps to be visible on a field with no hard
   edges. The cursor wake is the exception: it tracks the hand, and 30fps
   reads as judder there, so the loop steps up to 60 while a wake is alive
   and drops back once it decays. */
const FRAME_MS = 1000 / 30;
const FRAME_MS_ACTIVE = 1000 / 60;
/* Wake speed below which the field is treated as at rest. */
const WAKE_IDLE = 0.015;
/* Colour crossfade on theme change, matching --motion-duration-slow. */
const COLOR_FADE_MS = 300;

/* Token colour → linear RGB. Computed custom-property values arrive with the
   var() chain already resolved, so this only needs hex and rgb() forms. */
export function parseColor(value: string): [number, number, number] | null {
  const v = value.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v);
  if (hex) {
    const h = hex[1];
    const full =
      h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    return [
      parseInt(full.slice(0, 2), 16) / 255,
      parseInt(full.slice(2, 4), 16) / 255,
      parseInt(full.slice(4, 6), 16) / 255,
    ];
  }
  const rgb = /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(v);
  if (rgb) {
    return [Number(rgb[1]) / 255, Number(rgb[2]) / 255, Number(rgb[3]) / 255];
  }
  return null;
}

export function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("ShaderField compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * Owns the whole WebGL2 lifetime for the field: context, program, uniforms,
 * the 30fps rAF loop, reduced-motion handling, theme observation, resize,
 * context loss, and teardown.
 */
/* Chrome returns null from getExtension('WEBGL_lose_context') once a context
 * is lost, so a mount that inherits a context our previous cleanup released
 * (React StrictMode re-runs effects on the same canvas) could never restore
 * it. The extension object is grabbed while healthy and stashed on the node.
 */
type CanvasWithStash = HTMLCanvasElement & {
  __dsLoseExt?: WEBGL_lose_context | null;
};

export function useShaderField(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  params: ShaderFieldParams,
  /* False keeps GL entirely unmounted — the caller's CSS blobs are the whole
     background — the kill switch, and the A/B against the fallback. */
  enabled = true
): ShaderFieldState {
  const [supported, setSupported] = useState(true);
  const [active, setActive] = useState(false);

  const paramsRef = useRef(params);
  const redrawRef = useRef<() => void>(() => {});

  // Params flow through a ref so slider drags never re-run the main effect;
  // a paused field (reduced motion) still gets one fresh frame per change.
  useEffect(() => {
    paramsRef.current = params;
    redrawRef.current();
  }, [params]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: "low-power",
    });
    if (!gl) {
      setSupported(false);
      return;
    }
    // Stash while healthy — unreachable later if the context is ever lost.
    if (!gl.isContextLost()) {
      (canvas as CanvasWithStash).__dsLoseExt =
        gl.getExtension("WEBGL_lose_context");
    }
    const loseExt = () =>
      gl.getExtension("WEBGL_lose_context") ??
      (canvas as CanvasWithStash).__dsLoseExt ??
      null;

    // -- program + static state, rebuilt on context restore ------------------

    let program: WebGLProgram | null = null;
    let vao: WebGLVertexArrayObject | null = null;
    let loc: Record<string, WebGLUniformLocation | null> = {};

    function initGL(): boolean {
      if (!gl) return false;
      const vs = compile(gl, gl.VERTEX_SHADER, vertexSource);
      const fs = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
      if (!vs || !fs) return false;
      program = gl.createProgram();
      if (!program) return false;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("ShaderField link error:", gl.getProgramInfoLog(program));
        return false;
      }
      gl.useProgram(program);
      vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      gl.disable(gl.BLEND);
      gl.disable(gl.DEPTH_TEST);

      // Subscripted names: querying "u_color[0]" is what the spec guarantees.
      loc = {};
      for (const name of [
        "u_resolution",
        "u_unit",
        "u_time",
        "u_color[0]",
        "u_blob[0]",
        "u_motion[0]",
        "u_intensity",
        "u_warp",
        "u_scale",
        "u_grain",
        "u_streak",
        "u_mouse",
        "u_mvel",
        "u_react",
      ]) {
        loc[name] = gl.getUniformLocation(program, name);
      }
      return true;
    }

    // -- blob table upload (composition can be swapped live) -----------------

    let uploadedBlobs: readonly ShaderBlob[] | null = null;

    function uploadBlobs(blobs: readonly ShaderBlob[]) {
      if (!gl) return;
      const blob = new Float32Array(BLOB_COUNT * 4);
      const motion = new Float32Array(BLOB_COUNT * 4);
      for (let i = 0; i < BLOB_COUNT; i++) {
        const b = blobs[i];
        if (!b) {
          // Pad unused slots far off-screen: their Gaussians contribute 0.
          blob[i * 4 + 0] = 99;
          blob[i * 4 + 1] = 99;
          blob[i * 4 + 2] = 0.01;
          continue;
        }
        blob[i * 4 + 0] = b.cx;
        blob[i * 4 + 1] = b.cy;
        blob[i * 4 + 2] = b.size * 0.42; // sigma: softness knob
        blob[i * 4 + 3] = b.weight; // emission weight; negative absorbs
        const wx = (2 * Math.PI) / b.period;
        motion[i * 4 + 0] = wx;
        motion[i * 4 + 1] = wx * 0.83; // Lissajous ratio: paths never repeat
        motion[i * 4 + 2] = b.phase * 2.1;
        motion[i * 4 + 3] = b.phase * 3.7;
      }
      gl.uniform4fv(loc["u_blob[0]"], blob);
      gl.uniform4fv(loc["u_motion[0]"], motion);
      uploadedBlobs = blobs;
    }

    // -- colours -------------------------------------------------------------

    const colorCurrent = new Float32Array(BLOB_COUNT * 3);
    const colorTarget = new Float32Array(BLOB_COUNT * 3);
    let colorFadeT = COLOR_FADE_MS; // done

    function readColors(into: Float32Array) {
      // Read from the canvas, not documentElement, so scoped overrides
      // (custom properties written onto an ancestor) apply.
      const style = getComputedStyle(canvas as HTMLCanvasElement);
      into.fill(0);
      paramsRef.current.blobs.slice(0, BLOB_COUNT).forEach((b, i) => {
        const parsed = parseColor(style.getPropertyValue(b.token));
        if (parsed) {
          into[i * 3 + 0] = srgbToLinear(parsed[0]);
          into[i * 3 + 1] = srgbToLinear(parsed[1]);
          into[i * 3 + 2] = srgbToLinear(parsed[2]);
        }
      });
    }

    readColors(colorCurrent);
    colorTarget.set(colorCurrent);

    // -- sizing --------------------------------------------------------------

    let bufWidth = 0;
    let bufHeight = 0;
    /* CSS width behind the current buffer. `crop` is a live param, so the
       unit it resolves to is uploaded per frame rather than here — this is
       what that computation measures against. */
    let cssWidth = 0;

    function resize() {
      if (!gl) return;
      const c = canvas as HTMLCanvasElement;
      const dpr = window.devicePixelRatio || 1;
      cssWidth = c.clientWidth;
      const w = Math.max(1, Math.round(c.clientWidth * dpr * RENDER_SCALE));
      const h = Math.max(1, Math.round(c.clientHeight * dpr * RENDER_SCALE));
      // Compare before reallocating: mobile URL-bar collapse fires resize
      // storms and canvas reallocation is the expensive part.
      if (w === bufWidth && h === bufHeight) return;
      bufWidth = w;
      bufHeight = h;
      c.width = w;
      c.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(loc["u_resolution"], w, h);
    }

    // -- render --------------------------------------------------------------

    let fieldTime = 0;
    let colorsDirty = false;

    // -- pointer tracking ----------------------------------------------------
    // The canvas is pointer-events: none, so the pointer is tracked on the
    // window and mapped into the shader's coordinate space (origin at the
    // container centre, one unit = container width, y down). The rendered
    // position trails the real one, and speed decays, so the wake eases out.
    const mouseTarget = { x: 9, y: 9 }; // off-field until the first move
    const mouse = { x: 9, y: 9 };
    let mouseVel = 0;
    /* Distance travelled since the last frame. Speed is derived from this
       once per frame rather than per pointer event: event delivery is bursty
       and irregular (coalesced batches, sub-millisecond gaps), so dividing a
       per-event distance by a per-event dt produced wild spikes — the flicker
       on movement. Accumulating decouples speed from event rate entirely. */
    let moveAccum = 0;

    const onPointerMove = (e: PointerEvent) => {
      const c = canvas as HTMLCanvasElement;
      const rect = c.getBoundingClientRect();
      if (rect.width === 0) return;
      const unit = fieldUnit(rect.width, paramsRef.current.crop);
      const x = (e.clientX - rect.left - rect.width / 2) / unit;
      const y = (e.clientY - rect.top - rect.height / 2) / unit;
      if (mouseTarget.x < 5) {
        moveAccum += Math.hypot(x - mouseTarget.x, y - mouseTarget.y);
      }
      mouseTarget.x = x;
      mouseTarget.y = y;
      if (mouse.x > 5) {
        // First entry: snap instead of gliding in from the parking spot.
        mouse.x = x;
        mouse.y = y;
      }
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    function draw(dtMs: number) {
      if (!gl || !program) return;
      resize();
      if (paramsRef.current.blobs !== uploadedBlobs) {
        uploadBlobs(paramsRef.current.blobs);
        colorsDirty = true;
      }
      if (colorsDirty) {
        readColors(colorTarget);
        colorFadeT = 0;
        colorsDirty = false;
      }
      if (colorFadeT < COLOR_FADE_MS) {
        colorFadeT = Math.min(colorFadeT + dtMs, COLOR_FADE_MS);
        const t = colorFadeT / COLOR_FADE_MS;
        for (let i = 0; i < colorCurrent.length; i++) {
          colorCurrent[i] += (colorTarget[i] - colorCurrent[i]) * t;
        }
      }
      const p = paramsRef.current;
      gl.uniform3fv(loc["u_color[0]"], colorCurrent);
      /* Buffer pixels per field unit: the CSS ratio, applied to the buffer,
         so render scale and DPR stay out of the coordinate space. */
      gl.uniform1f(
        loc["u_unit"],
        bufWidth * (fieldUnit(cssWidth, p.crop) / Math.max(cssWidth, 1)),
      );
      gl.uniform1f(loc["u_time"], fieldTime);
      gl.uniform1f(loc["u_intensity"], p.intensity);
      gl.uniform1f(loc["u_warp"], p.warp);
      gl.uniform1f(loc["u_scale"], p.scale);
      gl.uniform1f(loc["u_grain"], p.grain);
      gl.uniform1f(loc["u_streak"], p.streak);
      // Ease the rendered pointer toward the real one, and resolve speed from
      // the distance banked since the last frame.
      const dtSec = Math.max(dtMs / 1000, 1e-3);
      const k = 1 - Math.exp(-dtSec * 14);
      mouse.x += (mouseTarget.x - mouse.x) * k;
      mouse.y += (mouseTarget.y - mouse.y) * k;
      const instant = moveAccum / dtSec;
      moveAccum = 0;
      // Asymmetric smoothing: rise fast so a sweep registers immediately,
      // fall slow so the wake trails instead of snapping off.
      const blend = 1 - Math.exp(-dtSec * (instant > mouseVel ? 14 : 2.2));
      mouseVel += (instant - mouseVel) * blend;
      gl.uniform2f(loc["u_mouse"], mouse.x, mouse.y);
      gl.uniform1f(loc["u_mvel"], mouseVel);
      gl.uniform1f(loc["u_react"], p.react);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      frameBudget =
        mouseVel > WAKE_IDLE && p.react > 0 ? FRAME_MS_ACTIVE : FRAME_MS;
    }

    // -- loop, pause signals, observers --------------------------------------

    let raf = 0;
    let lastDraw = 0;
    let running = false;
    let disposed = false;
    /* Raised to FRAME_MS_ACTIVE while a cursor wake is alive — see the
       constant's note. Set at the end of each draw from the current speed. */
    let frameBudget = FRAME_MS;

    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      const elapsed = now - lastDraw;
      if (elapsed < frameBudget - 1) return;
      // Clamp so a backgrounded tab does not lurch on return.
      const dt = Math.min(elapsed, 100);
      lastDraw = now;
      fieldTime += (dt / 1000) * paramsRef.current.speed;
      draw(dt);
    }

    function start() {
      if (running || disposed || reduceQuery.matches || document.hidden) return;
      running = true;
      lastDraw = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    /** One fresh frame while paused (reduced motion, param tweak, theme). */
    function renderOnce() {
      if (disposed || running) return;
      draw(COLOR_FADE_MS); // snap any colour fade — no loop to animate it
    }

    redrawRef.current = renderOnce;

    const onReduceChange = () => {
      if (reduceQuery.matches) {
        stop();
        renderOnce();
      } else {
        start();
      }
    };
    reduceQuery.addEventListener("change", onReduceChange);

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // data-theme drives the palette; the style filter catches a consumer
    // writing custom-property overrides live. Coalesced to a flag: one drag
    // emits dozens of records, and colours are re-read at most once per frame.
    const themeObserver = new MutationObserver(() => {
      colorsDirty = true;
      if (!running) {
        readColors(colorTarget);
        colorCurrent.set(colorTarget);
        colorsDirty = false;
        renderOnce();
      }
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "style"],
    });

    const resizeObserver = new ResizeObserver(() => {
      if (!running) {
        renderOnce(); // resize() runs inside draw()
      }
    });
    resizeObserver.observe(canvas);

    let restoreTimer = 0;
    const onContextLost = (e: Event) => {
      e.preventDefault(); // signals we want a restore
      stop();
      setActive(false);
      // The browser fires webglcontextrestored at its own discretion. If it
      // has not within a beat, try to force one; when the loss was real (GPU
      // reset, resource pressure) restoreContext throws — the canvas is dead,
      // so report unsupported and leave the caller's fallback painted.
      window.clearTimeout(restoreTimer);
      restoreTimer = window.setTimeout(() => {
        if (disposed || !gl.isContextLost()) return;
        try {
          loseExt()?.restoreContext();
        } catch {
          setSupported(false);
        }
      }, 700);
    };
    const onContextRestored = () => {
      if (initGL()) {
        bufWidth = 0; // force reallocation
        bufHeight = 0;
        uploadedBlobs = null; // new program: fresh uniform state
        colorsDirty = true;
        setActive(true);
        if (reduceQuery.matches) renderOnce();
        else start();
      }
    };
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    if (gl.isContextLost()) {
      // Remount onto a canvas whose context we released in a previous
      // cleanup (React StrictMode double-mounts effects in dev): the same
      // canvas returns the same, dead context. Ask for a restore — the
      // webglcontextrestored handler above does the boot.
      //
      // Both give-up paths must report unsupported, not just the throwing
      // one. Without the extension there is nothing to ask, so no restore
      // event will ever arrive; staying silent left the caller waiting on a
      // resolution that could not come, which reads as no background at all.
      const ext = loseExt();
      if (!ext) {
        queueMicrotask(() => setSupported(false));
      } else {
        try {
          ext.restoreContext();
        } catch {
          queueMicrotask(() => setSupported(false));
        }
      }
    } else if (initGL()) {
      // First frame before the reveal, so the cross-fade never shows blank.
      draw(COLOR_FADE_MS);
      setActive(true);
      start();
    } else {
      // Compile/link failure: report unsupported but fall through to the
      // normal cleanup registration — observers are already attached.
      setSupported(false);
    }

    return () => {
      disposed = true;
      stop();
      window.clearTimeout(restoreTimer);
      redrawRef.current = () => {};
      window.removeEventListener("pointermove", onPointerMove);
      reduceQuery.removeEventListener("change", onReduceChange);
      document.removeEventListener("visibilitychange", onVisibility);
      themeObserver.disconnect();
      resizeObserver.disconnect();
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      if (program) gl.deleteProgram(program);
      if (vao) gl.deleteVertexArray(vao);
      // Chrome caps live WebGL contexts (~16) and silently kills the oldest;
      // a router that remounts this on navigation would leak one context per
      // visit, so release explicitly rather than waiting to be evicted. The
      // stashed extension lets the next mount on this canvas restore it.
      try {
        if (!gl.isContextLost()) loseExt()?.loseContext();
      } catch {
        /* already lost — nothing to release */
      }
    };
  }, [canvasRef, enabled]);

  return { supported, active };
}
