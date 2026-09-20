"use client";

import { useEffect, useState } from "react";
import styles from "./ScrollCue.module.css";

/* Once the reader has scrolled this far, the invitation has done its job —
   fade the cue out. Scrolling back above the threshold brings it back. */
const HIDE_THRESHOLD_PX = 120;

export interface ScrollCueProps {
  /** Anchor the cue smooth-scrolls to, e.g. "#home-sections". */
  href: string;
  /** Accessible label for the icon-only link. */
  "aria-label": string;
  className?: string;
}

export default function ScrollCue({
  href,
  "aria-label": ariaLabel,
  className,
}: ScrollCueProps) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => setHidden(window.scrollY > HIDE_THRESHOLD_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* The wrapper owns the positioning and carries any entrance classes
     (globals' .animate-in fills forwards on opacity and transform, so it
     must not share an element with the scroll-linked fade below). */
  return (
    <span className={[styles.scrollCueSlot, className].filter(Boolean).join(" ")}>
      <a
        href={href}
        aria-label={ariaLabel}
        aria-hidden={hidden || undefined}
        tabIndex={hidden ? -1 : undefined}
        className={
          hidden ? `${styles.scrollCue} ${styles.scrollCueHidden}` : styles.scrollCue
        }
      >
        <span className="material-symbols-rounded" aria-hidden="true">
          keyboard_arrow_down
        </span>
      </a>
    </span>
  );
}
