"use client";

/**
 * The site's background pick: the field (the site's own ShaderField) or one
 * of the library's scenes in its place, from SITE_BACKGROUNDS. The header's
 * BackgroundSwitcher picks it, on every page, as do the home hero's scene
 * row and the playground's scene picks; all come here.
 *
 * The pick is written as `data-background` on <html>, the way the theme row
 * writes `data-brand`, and the root layout's BlurBackground reads it, so the
 * one background mount (and its GL context) stays where it is. It is a
 * setting, held exactly as the theme pick is: it goes to localStorage under
 * BACKGROUND_STORAGE_KEY, the layout's pre-paint script puts it back on
 * <html> before first paint, and restoreDocumentTheme puts it back after a
 * root re-render, so a returning visitor lands on the background they chose
 * and keeps it across every page. Nothing stored means the served default
 * (the registry's `default`); the field's id, once picked, is the field,
 * which an absent attribute means.
 */
import { useSyncExternalStore } from "react";
import {
  BACKGROUND_ATTR,
  BACKGROUND_STORAGE_KEY,
  FIELD_BACKGROUND,
  isSceneBackground,
} from "./background-storage";

/* The registry, the names and the restore, kept React-free in
   background-storage so the root layout's pre-paint script can read them. */
export {
  BACKGROUND_ATTR,
  BACKGROUND_STORAGE_KEY,
  BACKGROUND_IDS,
  DEFAULT_BACKGROUND,
  FIELD_BACKGROUND,
  SITE_BACKGROUNDS,
  backgroundEntry,
  isSceneBackground,
  resolveBackground,
  restoreSiteBackground,
  type SiteBackground,
  type SiteBackgroundEntry,
} from "./background-storage";

const read = (): string => {
  const value = document.documentElement.getAttribute(BACKGROUND_ATTR);
  return isSceneBackground(value) ? value : FIELD_BACKGROUND;
};

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [BACKGROUND_ATTR],
  });
  window.addEventListener("storage", onChange);
  return () => {
    observer.disconnect();
    window.removeEventListener("storage", onChange);
  };
};

/** The background on <html>: the attribute's scene, or the field when it is absent.
    The server renders no attribute, so its snapshot is the field. */
export function useSiteBackground(): string {
  return useSyncExternalStore(subscribe, read, () => FIELD_BACKGROUND);
}

/** Picks the background, on <html> and in storage. The field removes the attribute. */
export function setSiteBackground(next: string) {
  if (isSceneBackground(next)) document.documentElement.setAttribute(BACKGROUND_ATTR, next);
  else document.documentElement.removeAttribute(BACKGROUND_ATTR);
  try {
    localStorage.setItem(BACKGROUND_STORAGE_KEY, next);
  } catch {
    /* private mode: the pick still applies for this page's lifetime */
  }
}
