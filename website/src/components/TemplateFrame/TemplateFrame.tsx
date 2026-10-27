"use client";

/**
 * One template drawn live: the template's own page in a scaled, inert
 * same-origin iframe (BlurBackground detects the frame and drops its GL
 * context, and --layout-viewport-height is pinned so viewport-tall shells
 * get a fixed size) inside a bordered shell, with a link overlay that opens
 * it full screen. The frame mounts only once the shell nears the viewport
 * (see LIVE_MARGIN), because every preview is a whole app document. It
 * follows the site's theme and preset live, and in the phone it wears the
 * app dressing AppFrame owns. The templates carousel draws its previews
 * with it.
 */

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type React from "react";
import { APP_FRAME_ATTR } from "@/components/templates/AppFrame/AppFrame";
import styles from "./TemplateFrame.module.css";

/* The design viewports a template can be drawn at before scaling into
   its slide. Desktop is the 16:10 frame the covers use; tablet and
   mobile are common portrait devices, so the previews exercise the
   same breakpoints a real device would (the sidebar drawer included).
   The slide keeps the desktop frame's height at every size — narrower
   devices centre inside it like hardware on a stage. */
export const DEVICES = {
  desktop: { label: "Desktop", icon: "desktop_windows", w: 1440, h: 900 },
  tablet: { label: "Tablet", icon: "tablet_mac", w: 834, h: 1112 },
  mobile: { label: "Mobile", icon: "smartphone", w: 390, h: 844 },
} as const;
export type DeviceKey = keyof typeof DEVICES;

/* How far past its scroller's edges a frame counts as near enough to
   mount: what is visible plus the next one about to arrive, sideways in
   a carousel and vertically on a page. */
const LIVE_MARGIN = "25%";

export function TemplateFrame({
  href,
  title,
  device,
  rootRef,
  className = "",
}: {
  /** The template's route. */
  href: string;
  /** The template's name, for the frame title and the open link. */
  title: string;
  /** The device viewport the template is drawn at. */
  device: DeviceKey;
  /** The scroller the frame mounts against; the viewport when omitted. */
  rootRef?: React.RefObject<HTMLElement | null>;
  /** Extra class on the shell, for a host that reshapes the window. */
  className?: string;
}) {
  const { w: designW, h: designH } = DEVICES[device];
  /* The phone mockup's OS strips (54px status bar + 24px home bar),
     rendered inside the scaled device so the chrome shrinks with the
     screen. Geometry mirrors the playground chat stage's set dressing
     (ChatView.module.css owns the strip recipe). */
  const chromeH = device === "mobile" ? 78 : 0;
  const shellRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [live, setLive] = useState(false);

  /* Mount the frame as it nears the viewport (or its scroller's). A touch-first device
     also releases it once the slide is far again, because that is where
     memory is tight; elsewhere a loaded preview stays, so scrolling back
     never shows it reloading. */
  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const release = window.matchMedia("(hover: none)").matches;
    const observer = new IntersectionObserver(
      ([entry]) =>
        setLive((was) => (entry.isIntersecting ? true : release ? false : was)),
      { root: rootRef?.current ?? null, rootMargin: LIVE_MARGIN }
    );
    observer.observe(shell);
    return () => observer.disconnect();
  }, [rootRef]);

  /* The page inside follows the site's theme, live: same-origin, so the
     board's applyTheme pattern reaches straight into the document. The
     preview is a snapshot, not a scroll container, so its own scrollbar is
     hidden too (the frame is inert either way). */
  const sync = useCallback(() => {
    const doc = frameRef.current?.contentDocument;
    if (!doc) return;
    const theme = document.documentElement.getAttribute("data-theme") ?? "dark";
    doc.documentElement.setAttribute("data-theme", theme);
    /* The theme preset rides along the same way: mirror data-brand into the
       frame (and its absence — "default" is the attribute removed), so a
       pick from the header or the hero re-themes every live preview too. */
    const brand = document.documentElement.getAttribute("data-brand");
    if (brand) doc.documentElement.setAttribute("data-brand", brand);
    else doc.documentElement.removeAttribute("data-brand");
    doc.documentElement.style.setProperty(
      "--layout-viewport-height",
      `${designH}px`
    );
    doc.documentElement.style.overflow = "hidden";
    /* In the phone, the template previews as an app: its top app bar and
       tab bar in place of the web top bar and sidebar (AppFrame owns the
       dressing; the full template page never carries the flag). */
    if (device === "mobile") doc.documentElement.setAttribute(APP_FRAME_ATTR, "");
    else doc.documentElement.removeAttribute(APP_FRAME_ATTR);
    /* The preview is a picture, not a scroll surface: inner scroll
       areas (a DataTable's wrapper, the Gantt's track) keep working in
       the real page but their bars are noise at postage-stamp scale —
       hide every scrollbar inside the frame. */
    if (!doc.getElementById("preview-scrollbars")) {
      const style = doc.createElement("style");
      style.id = "preview-scrollbars";
      style.textContent =
        "*{scrollbar-width:none}*::-webkit-scrollbar{display:none}";
      doc.head.appendChild(style);
    }
  }, [designH, device]);

  useEffect(() => {
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-brand"],
    });
    return () => observer.disconnect();
  }, [sync]);

  /* The frame is drawn at the device size and scaled to fit the shell's
     height (the shell holds the desktop frame's aspect at every device,
     so a host's geometry never jumps). */
  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const observer = new ResizeObserver(() => {
      /* Device modes float on the dotted stage with safe padding all
         round; desktop fills the shell edge to edge as before. */
      const pad = device === "desktop" ? 0 : 24;
      shell.style.setProperty(
        "--frame-scale",
        `${(shell.clientHeight - pad * 2) / (designH + chromeH)}`
      );
    });
    observer.observe(shell);
    return () => observer.disconnect();
  }, [designH, chromeH, device]);

  return (
    <div
      ref={shellRef}
      className={`${styles.frameShell} ${device !== "desktop" ? styles.frameShellDevice : ""} ${className}`}
      style={{ "--design-w": `${designW}px`, "--design-h": `${designH}px` } as React.CSSProperties}
    >
      {device === "mobile" ? (
        /* The phone mockup: OS chrome above and below the app, the whole
           device scaled as one so the strips shrink with the screen. */
        <div className={styles.phoneMock}>
          <div className={styles.phoneMockInner}>
            <div className={styles.mockStatusBar} aria-hidden="true">
              <span className={styles.mockStatusTime}>9:41</span>
              <span className={styles.mockStatusIcons}>
                <span className="material-symbols-rounded">signal_cellular_alt</span>
                <span className="material-symbols-rounded">wifi</span>
                <span className="material-symbols-rounded">battery_full</span>
              </span>
            </div>
            <div className={styles.mockScreen}>
              {live && (
                <iframe
                  ref={frameRef}
                  src={href}
                  title={title}
                  className={styles.frame}
                  tabIndex={-1}
                  onLoad={sync}
                />
              )}
            </div>
            <div className={styles.mockHomeBar} aria-hidden="true">
              <span className={styles.mockHomeIndicator} />
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.frameViewport}>
          {live && (
            <iframe
              ref={frameRef}
              src={href}
              title={title}
              className={styles.frame}
              tabIndex={-1}
              onLoad={sync}
            />
          )}
        </div>
      )}
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.frameLink}
        aria-label={`Open the ${title.toLowerCase()} template in a new tab`}
      />
    </div>
  );
}
