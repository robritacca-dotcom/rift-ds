"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@robr0/design-system/components/Button/Button";
import { MOTION_FEEDBACK_RESET_MS } from "@robr0/design-system/tokens/motion";
import styles from "./CopyPageMarkdown.module.css";

/**
 * The "copy for agents" action on component docs pages. Every public
 * component has a generated markdown page at /components/<slug>.md (see
 * scripts/generate-component-md.mjs); this button copies it to the
 * clipboard so a visitor can hand their agent the prop contract. Rendered
 * unconditionally by PageLinks and self-gated: it only appears on
 * /components/<slug> routes, where the file is guaranteed to exist.
 */
export default function CopyPageMarkdown() {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const match = pathname?.match(/^\/components\/([a-z0-9-]+)$/);
  if (!match) return null;
  const markdownUrl = `/components/${match[1]}.md`;

  const copy = async () => {
    try {
      const response = await fetch(markdownUrl);
      if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
      await navigator.clipboard.writeText(await response.text());
      // Freeze the current width before the label shortens to "Copied",
      // so the button doesn't shrink under the cursor.
      if (buttonRef.current) {
        buttonRef.current.style.minWidth = `${buttonRef.current.offsetWidth}px`;
      }
      setCopied(true);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setCopied(false), MOTION_FEEDBACK_RESET_MS);
    } catch {
      // No clipboard (or a failed fetch): show the file instead.
      window.open(markdownUrl, "_blank", "noopener");
    }
  };

  // Both glyphs stay mounted, stacked in one grid cell, so flipping
  // data-copied crossfades them (blur + scale) instead of hard-swapping.
  const swapIcon = (
    <span className={styles.iconSwap} data-copied={copied || undefined}>
      <span className={`material-symbols-rounded ${styles.iconGlyph} ${styles.iconCopy}`}>
        content_copy
      </span>
      <span className={`material-symbols-rounded ${styles.iconGlyph} ${styles.iconCheck}`}>
        check
      </span>
    </span>
  );

  return (
    <Button
      ref={buttonRef}
      label={copied ? "Copied" : "Copy for agents"}
      variant="tertiary"
      size="compact"
      iconLeft={swapIcon}
      onClick={copy}
    />
  );
}
