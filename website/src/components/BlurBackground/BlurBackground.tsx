"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import {
  ShaderField,
  type ShaderFieldStatus,
} from "@robr0/design-system/components/ShaderField/ShaderField";
import {
  shaderBackground,
  type BackgroundMode,
  type ShaderParams,
} from "@/data/shader-background";

/* Dev-only tuning panel, and the ternary is load-bearing: the bundler
   statically replaces process.env.NODE_ENV, so in a production build this
   whole expression folds to null and the import() in the untaken branch is
   never emitted. Calling dynamic() unconditionally and gating only the render
   would still ship the panel — verified by grepping .next/static/chunks. */
const ShaderTuner =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("./ShaderTuner"), { ssr: false })
    : null;

/**
 * Marker a page renders to make the background fill the viewport instead of
 * the 450px header band, suppressing the fade-to-page-colour mask.
 *
 * It is a marker rather than a prop because the background is mounted once in
 * the root layout and no longer re-renders per route. CSS reads the marker
 * from anywhere in the page (globals.css), so a page declares its own need
 * and there is no route list to keep in sync.
 */
export function FullBleedBackground() {
  return <div data-bg-full-bleed hidden />;
}

/**
 * Marker a page renders to hide the background entirely, leaving the flat page
 * colour — the dotted stages (the playground and the canvas board) render it
 * beside their DotBackground ground, and the marketing-dashboard template sets
 * the attribute itself.
 *
 * It hides the layer rather than unmounting it, and that is the point: the
 * mount is hoisted to the root layout precisely so the WebGL context survives
 * navigation, and tearing it down to save a few frames would pay for a fresh
 * context, shader compile, link and reveal fade the moment an ambient page
 * came back. Same marker mechanism as FullBleedBackground, for the same
 * reason.
 */
export function HiddenBackground() {
  return <div data-bg-hidden hidden />;
}

/**
 * The site background, on every page.
 *
 * Two layers, and the order matters. The eight CSS blobs render first and
 * always — server-side, on every page, exactly as they have since before the
 * shader existed. The design system's ShaderField then fades in *over* them
 * once a context is live, and the blobs fade out beneath it.
 *
 * That arrangement is the failsafe. No WebGL2, a blocked GPU, a lost context,
 * or `"mode": "css"` in the config, and the blobs simply stay painted: nothing
 * flashes, nothing is missing, and the server-rendered markup is identical
 * either way, so there is no hydration mismatch.
 *
 * This component owns only the site's half of that arrangement — the fixed
 * layer, the fallback blobs, the config and the dev tuner. The renderer, its
 * reduced-motion handling, context-loss recovery and the watchdog that bounds
 * "pending" all live in ShaderField, which reports which of the three states
 * it has reached.
 *
 * Every tuneable value comes from website/src/data/shader-background.json.
 * Append `?tune=1` to any page in `npm run dev --workspace website` to adjust them live.
 */
export default function BlurBackground() {
  const [params, setParams] = useState<ShaderParams>(shaderBackground.params);
  const [mode, setMode] = useState<BackgroundMode>(shaderBackground.mode);
  const [tuning, setTuning] = useState(false);
  const [status, setStatus] = useState<ShaderFieldStatus>("pending");
  /* Embedded in a frame (the /canvas board shows every page live inside an
     iframe), the page holds no GL context — a board of N pages would
     otherwise open N contexts, and browsers start evicting them well before
     that — and shows the CSS band instead, frozen: a still of the ambient
     background, so a framed page looks like itself. Detected after mount so
     the server markup stays identical; the hook loses the context it briefly
     opened when `enabled` flips. */
  const [embedded, setEmbedded] = useState(false);

  /* Read once on mount from the URL, which the server prerender cannot see —
     same approach as the playground's ?view= handling, and deliberately not
     useSearchParams, which would force a Suspense boundary on every page. */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (window.self !== window.top) setEmbedded(true);
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (!new URLSearchParams(window.location.search).has("tune")) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTuning(true);
  }, []);

  const onStatusChange = useCallback(
    (next: ShaderFieldStatus) => setStatus(next),
    [],
  );

  /**
   * Tri-state, and "pending" is the one that matters.
   *
   * The blobs used to paint at first paint and then hand off to the shader,
   * which read as two backgrounds in a row. They now start hidden while the
   * renderer is still resolving, so the field is simply what appears. The
   * trade is deliberate: on a machine that cannot run the shader, the first
   * moment is bare page floor before the blobs fade in, instead of blobs that
   * are immediately replaced.
   *
   * "css" resolves server-side, so that path never pends and the blobs are
   * painted in the very first frame with no gap at all.
   */
  const state =
    mode === "css" || embedded
      ? "off"
      : status === "active"
        ? "on"
        : status === "unavailable"
          ? "off"
          : "pending";

  return (
    <>
      <div
        className="blur-container"
        data-shader={state}
        data-embedded={embedded || undefined}
        aria-hidden="true"
      >
        <div className="blur-ellipse blur-yellow" />
        <div className="blur-ellipse blur-green" />
        <div className="blur-ellipse blur-purple" />
        <div className="blur-ellipse blur-neutral" />
        <div className="blur-ellipse blur-blue" />
        <div className="blur-ellipse blur-red" />
        <div className="blur-ellipse blur-orange" />
        <div className="blur-ellipse blur-teal" />

        <ShaderField
          params={params}
          blobs={shaderBackground.blobs}
          enabled={mode === "shader" && !embedded}
          onStatusChange={onStatusChange}
        />
      </div>

      {ShaderTuner && tuning && (
        <ShaderTuner
          params={params}
          onParamsChange={setParams}
          mode={mode}
          onModeChange={setMode}
          status={status}
        />
      )}
    </>
  );
}
