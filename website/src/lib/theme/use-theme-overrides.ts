"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

/**
 * The application half of the theme levers, shared by the playground and
 * the design-system landing page's accent switcher. theme-overrides.ts
 * computes what to override; this hook is the one place that writes it.
 *
 * Custom properties substitute var() where they are declared, and the
 * semantic layer is declared on :root — so primitive overrides must land on
 * the root element to cascade (a wrapper div would change nothing). Every
 * applied key is tracked and removed on the next apply and on unmount, so
 * client navigation away restores the shipped theme.
 */

/* Live theme tracking (same pattern as foundations/colour-mode) so
   theme-dependent override plans re-derive when the light/dark toggle
   flips. */
function subscribeToTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

/** The current data-theme value, live across toggle flips. */
export function useSiteTheme(): string {
  return useSyncExternalStore(
    subscribeToTheme,
    () => document.documentElement.getAttribute("data-theme") ?? "dark",
    () => "dark"
  );
}

/** Applies an override map to :root, replacing the previous application and cleaning up on unmount. */
export function useAppliedOverrides(overrides: Record<string, string>) {
  const appliedKeys = useRef<string[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    for (const key of appliedKeys.current) root.style.removeProperty(key);
    for (const [name, value] of Object.entries(overrides)) {
      root.style.setProperty(name, value);
    }
    appliedKeys.current = Object.keys(overrides);
  }, [overrides]);

  useEffect(() => {
    const root = document.documentElement;
    const cleanupRef = appliedKeys;
    return () => {
      for (const key of cleanupRef.current) root.style.removeProperty(key);
    };
  }, []);
}
