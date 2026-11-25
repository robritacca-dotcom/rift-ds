"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import styles from "./PageLinks.module.css";

/**
 * The page links' row, which sheds its labels before it wraps. Beside a
 * title it shows the labelled buttons while they fit on the title's line,
 * their icons alone when only those fit, and lets the row wrap them under
 * the title only when even the icons do not (`data-compact`). The labelled
 * width is read while the labels show and kept, so the choice never
 * oscillates as the row narrows. A row with no title beside it never
 * sheds; on a phone the stylesheet draws the icons from the first paint.
 */
export default function PageLinksRow({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);

  useLayoutEffect(() => {
    const links = ref.current;
    const row = links?.parentElement;
    const title = row ? [...row.children].find((child) => child !== links) : undefined;
    if (!links || !row || !title) return;
    let full = 0;
    const range = document.createRange();
    const check = () => {
      if (!links.hasAttribute("data-compact")) full = links.scrollWidth;
      if (!full) return;
      const style = getComputedStyle(row);
      const room = row.clientWidth - parseFloat(style.paddingInlineStart) - parseFloat(style.paddingInlineEnd);
      range.selectNodeContents(title);
      const titleWidth = range.getBoundingClientRect().width;
      const gap = parseFloat(style.columnGap) || 0;
      setCompact(titleWidth + gap + full > room);
    };
    const observer = new ResizeObserver(check);
    observer.observe(row);
    observer.observe(title);
    check();
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={styles.pageLinks} data-compact={compact ? "" : undefined}>
      {children}
    </div>
  );
}
