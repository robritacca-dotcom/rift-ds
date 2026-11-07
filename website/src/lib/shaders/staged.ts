"use client";

/**
 * The staged shader: the playground's shader pick, carried into the
 * templates it stages.
 *
 * The playground writes its pick onto its own root element as
 * `data-staged-shader`, a JSON `StagedShader`, and the Templates view
 * mirrors it onto the frame's root with the theme (TemplatesView's sync), so
 * a template's shader follows the pick. An attribute, like the product name
 * (useStagedProductName), so a pick or a slider never reloads the frame;
 * the sliders rewrite it in place, so a drag renders nothing in either
 * document.
 *
 * A template reads it through these hooks and falls back to its own shader
 * when there is none, so the same screen at its own route is unchanged.
 * Field untouched carries no params, which means "keep your own field".
 */
import React, { useSyncExternalStore } from "react";
import type { Values } from "./types";

export const STAGED_SHADER_ATTR = "data-staged-shader";

export type StagedShader = {
  /** The scene id: "field" for the theme's own ShaderField, or a lib/shaders scene. */
  sceneId: string;
  /** A lib/shaders scene's live values. */
  values?: Values;
  /** Field's settings, only when the playground has moved them. */
  params?: Record<string, number>;
};

export function readStaged(root: HTMLElement = document.documentElement): StagedShader | null {
  const raw = root.getAttribute(STAGED_SHADER_ATTR);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StagedShader;
    return typeof parsed?.sceneId === "string" ? parsed : null;
  } catch {
    return null;
  }
}

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [STAGED_SHADER_ATTR],
  });
  return () => observer.disconnect();
};

/** The staged scene's id, or "" when nothing is staged. Stable across slider moves. */
export function useStagedSceneId(): string {
  return useSyncExternalStore(
    subscribe,
    () => readStaged()?.sceneId ?? "",
    () => ""
  );
}

/** Field's staged settings as a string snapshot (stable while they hold), parsed. */
export function useStagedFieldParams(): Record<string, number> | undefined {
  const json = useSyncExternalStore(
    subscribe,
    () => {
      const staged = readStaged();
      return staged?.sceneId === "field" && staged.params ? JSON.stringify(staged.params) : "";
    },
    () => ""
  );
  return React.useMemo(() => (json ? (JSON.parse(json) as Record<string, number>) : undefined), [json]);
}

/**
 * A staged scene's live values as a ref, rewritten on every change of the
 * attribute without rendering, for a ShaderSurface to read each frame.
 */
export function useStagedValues(): React.RefObject<Values | null> {
  const ref = React.useRef<Values | null>(null);
  React.useEffect(() => {
    const read = () => {
      ref.current = readStaged()?.values ?? null;
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [STAGED_SHADER_ATTR],
    });
    return () => observer.disconnect();
  }, []);
  return ref;
}
