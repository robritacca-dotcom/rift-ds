"use client";

import { useEffect, useRef } from "react";
import styles from "./KeyboardLab.module.css";

/* The modes globals.css knows, keyed by the `?kb=` value. */
const MODES = new Set(["vv", "dvh", "vv-flat", "fixed"]);
const STORAGE_KEY = "rr:kb-lab";

/**
 * A temporary experiment for the phone takeover under the iOS soft keyboard.
 * `?kb=<mode>` picks how the panel is sized (globals.css owns the modes) and
 * shows a live readout of the viewport numbers; `?kb=off` ends it. The choice
 * survives navigation for the tab, so a mode can be tried across pages.
 * Without the parameter it does nothing: no attribute, no readout.
 */
export function KeyboardLab() {
  const readoutRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    let mode: string | null = null;
    try {
      const param = new URLSearchParams(window.location.search).get("kb");
      if (param === "off") sessionStorage.removeItem(STORAGE_KEY);
      else if (param && MODES.has(param)) sessionStorage.setItem(STORAGE_KEY, param);
      mode = sessionStorage.getItem(STORAGE_KEY);
    } catch {
      mode = null;
    }
    if (!mode) return;
    root.setAttribute("data-kb", mode);

    const vv = window.visualViewport;
    let frame = 0;
    const paint = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const panel = document.getElementById("ds-chat-panel");
        const box = panel?.getBoundingClientRect();
        const lines = [
          `mode     ${mode}`,
          `inner    ${window.innerHeight}`,
          `vv.h     ${vv ? Math.round(vv.height) : "n/a"}`,
          `vv.top   ${vv ? Math.round(vv.offsetTop) : "n/a"}`,
          `scrollY  ${Math.round(window.scrollY)}`,
          `doc.h    ${document.documentElement.scrollHeight}`,
          `panel    ${box ? `${Math.round(box.top)} → ${Math.round(box.bottom)}` : "closed"}`,
        ];
        if (readoutRef.current) readoutRef.current.textContent = lines.join("\n");
      });
    };
    paint();
    vv?.addEventListener("resize", paint);
    vv?.addEventListener("scroll", paint);
    window.addEventListener("scroll", paint);
    document.addEventListener("focusin", paint);
    return () => {
      cancelAnimationFrame(frame);
      vv?.removeEventListener("resize", paint);
      vv?.removeEventListener("scroll", paint);
      window.removeEventListener("scroll", paint);
      document.removeEventListener("focusin", paint);
      root.removeAttribute("data-kb");
    };
  }, []);

  return <pre ref={readoutRef} className={styles.readout} aria-hidden="true" />;
}
