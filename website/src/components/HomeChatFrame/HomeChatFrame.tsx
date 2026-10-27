"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { readBrand } from "@/lib/theme/brand";
import { EMBED_THEME_MESSAGE } from "./embed-theme";
import styles from "./HomeChatFrame.module.css";

/* ============================================
   The home page's window onto the playground: the Chat view, framed and
   scaled down, playing its scripted reel on a loop (?autoplay=1 mounts
   the playground's ChatAutoplay). The frame is a picture, not a second
   app: it takes no pointer, focus or assistive-tech attention, and the
   whole of it is one link into the real Chat view.

   The page inside renders at a fixed desktop footprint and is scaled to
   the frame's width, so it lays out as the playground does on a laptop
   rather than collapsing to its compact drawer. A narrow frame switches
   to a phone footprint instead, where the compact layout is the honest
   one.

   The embed follows the page: a theme pick or a colour-mode flip here is
   posted into the frame, where the playground applies it to its levers.
   ============================================ */

const EMBED_SRC = "/playground?view=chat&autoplay=1";
const TARGET_HREF = "/playground?view=chat";

/* Review footprints for the page inside, not layout tokens. */
const DESKTOP = { w: 1440, h: 900 };
const PHONE = { w: 390, h: 760 };
/* Below this frame width the desktop footprint scales past legibility. */
const PHONE_BELOW = 640;

export default function HomeChatFrame() {
  const frameRef = useRef<HTMLAnchorElement>(null);
  const embedRef = useRef<HTMLIFrameElement>(null);
  const [width, setWidth] = useState(0);

  /* Posts the page's current look into the embed. */
  const postTheme = () => {
    const root = document.documentElement;
    embedRef.current?.contentWindow?.postMessage(
      {
        type: EMBED_THEME_MESSAGE,
        brand: readBrand(),
        mode: root.getAttribute("data-theme") ?? undefined,
        setting: root.getAttribute("data-theme-setting") ?? undefined,
      },
      window.location.origin
    );
  };

  useEffect(() => {
    const observer = new MutationObserver(postTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-brand", "data-theme", "data-theme-setting"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const footprint = width > 0 && width < PHONE_BELOW ? PHONE : DESKTOP;
  const scale = width > 0 ? width / footprint.w : 0;

  return (
    <Link
      ref={frameRef}
      href={TARGET_HREF}
      className={styles.frame}
      style={{ aspectRatio: `${footprint.w} / ${footprint.h}` }}
      aria-label="Open the AI chat playground"
    >
      {scale > 0 && (
        <iframe
          ref={embedRef}
          key={footprint.w}
          src={EMBED_SRC}
          onLoad={postTheme}
          title="AI chat playground preview"
          className={styles.embed}
          width={footprint.w}
          height={footprint.h}
          style={{ transform: `scale(${scale})` }}
          tabIndex={-1}
          aria-hidden="true"
          inert
        />
      )}
      <span className={styles.cta} aria-hidden="true">
        Open the chat playground
        <span className={`material-symbols-rounded ${styles.ctaIcon}`}>arrow_forward</span>
      </span>
    </Link>
  );
}
