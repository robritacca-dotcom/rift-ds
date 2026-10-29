"use client";

/**
 * The app-shell templates' top bar holder: it sticks to the top of whatever
 * scrolls (the page in the floating layout, the surface in the inset one)
 * and the content runs under it. Bare at rest; once the content leaves the
 * top, a fill in the scroller's colour covers the strip above the bar and
 * the site header's progressive blur and tint fade in behind it.
 * A sentinel above it says when, rather than window.scrollY, so it holds in
 * either scroller.
 */

import React from "react";
import { ProgressiveBlur } from "rift-ds/components/ProgressiveBlur/ProgressiveBlur";
import styles from "./TemplateShell.module.css";

export default function StickyTopBar({ children }: { children: React.ReactNode }) {
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const [tinted, setTinted] = React.useState(false);
  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => setTinted(!entry.isIntersecting));
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className={styles.topBarSentinel} aria-hidden="true" />
      <div className={styles.stickyTopBar} data-stuck={tinted ? "" : undefined}>
        <ProgressiveBlur className={styles.topBarBlur} tinted={tinted} />
        {children}
      </div>
    </>
  );
}
