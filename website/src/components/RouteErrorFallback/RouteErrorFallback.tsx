"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "rift-ds/components/Button/Button";
import { EmptyState } from "rift-ds/components/EmptyState/EmptyState";
import { Panel } from "rift-ds/components/Panel/Panel";
import MegaNav from "@/components/MegaNav/MegaNav";
import {
  FullBleedBackground,
  HiddenBackground,
} from "@/components/BlurBackground/BlurBackground";
import DotBackground from "@/components/DotBackground/DotBackground";
import { CHROMELESS_ROUTES } from "@/config/chromeless";
import { BASE_THEME_ID, LEGACY_BASE_THEME_ID } from "@/lib/theme/brand";
import styles from "./RouteErrorFallback.module.css";

/** The props Next hands an `error.tsx` boundary. */
export interface RouteErrorFallbackProps {
  /** The thrown error. In production a server-side throw arrives with a
      generic message and a `digest` that matches the server log. */
  error: Error & { digest?: string };
  /** Re-fetches and re-renders the boundary's segment. */
  retry: () => void;
  /** Which ground the card sits on. `stage` is the immersive surfaces'
      dotted canvas with the ambient background stood down; `page` is a
      chrome-bearing page's full-bleed ambient field under the site header.
      Left out, the route decides: a chromeless route gets the stage. */
  surface?: "stage" | "page";
}

/**
 * The recovery card every `error.tsx` renders. A runtime error inside a
 * route used to unmount the whole React root (a React error #185 thrown
 * from a playground drag on 2026-10-20 left a blank page with no chrome
 * and no way back); a boundary keeps the failure to the segment, and this
 * card gives the visitor the two moves that help: try the segment again,
 * or leave. The card is deliberately built from as little as possible: a
 * fallback that depends on the page's own furniture can throw the way the
 * page did.
 */
export default function RouteErrorFallback({
  error,
  retry,
  surface,
}: RouteErrorFallbackProps) {
  const pathname = usePathname() ?? "/";
  const onStage = surface ? surface === "stage" : CHROMELESS_ROUTES.has(pathname);

  useEffect(() => {
    // The dev overlay shows the error already; in production this is the
    // one place it reaches the console, beside the digest the server logged.
    console.error(error);
  }, [error]);

  /* The 500 shell. A page that throws during server rendering is served as
     Next's own error document, and the root layout then renders on the
     client, where its inline theme script (a React-rendered <script>) never
     runs: the visitor's theme is not applied and the ready mark that lifts
     the document's visibility:hidden never lands, so the card would be
     caught and invisible. This resolves both the way themeScript in
     app/layout.tsx does, and does nothing when that script already ran
     (a throw after hydration, the common case). */
  useEffect(() => {
    const root = document.documentElement;
    if (root.hasAttribute("data-theme-ready")) return;
    let saved: string | null = null;
    let brand: string | null = null;
    try {
      saved = localStorage.getItem("theme");
      brand = localStorage.getItem("brand");
    } catch {
      /* Private mode: the served theme stands. */
    }
    const setting = saved === "light" || saved === "dark" ? saved : "system";
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.setAttribute("data-theme-setting", setting);
    root.setAttribute("data-theme", setting === "system" ? (prefersDark ? "dark" : "light") : setting);
    if (brand === BASE_THEME_ID || brand === LEGACY_BASE_THEME_ID) root.removeAttribute("data-brand");
    else if (brand) root.setAttribute("data-brand", brand);
    root.setAttribute("data-theme-ready", "");
  }, []);

  const card = (
    <>
      <EmptyState
        icon="error"
        title="This page hit an error"
        description="The rest of the site is still running. Try the page again, or go back to the home page."
        action={
          <>
            <Button label="Try again" variant="primary" iconLeft="refresh" onClick={retry} />
            <Button label="Back to home" variant="secondary" iconLeft="arrow_back" href="/" />
          </>
        }
      />
      {error.digest && <p className={styles.reference}>Reference {error.digest}</p>}
    </>
  );

  if (onStage) {
    return (
      <main className={styles.stage} id="main-content">
        <HiddenBackground />
        <DotBackground />
        <Panel className={`${styles.panel} animate-in`}>{card}</Panel>
      </main>
    );
  }

  return (
    <>
      <FullBleedBackground />
      <MegaNav />
      <main className={styles.page} id="main-content">
        <div className={`${styles.content} animate-in`}>{card}</div>
      </main>
    </>
  );
}
