"use client";

/**
 * The home page's background pick: Field (the site's own ShaderField) or the
 * Horizon scene, chosen from the switch beside the hero's theme row.
 *
 * The switch writes `data-home-shader` on <html>, the way the theme row
 * writes `data-brand`, and the root layout's BlurBackground reads it, so the
 * one background mount (and its GL context) stays where it is. Only the home
 * page writes it, and it clears it as it unmounts, so every other page keeps
 * the field. It holds for the visit, never stored: a try, not a setting.
 */
import { useSyncExternalStore } from "react";

export const HOME_SHADER_ATTR = "data-home-shader";

export type HomeShader = "field" | "horizon";

/* The horizon set low in the band, so its bright limb lands under the
   hero's calls to action instead of behind the counts, with the beam
   softened so the counts above it stay readable. Held at module
   scope, so the scene sees the same object every render. */
export const HOME_HORIZON_PARAMS = { crown: 0.22, beam: 0.55 };

const read = (): HomeShader =>
  document.documentElement.getAttribute(HOME_SHADER_ATTR) === "horizon" ? "horizon" : "field";

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [HOME_SHADER_ATTR],
  });
  return () => observer.disconnect();
};

/** The background the home page picked; "field" everywhere else. */
export function useHomeShader(): HomeShader {
  return useSyncExternalStore(subscribe, read, () => "field");
}

/** Picks the home page's background. "field" removes the attribute. */
export function setHomeShader(next: HomeShader) {
  if (next === "field") document.documentElement.removeAttribute(HOME_SHADER_ATTR);
  else document.documentElement.setAttribute(HOME_SHADER_ATTR, next);
}
