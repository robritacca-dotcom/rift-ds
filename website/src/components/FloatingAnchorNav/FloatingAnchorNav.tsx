"use client";

import { useEffect, useState } from "react";
import { AnchorNav } from "@robr0/design-system/components/AnchorNav/AnchorNav";
import type { AnchorNavItem } from "@robr0/design-system/components/AnchorNav/AnchorNav";
import styles from "./FloatingAnchorNav.module.css";

/* The site's mount for AnchorNav's floating variant: fixed to the right
   viewport edge, vertically centred, hidden below the desktop breakpoint.
   Pages render this instead of reserving a rail column, so the content
   keeps its full width and the nav rides on top as a minimap.

   The scroll-tracking offset is read from --layout-anchor-clearance (the
   shared anchor-landing geometry in globals.css) after mount, so the
   highlight and scroll-margin-top can never disagree about where a
   section "arrives". */

export default function FloatingAnchorNav({ items }: { items: AnchorNavItem[] }) {
  const [offset, setOffset] = useState<number | undefined>(undefined);

  useEffect(() => {
    const clearance = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--layout-anchor-clearance"
      )
    );
    // One post-mount read of a CSS variable no render depends on — the
    // offset only tunes the scroll listener, so no cascade follows
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!Number.isNaN(clearance)) setOffset(clearance);
  }, []);

  return (
    <div className={styles.rail}>
      <AnchorNav variant="floating" items={items} offset={offset} />
    </div>
  );
}
