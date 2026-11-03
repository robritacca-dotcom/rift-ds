"use client";

import { useLayoutEffect } from "react";
import { restoreDocumentTheme } from "@/lib/theme/restore-document-theme";

/**
 * Keeps the pre-paint script's work on <html> through a client re-render of
 * the root. When hydration fails high enough, React acquires <html> afresh
 * and strips every attribute on it, the ready mark included, which left
 * visitors a blank page with one line of hero copy showing. A layout effect
 * runs after that commit and before the browser paints it, so the restore
 * lands in the same frame. On a normal hydration the ready mark is still
 * there and this does nothing. Renders nothing; mounted once in the root
 * layout.
 */
export function DocumentThemeGuard() {
  useLayoutEffect(() => {
    restoreDocumentTheme();
  }, []);
  return null;
}
